import express from "express";
import { body } from "express-validator";
import protectEmployeeRoute from "../middleware/protectEmployeeRoute.js";
import {
  createTransaction,
  getEmployeeProfile,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.get("/profile", protectEmployeeRoute, getEmployeeProfile);

export default router;
