import { Router, type IRouter } from "express";
import express from "express";
import path from "path";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import couponsRouter from "./coupons";
import adminRouter from "./admin";
import homepageRouter from "./homepage";
import popupsRouter from "./popups";
import inventoryRouter from "./inventory";
import seedRouter from "./seed";
import adminAuthRouter from "./admin-auth";
import siteContentRouter from "./site-content";
import adminSettingsRouter from "./admin-settings";
import receiptRouter from "./receipt";
import aiGenerateRouter from "./ai-generate";

const router: IRouter = Router();

router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(couponsRouter);
router.use(adminRouter);
router.use(homepageRouter);
router.use(popupsRouter);
router.use(inventoryRouter);
router.use(seedRouter);
router.use(adminAuthRouter);
router.use(siteContentRouter);
router.use(adminSettingsRouter);
router.use(receiptRouter);
router.use(aiGenerateRouter);

export default router;
