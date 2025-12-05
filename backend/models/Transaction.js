import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["sold", "returned", "refunded", "exchanged"],
      default: "sold",
    },
    // Thông tin người mua
    buyerName: {
      type: String,
      required: true,
    },
    buyerContact: {
      type: String,
    },
    // Thông tin giao dịch
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
    },
    // Thông tin thời hạn
    duration: {
      type: Number, // Số tháng
    },
    registrationDate: {
      type: Date, // Ngày đăng ký thành công
    },
    expirationDate: {
      type: Date, // Ngày hết hạn gói
    },
    // App được bán
    apps: [
      {
        type: String, // Tên cột/app: "Canva", "Git", etc.
      },
    ],
    // Ghi chú và lịch sử
    notes: {
      type: String,
    },
    history: [
      {
        action: String, // "sold", "returned", "status_changed"
        status: String,
        notes: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "expired", "returned", "refunded"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);
