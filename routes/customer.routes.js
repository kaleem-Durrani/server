import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "../middleware/protectCustomerRoute.js";
import { getCustomerProfile } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/profile", protectCustomerRoute, getCustomerProfile);

export default router;
