import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, ordersTable, productsTable, inventoryItemsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  ConfirmPaymentParams,
  ConfirmPaymentResponse,
  ListUserOrdersQueryParams,
  ListUserOrdersResponse,
  GetOrderDeliveryParams,
  GetOrderDeliveryResponse,
} from "@workspace/api-zod";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/orders", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { status, userId, page = 1, limit = 20 } = query.data;
  const conditions: any[] = [];
  if (status) conditions.push(eq(ordersTable.status, status));
  if (userId) conditions.push(eq(ordersTable.firebaseUid, userId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  res.json(ListOrdersResponse.parse({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orderItems: any[] = [];
  let subtotal = 0;

  for (const item of parsed.data.items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }

    const effectivePrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    subtotal += effectivePrice * item.quantity;

    orderItems.push({
      productId: product.id,
      titleAr: product.titleAr,
      titleEn: product.titleEn,
      price: effectivePrice,
      quantity: item.quantity,
      mainImage: product.mainImage,
    });
  }

  let discountAmount = 0;
  if (parsed.data.couponCode) {
    const { couponsTable } = await import("@workspace/db");
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, parsed.data.couponCode));
    if (coupon && coupon.active) {
      if (coupon.discountType === "percentage") {
        discountAmount = subtotal * (coupon.discountValue / 100);
      } else {
        discountAmount = coupon.discountValue;
      }
      await db.update(couponsTable).set({ usedCount: coupon.usedCount + 1 }).where(eq(couponsTable.id, coupon.id));
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  let order: any;
  let attempts = 0;
  while (attempts < 5) {
    try {
      const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
      const seq = String((countResult?.count || 0) + 1 + attempts).padStart(4, '0');
      const orderNumber = `NEWFLIX-${dateStr}-${seq}`;

      [order] = await db.insert(ordersTable).values({
        orderNumber,
        firebaseUid: parsed.data.firebaseUid,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        items: orderItems,
        subtotal,
        discount: discountAmount,
        total,
        couponCode: parsed.data.couponCode,
        status: "pending",
        notes: parsed.data.notes,
      }).returning();
      break;
    } catch (err: any) {
      attempts++;
      if (attempts >= 5 || !err?.message?.includes('unique')) {
        res.status(500).json({ error: "Failed to create order" });
        return;
      }
    }
  }

  res.status(201).json(order);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:id", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [order] = await db.update(ordersTable).set({ status: body.data.status }).where(eq(ordersTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderStatusResponse.parse(order));
});

router.post("/orders/:id/confirm-payment", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const params = ConfirmPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = order.items as any[];
  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) continue;

    if (["code", "account", "link"].includes(product.productType)) {
      for (let i = 0; i < item.quantity; i++) {
        const [inventoryItem] = await db.update(inventoryItemsTable)
          .set({ status: "delivered", orderId: order.id, deliveredAt: new Date() })
          .where(and(
            eq(inventoryItemsTable.productId, product.id),
            eq(inventoryItemsTable.status, "available")
          ))
          .returning();

        if (!inventoryItem) {
          req.log.warn({ productId: product.id }, "No available inventory item");
        }
      }

      const availableCount = await db.select({ count: sql<number>`count(*)::int` })
        .from(inventoryItemsTable)
        .where(and(eq(inventoryItemsTable.productId, product.id), eq(inventoryItemsTable.status, "available")));
      await db.update(productsTable).set({ stock: availableCount[0]?.count ?? 0 }).where(eq(productsTable.id, product.id));
    }
  }

  const [updatedOrder] = await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, params.data.id)).returning();
  res.json(ConfirmPaymentResponse.parse(updatedOrder));
});

router.get("/user/orders", async (req, res): Promise<void> => {
  const query = ListUserOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.firebaseUid, query.data.firebaseUid)).orderBy(desc(ordersTable.createdAt));
  res.json(ListUserOrdersResponse.parse(orders));
});

router.get("/user/orders/:id/delivery", async (req, res): Promise<void> => {
  const params = GetOrderDeliveryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const requestUid = req.query.firebaseUid as string || req.headers["x-firebase-uid"] as string;
  if (!requestUid) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (order.firebaseUid !== requestUid) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  if (order.status !== "paid" && order.status !== "delivered") {
    res.status(403).json({ error: "Order not paid" });
    return;
  }

  const deliveryItems: any[] = [];
  const items = order.items as any[];

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) continue;

    if (product.deliveryMode === "single_code" && product.singleCodeValue) {
      deliveryItems.push({
        productId: product.id,
        titleAr: product.titleAr,
        titleEn: product.titleEn,
        productType: product.productType,
        deliveryData: product.singleCodeValue,
        deliveredAt: order.updatedAt?.toISOString() ?? new Date().toISOString(),
      });
    } else if (product.deliveryMode === "whatsapp_manual") {
      deliveryItems.push({
        productId: product.id,
        titleAr: product.titleAr,
        titleEn: product.titleEn,
        productType: product.productType,
        deliveryData: "WHATSAPP_DELIVERY",
        deliveredAt: order.updatedAt?.toISOString() ?? new Date().toISOString(),
      });
    } else {
      const inventoryItems = await db.select().from(inventoryItemsTable)
        .where(and(
          eq(inventoryItemsTable.productId, product.id),
          eq(inventoryItemsTable.orderId, order.id),
          eq(inventoryItemsTable.status, "delivered")
        ));

      for (const inv of inventoryItems) {
        deliveryItems.push({
          productId: product.id,
          titleAr: product.titleAr,
          titleEn: product.titleEn,
          productType: product.productType,
          deliveryData: inv.hidden ? "HIDDEN_BY_ADMIN" : inv.data,
          hidden: inv.hidden,
          deliveredAt: inv.deliveredAt?.toISOString() ?? new Date().toISOString(),
        });
      }
    }
  }

  res.json(deliveryItems);
});

export default router;
