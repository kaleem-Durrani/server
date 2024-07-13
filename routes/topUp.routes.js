import express from "express";
import { body } from "express-validator";
import protectCustomerRoute from "../middleware/protectCustomerRoute";
import { getTopUpHistory, topUpAccount } from "../controllers/topUp.controller";

const router = express.Router();

router.post("topUpAccount", protectCustomerRoute, topUpAccount);

router.get("/history", protectCustomerRoute, getTopUpHistory);

export default router;
