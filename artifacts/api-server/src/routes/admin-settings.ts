import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, adminSettingsTable, adminActivityLogsTable } from "@workspace/db";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/admin-settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(adminSettingsTable);
  const mapped: Record<string, any> = {};
  for (const s of settings) {
    mapped[s.settingKey] = s.settingValue;
  }
  res.json(mapped);
});

router.get("/admin-settings/:key", async (req, res): Promise<void> => {
  const [setting] = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.settingKey, req.params.key!));
  if (!setting) {
    res.json({ value: null });
    return;
  }
  res.json(setting.settingValue);
});

router.put("/admin-settings/:key", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const key = req.params.key!;
  const { value } = req.body;

  const [existing] = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.settingKey, key));

  if (existing) {
    await db.update(adminSettingsTable).set({
      settingValue: value,
      updatedAt: new Date(),
      updatedBy: req.adminUser?.email,
    }).where(eq(adminSettingsTable.settingKey, key));
  } else {
    await db.insert(adminSettingsTable).values({
      settingKey: key,
      settingValue: value,
      updatedBy: req.adminUser?.email,
    });
  }

  await db.insert(adminActivityLogsTable).values({
    adminEmail: req.adminUser?.email || "unknown",
    action: "update_setting",
    entityType: "admin_setting",
    entityId: key,
    details: { value },
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  res.json({ key, value });
});

router.get("/admin-activity-logs", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = parseInt(req.query.offset as string) || 0;

  const logs = await db.select().from(adminActivityLogsTable)
    .orderBy(desc(adminActivityLogsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(logs);
});

export default router;
