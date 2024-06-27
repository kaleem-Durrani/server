import express from "express";
import { config } from "dotenv";

config({
  path: "./data/.env",
});

export const app = express();

import user from "./routes/user.js";
app.use("/api/v1/user", user);
