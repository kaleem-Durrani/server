import express from "express";
import {
  addEmployeeToPump,
  addManagerToPump,
  addPump,
} from "../controllers/pump.controller.js";
import protectAdminRoute from "../middleware/protectAdminRoute.js";

import { body } from "express-validator";

const router = express.Router();

// validating the body of addPump api
const validateAddPump = [
  body("name").notEmpty().withMessage("Name is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("coordinates.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Valid latitude is required"),
  body("coordinates.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Valid longitude is required"),
  // Add any other validation rules as needed
];

// validate the body of add manager to pump api
const validateAddManagerToPump = [
  body("pumpId").notEmpty().withMessage("Pump ID is required"),
  body("employeeId").notEmpty().withMessage("Employee ID is required"),
];

const validateAddEmployeeToPump = [
  body("pumpId").notEmpty().withMessage("Pump ID is required"),
  body("employeeId").notEmpty().withMessage("Employee ID is required"),
  // Add any other validation rules as needed
];

router.post("/addPump", validateAddPump, protectAdminRoute, addPump);

router.post(
  "/addManagerToPump",
  validateAddManagerToPump,
  protectAdminRoute,
  addManagerToPump
);

router.post(
  "/addEmployeeToPump",
  validateAddEmployeeToPump,
  protectAdminRoute,
  addEmployeeToPump
);

export default router;