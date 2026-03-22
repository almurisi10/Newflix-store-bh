import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, ordersTable, productsTable, inventoryItemsTable, loyaltyPointsTable, walletTable, couponsTable } from "@workspace/db";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { requireAdmin, type AdminRequest } from "../middleware/adminAuth";

const router: IRouter = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => cb(null, `receipt_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/orders/:id/upload-receipt", upload.single("receipt"), async (req, res): Promise<void> => {
  const orderId = parseInt(req.params.id);
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const firebaseUid = req.headers["x-firebase-uid"] as string;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (firebaseUid && order.firebaseUid !== firebaseUid) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  if (order.receiptImage && order.receiptStatus === "verified") {
    res.status(400).json({ error: "Receipt already verified" });
    return;
  }

  const receiptPath = `/api/uploads/${req.file.filename}`;

  await db.update(ordersTable).set({
    receiptImage: receiptPath,
    receiptStatus: "pending",
  }).where(eq(ordersTable.id, orderId));

  try {
    const verificationResult = await verifyReceipt(req.file.path, order);

    await db.update(ordersTable).set({
      receiptStatus: verificationResult.verified ? "verified" : "rejected",
      aiVerificationResult: verificationResult,
    }).where(eq(ordersTable.id, orderId));

    if (verificationResult.verified) {
      await confirmOrderDelivery(orderId);
    }

    res.json({
      success: true,
      verified: verificationResult.verified,
      details: verificationResult,
      receiptImage: receiptPath,
    });
  } catch (err: any) {
    await db.update(ordersTable).set({
      receiptStatus: "pending",
      aiVerificationResult: { error: "AI verification failed, awaiting manual review" },
    }).where(eq(ordersTable.id, orderId));

    res.json({
      success: true,
      verified: false,
      details: { message: "Receipt uploaded, awaiting manual review" },
      receiptImage: receiptPath,
    });
  }
});

async function verifyReceipt(filePath: string, order: any) {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

  if (!apiKey || !baseUrl) {
    return { verified: false, reason: "AI service not configured", confidence: 0 };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  (genAI as any).apiClient = undefined;
  const model = genAI.getGenerativeModel(
    { model: "gemini-2.5-flash" },
    { baseUrl: baseUrl }
  );

  const imageData = fs.readFileSync(filePath);
  const base64Image = imageData.toString("base64");
  const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";

  const prompt = `You are a payment receipt verification AI. Analyze this BenefitPay/bank transfer receipt image carefully.

VERIFY THE FOLLOWING:
1. Recipient name must be: ESMAIL ALMURISI (or close Arabic/English match: اسماعيل المريسي)
2. Recipient number/account must contain: 34490039
3. Amount must be exactly: ${order.total} BHD (Bahraini Dinar)

ALSO CHECK FOR FRAUD:
- Is this a real receipt or AI-generated/edited?
- Check for inconsistencies in fonts, alignment, colors
- Check for signs of image manipulation (blurriness around text, mismatched shadows)
- Check if it looks like a genuine BenefitPay or bank app screenshot

Respond in JSON format ONLY:
{
  "verified": true/false,
  "nameMatch": true/false,
  "numberMatch": true/false,
  "amountMatch": true/false,
  "amountFound": "amount found in receipt",
  "nameFound": "name found in receipt",
  "isFraudulent": true/false,
  "fraudReasons": ["reason1", "reason2"],
  "confidence": 0-100,
  "reason": "explanation in Arabic"
}`;

  try {
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: base64Image } },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        verified: parsed.verified === true && !parsed.isFraudulent && parsed.confidence >= 70,
        ...parsed,
      };
    }
    return { verified: false, reason: "Could not parse AI response", confidence: 0 };
  } catch (err: any) {
    return { verified: false, reason: `AI error: ${err.message}`, confidence: 0 };
  }
}

async function confirmOrderDelivery(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return;
  if (order.status === "paid" || order.status === "delivered") return;

  const items = order.items as any[];
  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) continue;

    if (product.deliveryMode === "single_code" && product.singleCodeValue) {
      continue;
    }

    if (product.deliveryMode === "multi_code") {
      for (let i = 0; i < (item.quantity || 1); i++) {
        const [inventoryItem] = await db.update(inventoryItemsTable)
          .set({ status: "delivered", orderId: order.id, deliveredAt: new Date() })
          .where(and(
            eq(inventoryItemsTable.productId, product.id),
            eq(inventoryItemsTable.status, "available")
          ))
          .returning();

        if (!inventoryItem) break;
      }

      const availableCount = await db.select({ count: sql<number>`count(*)::int` })
        .from(inventoryItemsTable)
        .where(and(eq(inventoryItemsTable.productId, product.id), eq(inventoryItemsTable.status, "available")));
      await db.update(productsTable).set({ stock: availableCount[0]?.count ?? 0 }).where(eq(productsTable.id, product.id));
    }
  }

  const loyaltyPoints = Math.floor(order.total);
  if (loyaltyPoints > 0) {
    await db.insert(loyaltyPointsTable).values({
      firebaseUid: order.firebaseUid,
      points: loyaltyPoints,
      type: "earn",
      description: `Order #${orderId}`,
      orderId: orderId,
    });
  }

  await db.update(ordersTable).set({
    status: "paid",
    loyaltyPointsEarned: loyaltyPoints,
  }).where(eq(ordersTable.id, orderId));
}

