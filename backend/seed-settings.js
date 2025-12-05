import mongoose from "mongoose";
import dotenv from "dotenv";
import Settings from "./models/Settings.js";

dotenv.config();

const GEMINI_API_KEY = "AIzaSyC9q8fZD8vUpDM5cuZ2DkEdX6E2LxVOicw";

const seedSettings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mmo-management"
    );
    console.log("✅ Connected to MongoDB");

    // Check if settings exist
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings
      settings = await Settings.create({
        key: "app_settings",
        value: {},
        geminiApiKey: GEMINI_API_KEY,
        description: "Application settings",
      });
      console.log("✅ Created new settings with Gemini API key");
    } else {
      // Update existing settings
      settings.geminiApiKey = GEMINI_API_KEY;
      await settings.save();
      console.log("✅ Updated existing settings with Gemini API key");
    }

    console.log("🔑 Gemini API Key:", settings.geminiApiKey);
    console.log("✨ Settings seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding settings:", error);
    process.exit(1);
  }
};

seedSettings();
