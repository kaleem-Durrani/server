import Customer from "../models/customer.model.js";
import { validationResult } from "express-validator";

export const getCustomerProfile = async (req, res) => {
  // retreive the customer id from the protecgt customer middleware
  const customerId = req.customer.userId;

  try {
    // find customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
    }

    // console.log(customer);

    // return the customer profile
    // the overridden toJson method inside the customer model
    // automatically removes sensitive fields
    res
      .status(200)
      .json({ message: "Customer profile successfully retrieved", customer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
