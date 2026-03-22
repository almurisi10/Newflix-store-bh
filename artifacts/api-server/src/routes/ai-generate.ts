import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

router.post("/ai/generate-product-description", async (req, res): Promise<void> => {
  const { titleAr, titleEn, productType } = req.body;

  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

  if (!apiKey || !baseUrl) {
    res.status(500).json({ error: "AI service not configured" });
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: "",
      baseUrl,
    },
  });

  const prompt = `Generate product descriptions and features for a digital product in an e-commerce store in Bahrain.

Product Title (Arabic): ${titleAr || 'غير محدد'}
Product Title (English): ${titleEn || 'Not specified'}
Product Type: ${productType || 'digital subscription'}

Generate the following in JSON format:
{
  "shortDescriptionAr": "short description in Arabic (1-2 sentences)",
  "shortDescriptionEn": "short description in English (1-2 sentences)",
  "fullDescriptionAr": "detailed description in Arabic (2-3 paragraphs)",
  "fullDescriptionEn": "detailed description in English (2-3 paragraphs)",
  "featuresAr": ["feature 1 in Arabic", "feature 2", "feature 3", "feature 4", "feature 5"],
  "featuresEn": ["feature 1 in English", "feature 2", "feature 3", "feature 4", "feature 5"]
}

Make descriptions compelling and professional. Focus on digital product benefits like instant delivery, genuine products, and Bahrain market.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: "Failed to parse AI response" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
