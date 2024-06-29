import Customer from "../models/customer.model.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";

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

    // if (cnic) {
    //   existingCustomer = await Customer.findOne({
    //     $or: [{ email }, { phoneNumber }, { cnic }],
    //   });
    // } else {
    //   existingCustomer = await Customer.findOne({
    //     $or: [{ email }, { phoneNumber }],
    //   });
    // }

    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingCustomer) {
      return res.status(400).json({
        error: "Customer with the same email, phone number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    await newCustomer.save();

    // Exclude the password from the response
    const customerResponse = newCustomer.toJSON();

    // const token = jwt.sign({ id: newCustomer._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    const token = generateToken(newCustomer._id, res);

    res.status(201).json({
      message: "Customer created successfully",
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
