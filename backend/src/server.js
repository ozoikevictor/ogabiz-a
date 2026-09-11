const dns=require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const { connectDb } = require("./utils/db");
const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const customerRoutes = require("./routes/customer.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const debtRoutes = require("./routes/debt.routes");
const expenseRoutes = require("./routes/expense.routes");
const productRoutes = require("./routes/product.routes");
const saleRoutes = require("./routes/sale.routes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.json({
    message: "OgaBiz AI backend is running.",
    health: "/api/health",
  });
});

app.get("/api/health", async (request, response) => {
  try {
    await connectDb();

    response.json({
      api: "running",
      database: "connected",
    });
  } catch (error) {
    response.status(503).json({
      api: "running",
      database: "not connected",
      error: error.message,
    });
  }
});

app.get("/api/status", (request, response) => {
  response.json({
    api: "running",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found",
    path: request.originalUrl,
  });
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(error.status || 500).json({
    error: error.message || "Server error",
  });
});

async function startServer() {
  try {
    await connectDb();

    app.listen(port, () => {
      console.log(`OgaBiz AI backend running on http://localhost:${port}`);
      console.log("MongoDB connected.");
    });
  } catch (error) {
    console.error("Failed to start OgaBiz AI backend.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
