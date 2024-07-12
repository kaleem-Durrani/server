import express from "express";
import { body } from "express-validator";
import protectEmployeeRoute from "../middleware/protectEmployeeRoute.js";
import {
  createTransaction,
  getEmployeeProfile,
} from "../controllers/employeeController.js";

const router = express.Router();

// validation rules for createTransaction function
const createTransactionValidation = [
  body("amount").notEmpty().isNumeric().withMessage("Amount is required"),
  body("paymentMethod")
    .notEmpty()
    .isIn(["app", "cash"])
    .withMessage("PaymentMethod is required"),
  body("fuelType")
    .notEmpty()
    .isIn(["petrol", "diesel", "cng"])
    .withMessage(
      "fuelType is required, and must either 'petrol', 'diesel' or 'cng' "
    ),
  body("fuelAmount")
    .notEmpty()
    .isNumeric()
    .withMessage("fuel amount is required"),
  body("customerId")
    .notEmpty()
    .isString()
    .withMessage("Customer ID is required"),
];

router.get("/profile", protectEmployeeRoute, getEmployeeProfile);

router.post(
  "/createTransaction",
  createTransactionValidation,
  protectEmployeeRoute,
  createTransaction
);

export default router;
