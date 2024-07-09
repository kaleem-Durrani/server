import Customer from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateOtp = () => {
  return crypto.randomBytes(3).toString("hex"); // Generates a 6-character OTP
};

// Signup controller function
export const signupCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    // If customer already exists and account already verified
    if (existingCustomer && existingCustomer.isVerified) {
      return res.status(400).json({
        error: "Customer with the same email or phone number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // If customer exists but is not verified, update their details
    if (existingCustomer && !existingCustomer.isVerified) {
      // Check if OTP is still valid
      if (existingCustomer.otpExpiry > Date.now()) {
        const remainingTime = (existingCustomer.otpExpiry - Date.now()) / 1000;
        return res.status(400).json({
          error: `OTP already sent. Try again in ${Math.ceil(
            remainingTime
          )} seconds`,
        });
      } else {
        // Update existing customer's details
        existingCustomer.name = name;
        existingCustomer.email = email;
        existingCustomer.password = hashedPassword;
        existingCustomer.phoneNumber = phoneNumber;
        existingCustomer.otp = otp;
        existingCustomer.otpExpiry = otpExpiry;

        await existingCustomer.save();

        // Send new OTP email
        await sendEmail(email, "Your OTP Code", `Your new OTP code is ${otp}`);

        return res.status(200).json({
          message: "New OTP sent to email.",
        });
      }
    }

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpiry,
    });

    await newCustomer.save();

    // Send OTP email
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);

    // Exclude the password and OTP from the response
    const customerResponse = newCustomer.toJSON();
    delete customerResponse.password;
    delete customerResponse.otp;

    const token = generateToken(newCustomer._id, res);

    res.status(201).json({
      message: "Customer created successfully. OTP sent to email.",
      customer: customerResponse,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

// Login controller function
export const loginCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body; // Ensure this line is as shown

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    console.log(customer);

    const token = generateToken(customer._id, res);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

// Logout controller function
export const logoutCustomer = (req, res) => {
  // Here you can handle session or token invalidation if you're using sessions or JWT
  res.status(200).json({ message: "Logout successful" });
};

// Verify OTP controller function
export const verifyOtpCustomer = async (req, res) => {
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

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(400).json({ error: "Invalid token or user not found" });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (customer.otpExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    customer.isVerified = true;
    customer.otp = null; // Clear the OTP
    customer.otpExpiry = null; // Clear the OTP expiry
    await customer.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
