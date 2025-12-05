import mongoose from "mongoose";

const keySaleSchema = new mongoose.Schema(
  {
    keyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Key",
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerContact: {
      type: String,
      trim: true,
    },
    buyerEmail: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
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

export default mongoose.model("KeySale", keySaleSchema);
