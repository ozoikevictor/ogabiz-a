const express = require("express");
const Customer = require("../models/Customer");
const Debt = require("../models/Debt");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const debts = await Debt.find({ businessId: request.params.businessId })
      .populate("customerId")
      .sort({ createdAt: -1 });
    response.json({ debts });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.businessId);
    let customerId = request.body.customerId;
    if (!customerId) {
      const customer = await Customer.findOne({ businessId: business._id }).sort({ createdAt: -1 });
      if (!customer) return response.status(400).json({ error: "Add a customer before recording debt." });
      customerId = customer._id;
    }
    const amountPaid = Number(request.body.amountPaid || 0);
    const debt = await Debt.create({
      ...request.body,
      businessId: business._id,
      customerId,
      amountPaid,
      dateCreated: request.body.dateCreated || new Date(),
      payments: amountPaid > 0 ? [{ amount: amountPaid, date: new Date(), notes: "Initial payment" }] : [],
    });
    response.status(201).json({ debt });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/payments", async (request, response, next) => {
  try {
    const amount = Number(request.body.amount || 0);
    if (amount <= 0) return response.status(400).json({ error: "Payment amount is required." });

    const debt = await Debt.findByIdAndUpdate(
      request.params.id,
      {
        $inc: { amountPaid: amount },
        $push: { payments: { amount, date: request.body.date || new Date(), notes: request.body.notes } },
      },
      { new: true },
    );

    response.json({ debt });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
