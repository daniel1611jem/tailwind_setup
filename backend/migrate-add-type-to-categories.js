import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mmo-account-management";

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all categories without type field
    const categories = await Category.find();
    console.log(`📊 Found ${categories.length} categories`);

    let updated = 0;
    for (const category of categories) {
      if (!category.type) {
        category.type = "key"; // Default to "key" for existing categories
        await category.save();
        updated++;
        console.log(`✅ Updated category: ${category.name} -> type: "key"`);
      } else {
        console.log(
          `⏭️  Skipped category: ${category.name} (already has type: ${category.type})`
        );
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updated} categories.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
