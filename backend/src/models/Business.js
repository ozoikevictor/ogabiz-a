const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    location: { type: String, trim: true },
    currency: { type: String, default: "NGN" },
    description: { type: String, trim: true },
    logo: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Business || mongoose.model("Business", BusinessSchema);