router.post("/orders/:id/admin-confirm", requireAdmin as any, async (req: AdminRequest, res): Promise<void> => {
  const orderId = parseInt(req.params.id);
  const { action } = req.body;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (action === "confirm") {
    await confirmOrderDelivery(orderId);
    await db.update(ordersTable).set({ receiptStatus: "verified" }).where(eq(ordersTable.id, orderId));
    res.json({ success: true, message: "Order confirmed and delivered" });
  } else if (action === "reject") {
    await db.update(ordersTable).set({
      status: "cancelled",
      receiptStatus: "rejected",
    }).where(eq(ordersTable.id, orderId));
    res.json({ success: true, message: "Order rejected" });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

router.get("/loyalty/:firebaseUid", async (req, res): Promise<void> => {
  const { firebaseUid } = req.params;
  const points = await db.select().from(loyaltyPointsTable)
    .where(eq(loyaltyPointsTable.firebaseUid, firebaseUid))
    .orderBy(sql`created_at DESC`);

  const totalEarned = points.filter(p => p.type === "earn").reduce((s, p) => s + p.points, 0);
  const totalRedeemed = points.filter(p => p.type === "redeem").reduce((s, p) => s + Math.abs(p.points), 0);

  res.json({
    totalPoints: totalEarned - totalRedeemed,
    totalEarned,
    totalRedeemed,
    history: points,
  });
});

router.get("/wallet/:firebaseUid", async (req, res): Promise<void> => {
  const { firebaseUid } = req.params;
  const [wallet] = await db.select().from(walletTable).where(eq(walletTable.firebaseUid, firebaseUid));
  res.json({ balance: wallet?.balance || 0 });
});

router.post("/loyalty/redeem", async (req, res): Promise<void> => {
  const { firebaseUid } = req.body;
  if (!firebaseUid) { res.status(400).json({ error: "firebaseUid required" }); return; }

  const points = await db.select().from(loyaltyPointsTable).where(eq(loyaltyPointsTable.firebaseUid, firebaseUid));
  const totalEarned = points.filter(p => p.type === "earn").reduce((s, p) => s + p.points, 0);
  const totalRedeemed = points.filter(p => p.type === "redeem").reduce((s, p) => s + Math.abs(p.points), 0);
  const available = totalEarned - totalRedeemed;

  if (available < 50) {
    res.status(400).json({ error: "Need at least 50 points", available });
    return;
  }

  await db.insert(loyaltyPointsTable).values({
    firebaseUid,
    points: -50,
    type: "redeem",
    description: "Redeemed 50 points → 2 BHD wallet",
  });

  const [existing] = await db.select().from(walletTable).where(eq(walletTable.firebaseUid, firebaseUid));
  if (existing) {
    await db.update(walletTable).set({ balance: existing.balance + 2 }).where(eq(walletTable.firebaseUid, firebaseUid));
  } else {
    await db.insert(walletTable).values({ firebaseUid, balance: 2 });
  }

  res.json({ success: true, walletBalance: (existing?.balance || 0) + 2, pointsRemaining: available - 50 });
});

router.post("/wallet/generate-coupon", async (req, res): Promise<void> => {
  const { firebaseUid } = req.body;
  if (!firebaseUid) { res.status(400).json({ error: "firebaseUid required" }); return; }

  const [wallet] = await db.select().from(walletTable).where(eq(walletTable.firebaseUid, firebaseUid));
  if (!wallet || wallet.balance < 2) {
    res.status(400).json({ error: "Insufficient wallet balance (need 2 BHD)", balance: wallet?.balance || 0 });
    return;
  }

  const code = `LOYALTY-${firebaseUid.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  await db.insert(couponsTable).values({
    code,
    descriptionAr: "كوبون ولاء - دينارين",
    descriptionEn: "Loyalty coupon - 2 BHD",
    discountType: "fixed",
    discountValue: 2,
    maxUses: 1,
    active: true,
  });

  await db.update(walletTable).set({ balance: wallet.balance - 2 }).where(eq(walletTable.firebaseUid, firebaseUid));

  await db.insert(loyaltyPointsTable).values({
    firebaseUid,
    points: 0,
    type: "coupon",
    description: `Generated coupon: ${code}`,
  });

  res.json({ success: true, couponCode: code, walletBalance: wallet.balance - 2 });
});

export default router;
