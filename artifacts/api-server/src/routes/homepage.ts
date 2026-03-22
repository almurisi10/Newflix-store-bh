import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, homepageSectionsTable } from "@workspace/db";
import {
  ListHomepageSectionsResponse,
  UpdateHomepageSectionsBody,
  UpdateHomepageSectionsResponse,
} from "@workspace/api-zod";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/homepage/sections", async (_req, res): Promise<void> => {
  const sections = await db.select().from(homepageSectionsTable).orderBy(homepageSectionsTable.sortOrder);
  res.json(ListHomepageSectionsResponse.parse(sections));
});

router.post("/homepage/sections/create", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  try {
    const { sectionType, titleAr, titleEn, subtitleAr, subtitleEn, active, sortOrder, config } = req.body;
    if (!sectionType || typeof sectionType !== 'string') {
      res.status(400).json({ error: "sectionType is required" });
      return;
    }
    const [section] = await db.insert(homepageSectionsTable).values({
      sectionType,
      titleAr: titleAr || null,
      titleEn: titleEn || null,
      subtitleAr: subtitleAr || null,
      subtitleEn: subtitleEn || null,
      active: active !== false,
      sortOrder: sortOrder || 0,
      config: config || {},
    }).returning();
    res.status(201).json(section);
  } catch {
    res.status(500).json({ error: "Failed to create section" });
  }
});

router.put("/homepage/sections", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const parsed = UpdateHomepageSectionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  for (const section of parsed.data) {
    const updateData: any = {};
    if (section.titleAr !== undefined) updateData.titleAr = section.titleAr;
    if (section.titleEn !== undefined) updateData.titleEn = section.titleEn;
    if (section.subtitleAr !== undefined) updateData.subtitleAr = section.subtitleAr;
    if (section.subtitleEn !== undefined) updateData.subtitleEn = section.subtitleEn;
    if (section.active !== undefined) updateData.active = section.active;
    if (section.sortOrder !== undefined) updateData.sortOrder = section.sortOrder;
    if (section.config !== undefined) updateData.config = section.config;

    await db.update(homepageSectionsTable).set(updateData).where(eq(homepageSectionsTable.id, section.id));
  }

  const updated = await db.select().from(homepageSectionsTable).orderBy(homepageSectionsTable.sortOrder);
  res.json(UpdateHomepageSectionsResponse.parse(updated));
});

router.delete("/homepage/sections/:id", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid section ID" });
      return;
    }
    const deleted = await db.delete(homepageSectionsTable).where(eq(homepageSectionsTable.id, id)).returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete section" });
  }
});

export default router;
