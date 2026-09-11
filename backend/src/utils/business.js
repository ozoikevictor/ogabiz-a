const Business = require("../models/Business");
const User = require("../models/User");

async function getOrCreateBusiness(businessId) {
  if (businessId) {
    const business = await Business.findById(businessId);
    if (business) return business;
  }

  let business = await Business.findOne().sort({ createdAt: -1 });
  if (business) return business;

  const user = await User.findOne().sort({ createdAt: -1 });
  if (!user) {
    throw new Error("Please register or log in before saving business records.");
  }

  business = await Business.create({
    ownerId: user._id,
    name: `${user.fullName}'s Business`,
    type: "Retail",
    phone: user.phone,
    email: user.email,
    location: "",
    currency: "NGN",
    description: "Starter business profile.",
  });

  return business;
}

module.exports = { getOrCreateBusiness };
