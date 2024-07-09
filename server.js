import express from "express";
import { config } from "dotenv";

import authCustomerRoutes from "./routes/auth.customerRoutes.js";
import authEmployeeRoutes from "./routes/auth.employeeRoutes.js";
import authAdminRoutes from "./routes/auth.adminRoutes.js";

import pumpRoutes from "./routes/pump.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";

const app = express();
const PORT = process.env.PORT || 5000;

config();

app.use(express.json()); // to parse the incoming request with JSON payloads (from req.body)

app.use("/api/auth/customer", authCustomerRoutes);
app.use("/api/auth/employee", authEmployeeRoutes);
app.use("/api/auth/admin", authAdminRoutes);

app.use("/api/pump", pumpRoutes);

// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(
    `Server listening on port ${PORT}, in ${process.env.NODE_ENV} mode`
  );
});
