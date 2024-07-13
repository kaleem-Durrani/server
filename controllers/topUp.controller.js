import TopUp from "../models/topUp.model.js";
import Customer from "../models/customer.model.js";

// top up dummy balance
export const topUpAccount = async (req, res) => {
  // validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const customerId = req.customer.userId;
  const { amount, topUpThrough } = req.body;

  try {
    // find the customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // create a top up record
    const topUp = new TopUp({
      amount,
      topUpThrough,
      customerId,
    });

    // update the customer balance
    customer.balance += amount;

    // save the changes to the database
    Promise.all([topUp.save(), customer.save()]);

    // return the updated customer profile and top up record
    res.status(200).json({
      message: "Top up successful",
      customer,
      topUp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// top up history
export const getTopUpHistory = async (req, res) => {
  // get customer id from the protect customer middleware
  const customerId = req.customer.userId;

  try {
    // find top up history using customer id
    const topUpHistory = await TopUp.find({ customerId }).sort({
      createdAt: -1,
    });

    if (!topUpHistory) {
      res
        .status(404)
        .json({ message: "No top up history found for this customer" });
    }

    // return the top up history
    res.status(200).json({
      message: "Top up history successfully retrieved",
      topUpHistory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
