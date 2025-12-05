import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// Verify delete code
router.post("/verify-delete-code", async (req, res) => {
  try {
    const { code } = req.body;

    const setting = await Settings.findOne({ key: "delete_protection_code" });

    if (!setting) {
      // Nếu chưa có code, tạo mặc định là 'admin123' (bạn có thể thay đổi trực tiếp trong DB)
      await Settings.create({
        key: "delete_protection_code",
        value: "admin123",
        description:
          "Mã bảo vệ để xóa tài khoản. Thay đổi trực tiếp trong MongoDB.",
      });

      return res.json({ valid: code === "admin123" });
    }

    res.json({ valid: code === setting.value });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying code", error: error.message });
  }
});

// Get settings (chỉ cho admin)
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.find();
    res.json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching settings", error: error.message });
  }
});

// Get Gemini API Key
router.get("/gemini-api-key", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ apiKey: settings?.geminiApiKey || "" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching API key", error: error.message });
  }
});

// Save Gemini API Key
router.post("/gemini-api-key", async (req, res) => {
  try {
    const { apiKey } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings document
      settings = await Settings.create({
        key: "app_settings",
        value: {},
        geminiApiKey: apiKey,
        description: "Application settings",
      });
    } else {
      // Update existing
      settings.geminiApiKey = apiKey;
      await settings.save();
    }

    res.json({
      message: "API key saved successfully",
      apiKey: settings.geminiApiKey,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving API key", error: error.message });
  }
});

export default router;
