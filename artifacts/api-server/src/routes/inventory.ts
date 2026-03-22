import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, inventoryItemsTable, productsTable } from "@workspace/db";
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

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(inventoryItemsTable)
    .where(and(eq(inventoryItemsTable.productId, params.data.productId), eq(inventoryItemsTable.status, "available")));

  await db.update(productsTable).set({ stock: countResult?.count ?? 0 }).where(eq(productsTable.id, params.data.productId));

  res.status(201).json({ addedCount: body.data.items.length });
});

export default router;
