import express from "express";
import { body } from "express-validator";
import {
  loginCustomer,
  logoutCustomer,
  signupCustomer,
} from "../controllers/auth.customerController.js";

const router = express.Router();

// Validation rules for signup
const signupValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("Confirm password must be at least 6 characters"),
  body("phoneNumber").isString().withMessage("Phone number must be a string"), // Changed to string validation
  //   body("cnic").optional().isString().withMessage("CNIC must be a string"),
];

// Validation rules for login
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Define routes with validation
router.post("/signup", signupValidation, signupCustomer);

router.post("/login", loginValidation, loginCustomer);

router.post("/logout", logoutCustomer);

export default router;
