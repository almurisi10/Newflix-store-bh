import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, popupsTable } from "@workspace/db";
import {
  ListPopupsQueryParams,
  ListPopupsResponse,
  CreatePopupBody,
  UpdatePopupParams,
  UpdatePopupBody,
  UpdatePopupResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/popups", async (req, res): Promise<void> => {
  const query = ListPopupsQueryParams.safeParse(req.query);
  const active = query.success ? query.data.active : undefined;

  let popups;
  if (active !== undefined) {
    popups = await db.select().from(popupsTable).where(eq(popupsTable.active, active));
  } else {
    popups = await db.select().from(popupsTable);
  }
  res.json(ListPopupsResponse.parse(popups));
});

router.post("/popups", async (req, res): Promise<void> => {
  const parsed = CreatePopupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [popup] = await db.insert(popupsTable).values(parsed.data).returning();
  res.status(201).json(UpdatePopupResponse.parse(popup));
});

router.patch("/popups/:id", async (req, res): Promise<void> => {
  const params = UpdatePopupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdatePopupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [popup] = await db.update(popupsTable).set(body.data).where(eq(popupsTable.id, params.data.id)).returning();
  if (!popup) {
    res.status(404).json({ error: "Popup not found" });
    return;
  }
  res.json(UpdatePopupResponse.parse(popup));
});

export default router;
