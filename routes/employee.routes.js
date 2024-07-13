import express from "express";
import { body } from "express-validator";
import protectEmployeeRoute from "../middleware/protectEmployeeRoute.js";
import {
  getEmployeeList,
  getEmployeeProfile,
  updateProfile,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/updateProfile", protectEmployeeRoute, updateProfile);

router.get("/profile", protectEmployeeRoute, getEmployeeProfile);

router.get("/employeeList", protectEmployeeRoute, getEmployeeList);

export default router;
