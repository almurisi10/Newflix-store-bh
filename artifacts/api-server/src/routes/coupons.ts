import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import {
  ListCouponsResponse,
  CreateCouponBody,
  ValidateCouponBody,
  ValidateCouponResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/coupons", async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable);
  res.json(ListCouponsResponse.parse(coupons));
});

router.post("/coupons", async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [coupon] = await db.insert(couponsTable).values(parsed.data).returning();
  res.status(201).json(coupon);
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
