const mongoose = require("mongoose");

const DebtPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

const DebtSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    amountOwed: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    dateCreated: { type: Date, required: true },
    dueDate: { type: Date },
    description: { type: String },
    payments: [DebtPaymentSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.models.Debt || mongoose.model("Debt", DebtSchema);
