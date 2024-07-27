import express from "express";
import { body } from "express-validator";
import protectEmployeeRoute from "../middleware/protectEmployeeRoute.js";
import {
  changePassword,
  getEmployeeList,
  getEmployeeProfile,
  updateProfile,
} from "../controllers/employee.controller.js";

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

// @access employees (refueler and manager)
router.post("/updateProfile", protectEmployeeRoute, updateProfile);

// @access employees (refueler and manager)
router.get("/profile", protectEmployeeRoute, getEmployeeProfile);

// @access employees (refueler and manager)
router.post(
  "/changePassword",
  changePasswordValidation,
  protectEmployeeRoute,
  changePassword
);

// @access Manager
router.get("/employeeListByManager", protectEmployeeRoute, getEmployeeList);
export default router;
