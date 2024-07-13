import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "./../middleware/protectCustomerRoute.js";
import {
  getFundsTransferHistory,
  transferFunds,
} from "../controllers/fundsTransfer.controller.js";

const router = express.Router();

router.get("/getHistory", protectCustomerRoute, getFundsTransferHistory);

router.post("transferFunds", protectCustomerRoute, transferFunds);

export default router;
