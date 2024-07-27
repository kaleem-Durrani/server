import express from "express";
import protectAdminRoute from "../middleware/protectAdminRoute.js";
import { getProfile } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/profile", protectAdminRoute, getProfile);

export default router;
