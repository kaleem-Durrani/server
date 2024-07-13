import Employee from "../models/employee.model.js";
import { validationResult } from "express-validator";
import Pump from "../models/pump.model.js";
import Customer from "../models/customer.model.js";
import Transaction from "../models/transaction.model.js";

// accessed by all employees
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

// accessed only by employees with type managers
export const getEmployeeList = async (req, res) => {
  // Get employee id
  const employeeId = req.employee.userId;

  try {
    // Find employee in the database
    const employee = await Employee.findById(employeeId);

    // Check if employee type is manager
    if (employee.type !== "manager") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Find pump where manager is the employee
    // it returns a list
    const pumps = await Pump.find({ manager: employeeId }).populate(
      "employees",
      "name email"
    );

    // If no pumps found, this manager is not assigned to a pump
    if (pumps.length === 0) {
      return res
        .status(404)
        .json({ message: "Manager not assigned to a pump" });
    }

    // Since a manager can manage only one pump, get the employees of the first pump
    const employees = pumps[0].employees;

    // Return list of employees assigned to the pump
    res
      .status(200)
      .json({ message: "Employee list successfully retrieved", employees });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const employee = req.employee.userId;

  const { name, phoneNumber } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee,
      {
        name,
        phoneNumber,
      },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", updatedEmployee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
