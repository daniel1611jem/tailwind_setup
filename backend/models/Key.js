import mongoose from "mongoose";

const keySchema = new mongoose.Schema(
  {
    keyCode: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    // Account-specific fields
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    createdDate: {
      type: Date,
    },
    duration: {
      type: Number, // Duration in days
    },
    expirationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["in_stock", "sold"],
      default: "in_stock",
    },
    notes: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Key", keySchema);
