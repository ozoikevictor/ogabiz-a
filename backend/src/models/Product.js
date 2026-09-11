const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    unit: { type: String, default: "Piece" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);
