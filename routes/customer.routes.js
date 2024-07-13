import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "../middleware/protectCustomerRoute.js";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/profile", protectCustomerRoute, getCustomerProfile);

router.post("/updateProfile", protectCustomerRoute, updateCustomerProfile);

export default router;
