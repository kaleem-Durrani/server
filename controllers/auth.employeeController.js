import Customer from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const signupEmployee = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
export const loginEmployee = async (req, res) => {
  res.send("employee login");
};
export const logoutEmployee = async (req, res) => {
  res.send("employee logout");
};
