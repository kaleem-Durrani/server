import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    const customer = await Customer.findById(decoded.userId);

    if (!customer) {
      return res.status(401).json({ error: "Customer not found" });
    }

    if (!customer.isVerified) {
      return res.status(401).json({ error: "Customer not verified" });
    }

    req.user = decoded; // Attach the decoded payload to the request object
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
