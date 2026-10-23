import { Router } from "express";
import authRoutes from "./modules/auth/routes.js";
import pollRoutes from "./modules/poll/routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/poll", pollRoutes);

export default router;
