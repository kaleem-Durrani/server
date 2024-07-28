import express from "express";
import protectAdminRoute from "../middleware/protectAdminRoute.js";
import {
  getDashboardStats,
  getProfile,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/profile", protectAdminRoute, getProfile);

router.get("/dashboard-stats", protectAdminRoute, getDashboardStats);

export default router;
