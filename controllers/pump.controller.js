import Pump from "../models/pump.model.js";
import { validationResult } from "express-validator";

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

// res.send(`new pump added successfully by ${req.admin}`);

// Controller function to add a manager to a pump
export const addManagerToPump = async (req, res) => {
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

    // Update the pump's manager field
    pump.manager = employeeId;
    await pump.save();

    res.status(200).json({ message: "Manager assigned successfully", pump });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
