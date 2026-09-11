const express = require("express");
const Product = require("../models/Product");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const products = await Product.find({ businessId: request.params.businessId }).sort({ createdAt: -1 });
    response.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.businessId || request.body.business?.id || request.body.business?._id);
    const product = await Product.create({
      ...request.body,
      businessId: business._id,
    });

    response.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/add-stock", async (request, response, next) => {
  try {
    const quantity = Number(request.body.quantity || 0);
    if (!quantity || quantity < 1) {
      return response.status(400).json({ error: "Enter a valid stock quantity." });
    }
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      { $inc: { quantity } },
      { new: true },
    );
    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ product });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (request, response, next) => {
  try {
    const allowed = ["name", "sku", "category", "description", "costPrice", "sellingPrice", "quantity", "lowStockThreshold", "unit"];
    const updates = {};
    for (const key of allowed) {
      if (request.body[key] !== undefined) updates[key] = request.body[key];
    }
    const product = await Product.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (request, response, next) => {
  try {
    const product = await Product.findByIdAndDelete(request.params.id);
    if (!product) return response.status(404).json({ error: "Product not found." });
    response.json({ product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
