import express from "express";
import { body } from "express-validator";
import { loginAdmin } from "../controllers/auth.adminController.js";

const router = express.Router();

// Validation rules for login
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/login", loginValidation, loginAdmin);

export default router;
