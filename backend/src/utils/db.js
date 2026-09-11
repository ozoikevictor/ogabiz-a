const mongoose = require("mongoose");

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected.");
}

module.exports = { connectDb };
