import express from "express";
import { signup, login, getMe, saveAnalysis, saveLook } from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Route definitions
router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/save-analysis", protect, saveAnalysis);
router.post("/save-look", protect, saveLook);

export default router;
