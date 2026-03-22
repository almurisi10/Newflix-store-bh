import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import {
  ValidateCouponBody,
  ValidateCouponResponse,
} from "@workspace/api-zod";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

router.get("/coupons", requireAdmin as any, async (_req: AdminRequest, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
  res.json(coupons);
});

router.post("/coupons", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const { code, descriptionAr, descriptionEn, discountType, discountValue, minOrderAmount, maxUses, active, expiresAt } = req.body;
  if (!code || !discountValue) {
    res.status(400).json({ error: "Code and discount value are required" });
    return;
  }
  const [coupon] = await db.insert(couponsTable).values({
    code,
    descriptionAr: descriptionAr || null,
    descriptionEn: descriptionEn || null,
    discountType: discountType || "percentage",
    discountValue: parseFloat(discountValue),
    minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
    maxUses: maxUses ? parseInt(maxUses) : null,
    active: active !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(coupon);
});

router.patch("/coupons/:id", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const updates: any = {};
  if (req.body.code !== undefined) updates.code = req.body.code;
  if (req.body.descriptionAr !== undefined) updates.descriptionAr = req.body.descriptionAr;
  if (req.body.descriptionEn !== undefined) updates.descriptionEn = req.body.descriptionEn;
  if (req.body.discountType !== undefined) updates.discountType = req.body.discountType;
  if (req.body.discountValue !== undefined) updates.discountValue = parseFloat(req.body.discountValue);
  if (req.body.minOrderAmount !== undefined) updates.minOrderAmount = req.body.minOrderAmount ? parseFloat(req.body.minOrderAmount) : null;
  if (req.body.maxUses !== undefined) updates.maxUses = req.body.maxUses ? parseInt(req.body.maxUses) : null;
  if (req.body.active !== undefined) updates.active = req.body.active;
  if (req.body.expiresAt !== undefined) updates.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;

  const [coupon] = await db.update(couponsTable).set(updates).where(eq(couponsTable.id, id)).returning();
  if (!coupon) { res.status(404).json({ error: "Coupon not found" }); return; }
  res.json(coupon);
});

router.delete("/coupons/:id", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [coupon] = await db.delete(couponsTable).where(eq(couponsTable.id, id)).returning();
  if (!coupon) { res.status(404).json({ error: "Coupon not found" }); return; }
  res.sendStatus(204);
});

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, parsed.data.code));

  if (!coupon || !coupon.active) {
    res.json(ValidateCouponResponse.parse({ valid: false, discountAmount: 0, message: "كود الخصم غير صالح" }));
    return;
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    res.json(ValidateCouponResponse.parse({ valid: false, discountAmount: 0, message: "تم استخدام الحد الأقصى لهذا الكود" }));
    return;
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    res.json(ValidateCouponResponse.parse({ valid: false, discountAmount: 0, message: "انتهت صلاحية كود الخصم" }));
    return;
  }

  if (coupon.minOrderAmount && parsed.data.orderTotal < coupon.minOrderAmount) {
    res.json(ValidateCouponResponse.parse({ valid: false, discountAmount: 0, message: `الحد الأدنى للطلب ${coupon.minOrderAmount} د.ب` }));
    return;
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = parsed.data.orderTotal * (coupon.discountValue / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json(ValidateCouponResponse.parse({ valid: true, discountAmount, message: null }));
});

export default router;
