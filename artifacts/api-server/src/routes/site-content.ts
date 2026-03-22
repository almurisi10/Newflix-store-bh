import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, siteContentTable, adminActivityLogsTable } from "@workspace/db";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/site-content", async (req, res): Promise<void> => {
  const { page } = req.query;
  let query = db.select().from(siteContentTable);
  let results;
  if (page && typeof page === "string") {
    results = await query.where(eq(siteContentTable.page, page));
  } else {
    results = await query;
  }
  res.json(results);
});

router.get("/site-content/:key", async (req, res): Promise<void> => {
  const [content] = await db.select().from(siteContentTable).where(eq(siteContentTable.contentKey, req.params.key!));
  if (!content) {
    res.status(404).json({ error: "Content not found" });
    return;
  }
  res.json(content);
});

router.put("/site-content/:key", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const { valueAr, valueEn, styles } = req.body;
  const key = req.params.key!;

  const [existing] = await db.select().from(siteContentTable).where(eq(siteContentTable.contentKey, key));
  if (!existing) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const updateData: any = { updatedAt: new Date(), updatedBy: req.adminUser?.email };
  if (valueAr !== undefined) updateData.valueAr = valueAr;
  if (valueEn !== undefined) updateData.valueEn = valueEn;
  if (styles !== undefined) updateData.styles = styles;

  const [updated] = await db.update(siteContentTable)
    .set(updateData)
    .where(eq(siteContentTable.contentKey, key))
    .returning();

  await db.insert(adminActivityLogsTable).values({
    adminEmail: req.adminUser?.email || "unknown",
    action: "update_content",
    entityType: "site_content",
    entityId: key,
    details: { valueAr, valueEn, styles },
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  res.json(updated);
});

router.post("/site-content", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const { contentKey, page, section, valueAr, valueEn, contentType, styles } = req.body;

  if (!contentKey || !page) {
    res.status(400).json({ error: "contentKey and page are required" });
    return;
  }

  const existing = await db.select().from(siteContentTable).where(eq(siteContentTable.contentKey, contentKey));
  if (existing.length > 0) {
    res.status(409).json({ error: "Content key already exists" });
    return;
  }

  const [created] = await db.insert(siteContentTable).values({
    contentKey,
    page,
    section: section || "general",
    valueAr: valueAr || "",
    valueEn: valueEn || "",
    contentType: contentType || "text",
    styles: styles || {},
    updatedBy: req.adminUser?.email,
  }).returning();

  await db.insert(adminActivityLogsTable).values({
    adminEmail: req.adminUser?.email || "unknown",
    action: "create_content",
    entityType: "site_content",
    entityId: contentKey,
    details: { page, section },
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  res.status(201).json(created);
});

router.post("/site-content/bulk", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: "items array is required" });
    return;
  }

  const results = [];
  for (const item of items) {
    const { contentKey, valueAr, valueEn, styles } = item;
    if (!contentKey) continue;

    const [existing] = await db.select().from(siteContentTable).where(eq(siteContentTable.contentKey, contentKey));
    if (existing) {
      const updateData: any = { updatedAt: new Date(), updatedBy: req.adminUser?.email };
      if (valueAr !== undefined) updateData.valueAr = valueAr;
      if (valueEn !== undefined) updateData.valueEn = valueEn;
      if (styles !== undefined) updateData.styles = styles;
      const [updated] = await db.update(siteContentTable).set(updateData).where(eq(siteContentTable.contentKey, contentKey)).returning();
      results.push(updated);
    }
  }

  await db.insert(adminActivityLogsTable).values({
    adminEmail: req.adminUser?.email || "unknown",
    action: "bulk_update_content",
    entityType: "site_content",
    entityId: "bulk",
    details: { count: results.length },
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  res.json(results);
});

export default router;
