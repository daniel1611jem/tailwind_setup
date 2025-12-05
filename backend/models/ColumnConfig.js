import mongoose from "mongoose";

const columnConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "number", "select", "date", "proxy", "email", "password"],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ], // Cho type select
    required: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    width: {
      type: mongoose.Schema.Types.Mixed, // Chấp nhận cả Number và String ('auto')
      default: 150,
    },
    autoGenerateCategory: {
      type: Boolean,
      default: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    successValue: {
      type: String,
      default: "",
    },
    durationDays: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

const ColumnConfig = mongoose.model("ColumnConfig", columnConfigSchema);

export default ColumnConfig;
