import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "./../middleware/protectCustomerRoute";
import {
  getFundsTransferHistory,
  transferFunds,
} from "../controllers/fundsTransfer.controller";

const router = express.Router();

router.get("/getHistory", protectCustomerRoute, getFundsTransferHistory);

router.post("transferFunds", protectCustomerRoute, transferFunds);

export default router;
