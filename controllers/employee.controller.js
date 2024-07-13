import Employee from "../models/employee.model.js";
import { validationResult } from "express-validator";
import Pump from "../models/pump.model.js";
import Customer from "../models/customer.model.js";
import Transaction from "../models/transaction.model.js";

export const getEmployeeProfile = async (req, res) => {
  // get employee id from auth middleware
  const employeeId = req.employee.userId;

  try {
    // find employee in the database
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // return employee profile
    res
      .status(200)
      .json({ message: "Employee profile successfully retreived", employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
