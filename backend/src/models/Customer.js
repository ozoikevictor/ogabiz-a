const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
