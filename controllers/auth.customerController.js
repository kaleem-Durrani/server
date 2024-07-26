import Customer from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateOtp = () => {
  // create a six digit otp
  return crypto.randomInt(100000, 1000000).toString();
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
      if (
        existingCustomer.email !== email ||
        existingCustomer.phoneNumber !== phoneNumber
      ) {
        return res.status(400).json({
          error:
            "The email or phone number is already registered to another account",
        });
      }

      // Check if OTP is still valid
      if (existingCustomer.otpExpiry > Date.now()) {
        const remainingTime = (existingCustomer.otpExpiry - Date.now()) / 1000;
        return res.status(400).json({
          error: `OTP already sent. Verify Account or Try again in ${Math.ceil(
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

    const token = generateToken(newCustomer._id, newCustomer.isVerified, res);

    res.status(201).json({
      message: "Customer created successfully. OTP sent to email.",
      customer: newCustomer,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

// Login controller function
export const loginCustomer = async (req, res) => {
  // console.log("login initiated");
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
    // console.log(customer);

    const token = generateToken(customer._id, customer.isVerified, res);

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

    if (customer.isVerified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (customer.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ error: "OTP has expired, \nPlease Request another" });
    }

    customer.isVerified = true;
    customer.otp = null; // Clear the OTP
    customer.otpExpiry = null; // Clear the OTP expiry
    await customer.save();

    const resToken = generateToken(customer._id, customer.isVerified, res);

    res.status(200).json({
      message: "Account verified successfully",
      customer,
      token: resToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};

// request new otp if current expired or not received
export const requetsNewOtp = async (req, res) => {
  console.log("new otp requested");
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

    if (customer.isVerified) {
      return res.status(400).json({ error: "Account already verified" });
    }

    // check for otp expiry if otp not expired return error
    if (customer.otpExpiry > Date.now()) {
      const remainingTime = (customer.otpExpiry - Date.now()) / 1000;
      return res.status(400).json({
        error: `OTP already sent. Verify Account or Try again in ${Math.ceil(
          remainingTime
        )} seconds`,
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;

    await customer.save();

    // Send OTP email
    await sendEmail(customer.email, "Your OTP Code", `Your OTP code is ${otp}`);

    console.log("new otp sent");

    res
      .status(200)
      .json({ message: `New OTP sent to email. \n${customer.email}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server error" });
  }
};
