import mongoose from "mongoose";

const fundsTransferSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  entityTransferred: {
    type: String,
    enum: ["points", "cash"],
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
});

const FundsTransfer = mongoose.model("FundsTransfer", fundsTransferSchema);
export default FundsTransfer;
