import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, homepageSectionsTable } from "@workspace/db";
import {
  ListHomepageSectionsResponse,
  UpdateHomepageSectionsBody,
  UpdateHomepageSectionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/homepage/sections", async (_req, res): Promise<void> => {
  const sections = await db.select().from(homepageSectionsTable).orderBy(homepageSectionsTable.sortOrder);
  res.json(ListHomepageSectionsResponse.parse(sections));
});

router.put("/homepage/sections", async (req, res): Promise<void> => {
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

export default router;
