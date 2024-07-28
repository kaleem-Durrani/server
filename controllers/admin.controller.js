import Pump from "../models/pump.model.js";
import Employee from "../models/employee.model.js";

export const getProfile = (req, res) => {
  try {
    const admin = req.admin;

    res
      .status(200)
      .json({ message: "Admin Profile retreived successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const admin = req.admin;
    const totalPumps = await Pump.countDocuments();
    const totalEmployees = await Employee.countDocuments();

    res.status(200).json({
      message: "Stats retrieved successfully",
      totalPumps,
      totalEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
