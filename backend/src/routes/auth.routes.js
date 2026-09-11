const bcrypt = require("bcryptjs");
const express = require("express");
const Business = require("../models/Business");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (request, response, next) => {
  try {
    const { fullName, email, phone, password, business } = request.body;
    if (!fullName || !email || !phone || !password) {
      return response.status(400).json({ error: "Full name, email, phone and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return response.status(409).json({ error: "Email already registered." });
    }

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
    });

    const newBusiness = await Business.create({
      ownerId: user._id,
      name: business?.name || `${fullName}'s Business`,
      type: business?.type || "Retail",
      phone: business?.phone || phone,
      email: normalizedEmail,
      location: business?.location || "",
      currency: "NGN",
      description: business?.description || "",
    });

    response.status(201).json({
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone },
      business: newBusiness,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
      return response.status(401).json({ error: "Invalid email or password." });
    }

    let business = await Business.findOne({ ownerId: user._id });
    if (!business) {
      business = await Business.create({
        ownerId: user._id,
        name: `${user.fullName}'s Business`,
        type: "Retail",
        phone: user.phone,
        email: user.email,
        location: "",
        currency: "NGN",
        description: "",
      });
    }

    response.json({
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone },
      business,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
