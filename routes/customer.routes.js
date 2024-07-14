import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "../middleware/protectCustomerRoute.js";
import {
  changePassword,
  getCustomerProfile,
  updateCustomerProfile,
} from "../controllers/customer.controller.js";

const router = express.Router();

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .isString()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .isString()
    .withMessage("New password is required"),
  body("confirmPassword")
    .notEmpty()
    .isString()
    .withMessage("Confirm password is required"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

router.get("/profile", protectCustomerRoute, getCustomerProfile);

router.post("/updateProfile", protectCustomerRoute, updateCustomerProfile);

router.post(
  "/changePassword",
  changePasswordValidation,
  protectCustomerRoute,
  changePassword
);

export default router;
