const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Paid", "Partially Paid", "Unpaid"], required: true },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
