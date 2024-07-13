import Customer from "../models/customer.model.js";
import Transaction from "../models/transaction.model.js";
import FundsTransfer from "../models/fundsTransfer.model.js";
import TopUp from "../models/topUp.model.js";
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

// update profile / details
export const updateCustomerProfile = async (req, res) => {
  // validate the request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const customerId = req.customer.userId;
  const { name, phoneNumber } = req.body;

  try {
    // make sure the number does not already exist except for current user
    const existingCustomer = await Customer.findOne({
      $and: [{ _id: { $ne: customerId } }, { phoneNumber }],
    });

    if (existingCustomer) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    // find and update the customer
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        name,
        phoneNumber,
      },
      { new: true }
    );

    // return the updated customer profile
    res
      .status(200)
      .json({ message: "Customer profile updated successfully", customer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
