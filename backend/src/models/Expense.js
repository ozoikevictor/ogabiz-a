const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
