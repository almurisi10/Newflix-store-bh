import { Router, type IRouter } from "express";
import { eq, desc, asc, sql, ilike, and, gte, lte } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, search, minPrice, maxPrice, featured, bestseller, hasDiscount, sortBy, page = 1, limit = 20 } = query.data;

  const conditions: any[] = [];
  conditions.push(eq(productsTable.active, true));

  if (search) {
    conditions.push(
      sql`(${ilike(productsTable.titleAr, `%${search}%`)} OR ${ilike(productsTable.titleEn, `%${search}%`)})`
    );
  }
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, maxPrice));
  if (featured) conditions.push(eq(productsTable.featured, true));
  if (bestseller) conditions.push(eq(productsTable.bestseller, true));
  if (hasDiscount) conditions.push(sql`${productsTable.discount} IS NOT NULL AND ${productsTable.discount} > 0`);
  if (category) {
    conditions.push(sql`${productsTable.categoryIds}::jsonb @> ${JSON.stringify([parseInt(category)])}::jsonb`);
  }

  let orderBy: any = desc(productsTable.createdAt);
  if (sortBy === "price_asc") orderBy = asc(productsTable.price);
  else if (sortBy === "price_desc") orderBy = desc(productsTable.price);
  else if (sortBy === "newest") orderBy = desc(productsTable.createdAt);

  const offset = (page - 1) * limit;

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  res.json(ListProductsResponse.parse({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = {
    ...parsed.data,
    gallery: parsed.data.gallery ?? [],
    categoryIds: parsed.data.categoryIds ?? [],
    tags: parsed.data.tags ?? [],
    badges: parsed.data.badges ?? [],
    featured: parsed.data.featured ?? false,
    bestseller: parsed.data.bestseller ?? false,
    active: parsed.data.active ?? true,
    stock: parsed.data.stock ?? 0,
  };
  const [product] = await db.insert(productsTable).values(data).returning();
  res.status(201).json(GetProductResponse.parse(product));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [product] = await db.update(productsTable).set(body.data).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
