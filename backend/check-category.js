import mongoose from "mongoose";
import Category from "./models/Category.js";

mongoose.connect("mongodb://127.0.0.1:27017/key-management");

const categoryId = "69300e1ef7b7f14e3e3a38bf";

async function checkCategory() {
  try {
    const category = await Category.findById(categoryId);
    console.log("\n📋 Category Data:");
    console.log(JSON.stringify(category, null, 2));
    console.log("\n🔍 Type field:", category?.type);
    console.log("🔍 Has type field?", category?.hasOwnProperty("type"));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Connection closed");
  }
}

checkCategory();
