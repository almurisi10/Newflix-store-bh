import { Router, type IRouter } from "express";
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

const router: IRouter = Router();

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

export default router;
