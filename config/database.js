const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI غير موجود في ملف .env");
    }

    await mongoose.connect(mongoURI);

    console.log("=================================");
    console.log("      DATABASE CONNECTED");
    console.log("      VOLTARENA DATABASE");
    console.log("=================================");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);

    process.exit(1);
  }
}

module.exports = connectDatabase;
