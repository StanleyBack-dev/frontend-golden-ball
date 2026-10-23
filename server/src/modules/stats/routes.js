import { Router } from "express";
import {
  getLeaderboardController,
  getNomineeController,
} from "./controllers/index.js";

const router = Router();

router.get("/leaderboard", getLeaderboardController());
router.get("/nominees/:slug", getNomineeController());

export default router;
