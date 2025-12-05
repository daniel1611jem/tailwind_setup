import mongoose from "mongoose";

const proxySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["http", "https", "socks4", "socks5"],
      default: "http",
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    lastChecked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual để lấy proxy string đầy đủ
proxySchema.virtual("proxyString").get(function () {
  let auth = "";
  if (this.username && this.password) {
    auth = `${this.username}:${this.password}@`;
  }
  return `${this.type}://${auth}${this.ip}:${this.port}`;
});

const Proxy = mongoose.model("Proxy", proxySchema);

export default Proxy;
