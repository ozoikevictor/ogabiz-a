const express = require("express");
const Customer = require("../models/Customer");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const customers = await Customer.find({ businessId: request.params.businessId }).sort({ createdAt: -1 });
    response.json({ customers });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.businessId);
    const customer = await Customer.create({
      ...request.body,
      businessId: business._id,
    });
    response.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
