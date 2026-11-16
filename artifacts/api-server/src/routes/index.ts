import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keyboardRouter from "./keyboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keyboardRouter);

export default router;
