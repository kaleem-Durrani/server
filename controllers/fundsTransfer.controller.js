import FundsTransfer from "../models/fundsTransfer.model";

// funds transfer history
export const getFundsTransferHistory = async (req, res) => {
  // retreive the customer id from the protect customer middleware
  const customerId = req.customer.userId;

  try {
    // find funds transfer history using customer id
    const fundsTransferHistory = await FundsTransfer.find({ customerId })
      .sort({
        createdAt: -1,
      })
      .populate("receiverId", "name email phoneNumber");

    if (!fundsTransferHistory) {
      res
        .status(404)
        .json({ message: "No funds transfer history found for this customer" });
    }

    // return the funds transfer history
    res.status(200).json({
      message: "Funds transfer history successfully retrieved",
      fundsTransferHistory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// balance or points transfer
export const transferFunds = async (req, res) => {
  // validate the request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const customerId = req.customer.userId;
  const { amount, entityTransferred, receiverId } = req.body;

  try {
    // find the sender and receiver customer profile
    const sender = await Customer.findById(customerId);
    const receiver = await Customer.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // when sending points check if sender has sufficien points
    if (entityTransfered === "points" && sender.points < amount) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // when sending balance check if sender has sufficient balance
    if (entityTransfered === "balance" && sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // if transfering balance transfer the balance
    if (entityTransferred === "balance") {
      sender.balance -= amount;
      receiver.balance += amount;
    }

    // if transfering points transfer the points
    if (entityTransferred === "points") {
      sender.points -= amount;
      receiver.points += amount;
    }

    // create a funds transfer record
    const fundsTransfer = new FundsTransfer({
      amount,
      entityTransferred,
      senderId: customerId,
      receiverId,
    });

    // save the changes to the database in a single promise
    Promise.all([sender.save(), receiver.save(), fundsTransfer.save()]);

    // return the updated customer profiles and funds trnasfer record
    res.status(200).json({
      message: "Balance transfer successful",
      sender,
      receiver,
      fundsTransfer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
