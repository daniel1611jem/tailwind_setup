import express from "express";
import Account from "../models/Account.js";
import ColumnConfig from "../models/ColumnConfig.js";
import Key from "../models/Key.js";
import Proxy from "../models/Proxy.js";
import Settings from "../models/Settings.js";
import { aiService } from "../services/aiService.js";

const router = express.Router();

// GET all accounts
router.get("/", async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate("proxy")
      .populate("userId")
      .sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching accounts", error: error.message });
  }
});

// TEST API KEY - Must be BEFORE /:id route
router.get("/test-ai", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        message: "API key not found",
        hasSettings: !!settings,
      });
    }

    res.json({
      message: "API key found",
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + "...",
      isValid: apiKey.startsWith("AIza"),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error testing AI",
      error: error.message,
    });
  }
});

// GET single account by ID - After specific routes
router.get("/:id", async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate("proxy")
      .populate("userId");
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching account", error: error.message });
  }
});

// AI GENERATE PROFILE - Must be BEFORE POST / to avoid conflict
router.post("/generate-profile", async (req, res) => {
  try {
    const { proxyId, accountId, city, state } = req.body;

    console.log("📥 Generate profile request:", {
      proxyId,
      accountId,
      city,
      state,
    });

    // Get API key from settings
    const settings = await Settings.findOne();
    const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    console.log("🔑 API Key status:", apiKey ? "Found" : "Missing");

    if (!apiKey) {
      return res.status(400).json({
        message:
          "Google Gemini API key not configured. Please add it in Settings.",
      });
    }

    // Initialize AI service with API key
    aiService.initialize(apiKey);

    let locationData = { city: null, state: null, country: "US" };

    // Priority 1: Use city/state from request params (manual selection)
    if (city && state) {
      locationData.city = city;
      locationData.state = state;
    }
    // Priority 2: Use proxy location if available
    else if (proxyId) {
      const proxy = await Proxy.findById(proxyId);
      if (proxy) {
        locationData.city = proxy.city;
        locationData.state = proxy.state;
        locationData.country = proxy.country || "US";
      }
    }

    // If no location data, AI will use default (Los Angeles)
    if (!locationData.city && !locationData.state) {
      locationData.city = "Los Angeles";
      locationData.state = "CA";
    }

    // Get existing profiles to avoid duplicates
    const existingProfiles = await Account.find({
      fullName: { $exists: true, $ne: "" },
    }).select("fullName");

    // Generate profile
    const profileData = await aiService.generateProfile(
      locationData,
      existingProfiles
    );

    res.json(profileData);
  } catch (error) {
    console.error("Generate Profile Error:", error);
    res.status(500).json({
      message: "Error generating profile",
      error: error.message,
    });
  }
});

// CREATE new account
router.post("/", async (req, res) => {
  try {
    console.log(
      "Creating account with body:",
      JSON.stringify(req.body, null, 2)
    );
    const account = new Account(req.body);
    console.log("Account model created, saving...");
    const savedAccount = await account.save();
    console.log("Account saved successfully:", savedAccount._id);
    await savedAccount.populate("userId");
    await savedAccount.populate("proxy");
    res.status(201).json(savedAccount);
  } catch (error) {
    console.error("Error creating account:", error);
    res
      .status(400)
      .json({ message: "Error creating account", error: error.message });
  }
});

// UPDATE account
router.put("/:id", async (req, res) => {
  try {
    // Lấy account hiện tại từ database
    const currentAccount = await Account.findById(req.params.id);
    if (!currentAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    // MERGE customFields thay vì REPLACE
    if (req.body.customFields) {
      req.body.customFields = {
        ...currentAccount.customFields.toObject(), // Dữ liệu cũ
        ...req.body.customFields, // Dữ liệu mới (merge/override)
      };
    }

    // Lấy tất cả columns để xử lý
    const columns = await ColumnConfig.find({
      type: "select",
      autoGenerateCategory: true,
    });

    // Xử lý các cột select có autoGenerateCategory
    for (const column of columns) {
      const fieldName = column.name;
      const newValue = req.body.customFields?.[fieldName];
      const oldValue = currentAccount.customFields.get(fieldName);

      // Nếu giá trị thay đổi và bằng successValue
      if (
        newValue &&
        newValue !== oldValue &&
        newValue === column.successValue &&
        column.categoryId
      ) {
        // Tự động tạo tài khoản và username
        let username = "";
        let accountName = "";
        let password =
          req.body.commonPassword || currentAccount.commonPassword || "";

        if (req.body.studentGmail || currentAccount.studentGmail) {
          username = req.body.studentGmail || currentAccount.studentGmail;
          accountName = username.split("@")[0]; // Lấy phần trước @ làm account name
        }

        // Lưu thông tin tài khoản được tạo
        if (!req.body.generatedAccounts) {
          req.body.generatedAccounts =
            currentAccount.generatedAccounts || new Map();
        }
        req.body.generatedAccounts.set(fieldName, {
          username,
          accountName,
          password,
        });

        // Tính toán ngày hết hạn
        const expirationDate = new Date();
        expirationDate.setDate(
          expirationDate.getDate() + (column.durationDays || 30)
        );

        // Lưu expirationDate
        if (!req.body.expirationDates) {
          req.body.expirationDates =
            currentAccount.expirationDates || new Map();
        }
        req.body.expirationDates.set(fieldName, expirationDate.toISOString());

        // Tự động thêm vào kho (Key)
        try {
          const newKey = new Key({
            keyCode: `${accountName || username}_${fieldName}_${Date.now()}`,
            categoryId: column.categoryId,
            username: username,
            password: password,
            createdDate: new Date(),
            duration: column.durationDays || 30,
            expirationDate: expirationDate,
            status: "in_stock",
            notes: `Tự động tạo từ ${column.label} - Account: ${
              currentAccount.name || currentAccount._id
            }`,
            userId: currentAccount.userId,
          });
          await newKey.save();
        } catch (keyError) {
          console.error("Error creating key:", keyError);
          // Không throw error để không làm gián đoạn việc update account
        }
      }
    }

    // Update với dữ liệu đã merge
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("userId")
      .populate("proxy");

    res.json(account);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating account", error: error.message });
  }
});

// DELETE account
router.delete("/:id", async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
});

export default router;
