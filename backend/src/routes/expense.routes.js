const express = require("express");
const Expense = require("../models/Expense");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const expenses = await Expense.find({ businessId: request.params.businessId }).sort({ date: -1 });
    response.json({ expenses });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.businessId);
    const expense = await Expense.create({
      ...request.body,
      businessId: business._id,
    });
    response.status(201).json({ expense });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
