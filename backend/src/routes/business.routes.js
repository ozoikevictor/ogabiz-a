const express = require("express");
const Business = require("../models/Business");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.id || request.body._id || request.body.businessId);

    business.name = request.body.name || business.name;
    business.type = request.body.type || business.type;
    business.phone = request.body.phone || business.phone;
    business.email = request.body.email || business.email;
    business.location = request.body.location || business.location;
    business.currency = request.body.currency || business.currency;
    business.description = request.body.description || business.description;
    business.logo = request.body.logo || business.logo;

    await business.save();
    response.json({ business });
  } catch (error) {
    next(error);
  }
});

router.patch("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.id || request.body._id || request.body.businessId);

    business.name = request.body.name || business.name;
    business.type = request.body.type || business.type;
    business.phone = request.body.phone || business.phone;
    business.email = request.body.email || business.email;
    business.location = request.body.location || business.location;
    business.currency = request.body.currency || business.currency;
    business.description = request.body.description || business.description;
    business.logo = request.body.logo || business.logo;

    await business.save();
    response.json({ business });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
