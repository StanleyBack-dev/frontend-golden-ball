import { Router } from "express";
import authRoutes from "./modules/auth/routes.js";
import pollRoutes from "./modules/poll/routes.js";
import statsRoutes from "./modules/stats/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/poll", pollRoutes);
router.use("/stats", statsRoutes);

export default router;
