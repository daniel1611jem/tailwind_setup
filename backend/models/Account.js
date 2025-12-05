import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    game: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    server: {
      type: String,
      trim: true,
    },
    proxy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proxy",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    privateNote: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalGmail: {
      type: String,
      trim: true,
      default: "",
    },
    studentGmail: {
      type: String,
      trim: true,
      default: "",
    },
    studentGmails: {
      type: [String],
      default: [],
    },
    commonPassword: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    ssn: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfBirth: {
      type: String,
      trim: true,
      default: "",
    },
    // Service Account Status Fields
    githubStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    githubUsername: {
      type: String,
      trim: true,
      default: "",
    },
    githubAccount: {
      type: String,
      trim: true,
      default: "",
    },
    githubPassword: {
      type: String,
      trim: true,
      default: "",
    },
    geminiStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    geminiAccount: {
      type: String,
      trim: true,
      default: "",
    },
    geminiPassword: {
      type: String,
      trim: true,
      default: "",
    },
    canvaStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    canvaAccount: {
      type: String,
      trim: true,
      default: "",
    },
    canvaPassword: {
      type: String,
      trim: true,
      default: "",
    },
    figmaStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    figmaAccount: {
      type: String,
      trim: true,
      default: "",
    },
    figmaPassword: {
      type: String,
      trim: true,
      default: "",
    },
    gptStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    gptAccount: {
      type: String,
      trim: true,
      default: "",
    },
    gptPassword: {
      type: String,
      trim: true,
      default: "",
    },
    cursorStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    cursorAccount: {
      type: String,
      trim: true,
      default: "",
    },
    cursorPassword: {
      type: String,
      trim: true,
      default: "",
    },
    azureStatus: {
      type: String,
      enum: ["", "pending", "active", "inactive", "error"],
      default: "",
    },
    azureAccount: {
      type: String,
      trim: true,
      default: "",
    },
    azurePassword: {
      type: String,
      trim: true,
      default: "",
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    registrationDates: {
      type: Map,
      of: String,
      default: {},
    },
    expirationDates: {
      type: Map,
      of: String,
      default: {},
    },
    generatedAccounts: {
      type: Map,
      of: {
        username: String,
        accountName: String,
        password: String,
      },
      default: {},
    },
    // AI Generated Profile Fields
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    zipCode: {
      type: String,
      trim: true,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: ["", "male", "female", "other"],
      default: "",
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
