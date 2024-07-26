import Pump from "../models/pump.model.js";
import Employee from "../models/employee.model.js";
import { validationResult } from "express-validator";

// @desc add a pump to the DB
// @route /api/pump/addPump
// @access admin
export const addPump = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, location, coordinates, manager } = req.body;

    const admin = req.admin._id;

    const pump = new Pump({
      name,
      location,
      coordinates,
      addedBy: admin,
      manager,
    });

    await pump.save();

    res.status(201).json({ message: "Pump added successfully", pump });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc assign a manager to pump
// @route /api/pump/addManagerToPump
// @access admin
export const addManagerToPump = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pumpId, managerEmail } = req.body;

  try {
    // Find the pump by ID
    const pump = await Pump.findById(pumpId);
    if (!pump) {
      return res.status(404).json({ error: "Pump not found" });
    }

    // Check if the employee exists
    const manager = await Employee.findOne({ email: managerEmail });

    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    if (!manager.isVerified) {
      return res.status(401).json({ error: "Manager not verified" });
    }

    if (manager.isEmployed) {
      return res.status(403).json({ error: "Employee is already employed" });
    }

    if (manager.type === "refueler") {
      return res
        .status(403)
        .json({ error: "Cannot assign refueler as a manager" });
    }

    // Update the pump's manager field
    pump.manager = manager._id;
    manager.isEmployed = true;

    Promise.all([await manager.save(), await pump.save()]);

    res.status(200).json({ message: "Manager assigned successfully", pump });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc assign an employee to pump
// @route /api/pump/addEmployeeToPump
// @access admin
export const addEmployeeToPump = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pumpId, employeeId } = req.body;

  try {
    // Find the pump by ID
    const pump = await Pump.findById(pumpId);
    if (!pump) {
      return res.status(404).json({ error: "Pump not found" });
    }

    // Check if the employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!employee.isVerified) {
      return res.status(401).json({ error: "Employee not verified" });
    }

    if (employee.isEmployed) {
      return res.status(403).json({ error: "Employee is already employed" });
    }

    if (employee.type === "manager") {
      return res
        .status(403)
        .json({ error: "Cannot assign manager as refueler" });
    }

    // Add the employee to the pump's refuelers array
    pump.employees.push(employeeId);
    employee.isEmployed = true;

    Promise.all([await pump.save(), await employee.save()]);

    res.status(200).json({ message: "Employee added successfully", pump });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc get all registered pumps
// @route /api/pump/getPumpList
// @access admin
export const getPumpList = async (req, res) => {
  try {
    const pumps = await Pump.find().sort({ createdAt: -1 });

    // if there are no pumps return error
    if (pumps.length === 0) {
      return res.status(404).json({ error: "No pumps found" });
    }

    res.status(200).json({ message: "Pumps retreived success fully", pumps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc get list of all employees assigned to a specific pump
// @route /api/pump/employeeListByPump
// @access Admin
export const getEmployeeListByPump = async (req, res) => {
  const { pumpId } = req.body;

  try {
    // find the punp in the pump collection
    const pump = await Pump.findById(pumpId)
      .populate("manager", "name email phoneNumber")
      .populate("employees", "name email phoneNumber");

    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    res.status(200).json({
      message: "Emplloyees found successfully",
      manager: pump.manager,
      employees: pump.employees,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const removeEmployeeFromPump = async (req, res) => {
  const { pumpId, employeeEmail } = req.body;

  try {
    // find the pump in the pump collection
    const pump = await Pump.findById(pumpId);

    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    const employee = await Employee.find({ email: employeeEmail });

    if (!employee) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    // search for the employeeId in the pump.employees array
    const index = pump.employees.indexOf(employee._id);
    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Employee not found in the pump" });
    }
    // remove the employeeId from the pump.employees array
    pump.employees.splice(index, 1);
    employee.isEmployed = false;

    Promise.all([await pump.save(), await employee.save()]);

    res.status(200).json({ message: "Employee removed successfully", pump });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
