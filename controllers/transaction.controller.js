import Transaction from "../models/transaction.model";
import Customer from "../models/customer.model";
import Employee from "../models/employee.model";
import Pump from "../models/pump.model";

export const getCustomerTransactionHistory = async (req, res) => {
  // retreive the customer id from the protecgt customer middleware
  const customerId = req.customer.userId;

  try {
    // find transactions using customer id

    const transactions = await Transaction.find({ customerId })
      .sort({ createdAt: -1 })
      .populate("pumpId", "name") // Populate pump details
      .populate("employeeId", "name"); // Populate employee details

    if (!transactions) {
      res
        .status(404)
        .json({ message: "No transactions found for this customer" });
    }

    // return the transaction history
    res.status(200).json({
      message: "Transaction history successfully retrieved",
      transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createTransaction = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, paymentMethod, fuelType, fuelAmount, customerId } = req.body;
  const employeeId = req.employee.userId;

  try {
    // Find customer in the database
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if customer does not have enough balance
    if (paymentMethod === "app" && amount > customer.balance) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Find employee in the database
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Find pump in the database
    const pump = await Pump.findById(employee.pumpId);
    if (!pump) {
      return res.status(404).json({ message: "Pump not found" });
    }

    if (paymentMethod === "app") {
      // Subtract amount from customer balance
      customer.balance -= amount;

      // Add amount to pump balance (ensure you have a balance field in Pump schema)
      pump.balance += amount;

      // Create transaction
      const transaction = new Transaction({
        amount,
        paymentMethod,
        fuelType,
        fuelAmount,
        customerId,
        pumpId: pump._id,
        employeeId,
      });

      // Save transaction, customer, and pump to the database
      await Promise.all([transaction.save(), customer.save(), pump.save()]);

      res.status(200).json({
        message: "Transaction successful, payment received through app",
        transaction,
      });
    } else {
      // If payment through cash
      // Create transaction
      const transaction = new Transaction({
        amount,
        paymentMethod,
        fuelType,
        fuelAmount,
        customerId,
        pumpId: pump._id,
        employeeId,
      });

      // Save transaction
      await transaction.save();

      res.status(200).json({
        message:
          "Transaction successful, kindly take cash payment from customer",
        transaction,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
