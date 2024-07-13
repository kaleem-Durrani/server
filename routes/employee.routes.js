import express from "express";
import { body } from "express-validator";
import protectEmployeeRoute from "../middleware/protectEmployeeRoute.js";
import {
  getEmployeeList,
  getEmployeeProfile,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.get("/profile", protectEmployeeRoute, getEmployeeProfile);

router.get("/employeeList", protectEmployeeRoute, getEmployeeList);

export default router;
