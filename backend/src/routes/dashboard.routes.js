const express = require("express");
const Business = require("../models/Business");
const Customer = require("../models/Customer");
const Debt = require("../models/Debt");
const Expense = require("../models/Expense");
const Product = require("../models/Product");
const Sale = require("../models/Sale");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const businessId = request.params.businessId;
    const [business, products, customers, sales, expenses, debts] = await Promise.all([
      Business.findById(businessId),
      Product.find({ businessId }).sort({ createdAt: -1 }),
      Customer.find({ businessId }).sort({ createdAt: -1 }),
      Sale.find({ businessId }).populate("productId").populate("customerId").sort({ date: -1 }),
      Expense.find({ businessId }).sort({ date: -1 }),
      Debt.find({ businessId }).populate("customerId").sort({ createdAt: -1 }),
    ]);

    response.json({ business, products, customers, sales, expenses, debts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
