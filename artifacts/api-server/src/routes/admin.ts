import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, productsTable, categoriesTable, ordersTable } from "@workspace/db";
import { GetAdminStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
  const [categoryCount] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [paidOrderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable).where(eq(ordersTable.status, "paid"));
  const [revenueResult] = await db.select({ total: sql<number>`COALESCE(SUM(total), 0)::real` }).from(ordersTable).where(eq(ordersTable.status, "paid"));
  const [lowStock] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(sql`${productsTable.stock} > 0 AND ${productsTable.stock} <= 5`);
  const [outOfStock] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.stock, 0));

  const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const bestSelling = await db.select().from(productsTable).where(eq(productsTable.bestseller, true)).limit(5);

  const ordersByStatus = await db.select({
    status: ordersTable.status,
    count: sql<number>`count(*)::int`,
  }).from(ordersTable).groupBy(ordersTable.status);

  res.json(GetAdminStatsResponse.parse({
    totalProducts: productCount?.count ?? 0,
    totalCategories: categoryCount?.count ?? 0,
    totalOrders: orderCount?.count ?? 0,
    totalPaidOrders: paidOrderCount?.count ?? 0,
    totalRevenue: revenueResult?.total ?? 0,
    lowStockProducts: lowStock?.count ?? 0,
    outOfStockProducts: outOfStock?.count ?? 0,
    recentOrders,
    bestSellingProducts: bestSelling,
    ordersByStatus,
  }));
});

export default router;
