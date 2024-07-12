import Employee from "../models/employee.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateOtp = () => {
  return crypto.randomBytes(3).toString("hex"); // Generates a 6-character OTP
};

// signup needs work as to not sent otp until the previous one is expired
export const signupEmployee = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
      type,
      pumpId,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    // If employee already exists and account already verified
    if (existingEmployee && existingEmployee.isVerified) {
      return res
        .status(400)
        .json({ error: "Email or phone number already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // If employee exists but is not verified, update their details
    if (existingEmployee && !existingEmployee.isVerified) {
      // Check if OTP is still valid
      if (existingEmployee.otp > Date.now()) {
        const remainingTime = (existingCustomer.otpExpiry - Date.now()) / 1000;
        return res.status(400).json({
          error: `OTP already sent. Try again in ${Math.ceil(
            remainingTime
          )} seconds`,
        });
      } else {
        // Update existing employee's details
        existingEmployee.name = name;
        existingEmployee.email = email;
        existingEmployee.password = hashedPassword;
        existingEmployee.phoneNumber = phoneNumber;
        existingEmployee.type = type;
        existingEmployee.pumpId = pumpId;
        existingEmployee.otp = otp;
        existingEmployee.otpExpiry = otpExpiry;

        await existingEmployee.save();

        // Send OTP email
        await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);

        return res.status(200).json({
          message: "New OTP sent to email.",
        });
      }
    }

    // Create a new employee
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      type,
      pumpId,
      otp,
      otpExpiry,
    });

    await newEmployee.save();

    // Send OTP email
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);

    const employeeResponse = newEmployee.toJSON();
    delete employeeResponse.password;
    delete employeeResponse.otp;

    const token = generateToken(newEmployee._id, res);

    res.status(201).json({
      message: "Employee created successfully. OTP sent to email.",
      token,
      employee: employeeResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
export const loginEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body; // Ensure this line is as shown

  try {
    // find employee with email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // console.log(employee);

    const token = generateToken(employee._id, res);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
export const logoutEmployee = async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};

export const verifyOtpEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { otp } = req.body;

  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const employee = await Employee.findById(userId);
    if (!employee) {
      return res.status(400).json({ error: "Invalid token or user not found" });
    }

    if (employee.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (employee.otpExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    employee.isVerified = true;
    employee.otp = null; // Clear the OTP
    employee.otpExpiry = null; // Clear the OTP expiry
    await employee.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
