const express = require("express");
const Customer = require("../models/Customer");
const Debt = require("../models/Debt");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const { getOrCreateBusiness } = require("../utils/business");

const router = express.Router();

router.get("/:businessId", async (request, response, next) => {
  try {
    const sales = await Sale.find({ businessId: request.params.businessId })
      .populate("productId")
      .populate("customerId")
      .sort({ date: -1 });
    response.json({ sales });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const business = await getOrCreateBusiness(request.body.businessId);
    const businessId = business._id;
    const { productId, customerId, quantity, paymentMethod, paymentStatus, date, notes } = request.body;
    const product = await Product.findOne({ _id: productId, businessId });
    if (!product) return response.status(404).json({ error: "Product not found." });

    const soldQuantity = Number(quantity);
    if (!soldQuantity || soldQuantity < 1) {
      return response.status(400).json({ error: "Quantity must be at least 1." });
    }
    if (product.quantity < soldQuantity) {
      return response.status(400).json({ error: "Not enough stock for this sale." });
    }

    const sellingPrice = Number(request.body.sellingPrice || product.sellingPrice);
    const revenue = sellingPrice * soldQuantity;
    const amountPaid = paymentStatus === "Paid" ? revenue : Number(request.body.amountPaid || 0);

    product.quantity -= soldQuantity;
    await product.save();

    const sale = await Sale.create({
      businessId,
      productId: product._id,
      customerId: customerId || undefined,
      quantity: soldQuantity,
      sellingPrice,
      costPrice: product.costPrice,
      amountPaid,
      paymentMethod,
      paymentStatus,
      date: date || new Date(),
      notes,
    });

    let debt = null;
    const balance = revenue - amountPaid;
    if (balance > 0 && customerId) {
      const customer = await Customer.findOne({ _id: customerId, businessId });
      if (customer) {
        debt = await Debt.create({
          businessId,
          customerId,
          amountOwed: revenue,
          amountPaid,
          dateCreated: date || new Date(),
          dueDate: date || new Date(),
          description: `Balance for ${product.name} sale`,
          payments: amountPaid > 0 ? [{ amount: amountPaid, date: date || new Date(), notes: "Initial payment" }] : [],
        });
      }
    }

    response.status(201).json({ sale, debt, product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
