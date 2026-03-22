import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, pool, inventoryItemsTable, productsTable, ordersTable } from "@workspace/db";
import {
  ListInventoryItemsParams,
  ListInventoryItemsQueryParams,
  ListInventoryItemsResponse,
  AddInventoryItemsParams,
  AddInventoryItemsBody,
} from "@workspace/api-zod";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/inventory/:productId", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const params = ListInventoryItemsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = ListInventoryItemsQueryParams.safeParse(req.query);
  const status = query.success ? query.data.status : undefined;

  const conditions: any[] = [eq(inventoryItemsTable.productId, params.data.productId)];
  if (status) conditions.push(eq(inventoryItemsTable.status, status));

  const items = await db.select().from(inventoryItemsTable).where(and(...conditions));
  res.json(ListInventoryItemsResponse.parse(items));
});

router.post("/inventory/:productId", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const params = AddInventoryItemsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AddInventoryItemsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const values = body.data.items.map((data: string) => ({
    productId: params.data.productId,
    data,
    status: "available" as const,
  }));

  await db.insert(inventoryItemsTable).values(values);

  const fulfilledOrders = await autoFulfillPendingOrders(params.data.productId);

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(inventoryItemsTable)
    .where(and(eq(inventoryItemsTable.productId, params.data.productId), eq(inventoryItemsTable.status, "available")));

  await db.update(productsTable).set({ stock: countResult?.count ?? 0 }).where(eq(productsTable.id, params.data.productId));

  res.status(201).json({ addedCount: body.data.items.length, autoFulfilledOrders: fulfilledOrders });
});

async function autoFulfillPendingOrders(productId: number): Promise<number[]> {
  const paidOrders = await db.select().from(ordersTable)
    .where(eq(ordersTable.status, "paid"))
    .orderBy(sql`created_at ASC`);

  const fulfilledOrderIds = new Set<number>();

  for (const order of paidOrders) {
    const items = order.items as any[];
    const relevantItems = items.filter((item: any) => item.productId === productId);
    if (relevantItems.length === 0) continue;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const item of relevantItems) {
        const requestedQty = item.quantity || 1;

        const countRes = await client.query(
          `SELECT count(*)::int AS cnt FROM inventory_items WHERE product_id = $1 AND order_id = $2 AND status = 'delivered'`,
          [productId, order.id]
        );
        const alreadyDelivered = countRes.rows[0]?.cnt ?? 0;
        const needed = requestedQty - alreadyDelivered;

        if (needed <= 0) continue;

        let assigned = 0;
        for (let i = 0; i < needed; i++) {
          const result = await client.query(
            `UPDATE inventory_items
             SET status = 'delivered', order_id = $1, delivered_at = NOW()
             WHERE id = (
               SELECT id FROM inventory_items
               WHERE product_id = $2 AND status = 'available'
               LIMIT 1
               FOR UPDATE SKIP LOCKED
             )
             RETURNING *`,
            [order.id, productId]
          );
          if (result.rows.length === 0) break;
          assigned++;
        }

        if (assigned > 0) {
          fulfilledOrderIds.add(order.id);
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Auto-fulfill error for order ${order.id}:`, err);
    } finally {
      client.release();
    }
  }

  return Array.from(fulfilledOrderIds);
}

export default router;
