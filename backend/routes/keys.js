import express from "express";
import Key from "../models/Key.js";
import KeySale from "../models/KeySale.js";

const router = express.Router();

// Lấy tất cả keys
router.get("/", async (req, res) => {
  try {
    const keys = await Key.find()
      .populate("categoryId", "name color")
      .populate("userId", "name color")
      .sort({ createdAt: -1 });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy keys theo category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const keys = await Key.find({ categoryId: req.params.categoryId })
      .populate("categoryId", "name color")
      .populate("userId", "name color")
      .sort({ createdAt: -1 });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy key theo ID
router.get("/:id", async (req, res) => {
  try {
    const key = await Key.findById(req.params.id)
      .populate("categoryId", "name color")
      .populate("userId", "name color");
    if (!key) {
      return res.status(404).json({ message: "Không tìm thấy key" });
    }
    res.json(key);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo key mới (có thể tạo nhiều keys cùng lúc)
router.post("/", async (req, res) => {
  try {
    const { keys } = req.body;

    if (Array.isArray(keys) && keys.length > 0) {
      // Bulk create
      const createdKeys = await Key.insertMany(keys);
      const populatedKeys = await Key.find({
        _id: { $in: createdKeys.map((k) => k._id) },
      })
        .populate("categoryId", "name color")
        .populate("userId", "name color");
      res.status(201).json(populatedKeys);
    } else {
      // Single create
      const key = new Key(req.body);
      const newKey = await key.save();
      const populated = await Key.findById(newKey._id)
        .populate("categoryId", "name color")
        .populate("userId", "name color");
      res.status(201).json(populated);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật key
router.patch("/:id", async (req, res) => {
  try {
    const key = await Key.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("categoryId", "name color")
      .populate("userId", "name color");

    if (!key) {
      return res.status(404).json({ message: "Không tìm thấy key" });
    }
    res.json(key);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Bán key - cập nhật status và tạo KeySale
router.post("/:id/sell", async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ message: "Không tìm thấy key" });
    }

    if (key.status === "sold") {
      return res.status(400).json({ message: "Key đã được bán" });
    }

    // Cập nhật status key
    key.status = "sold";
    await key.save();

    // Tạo thông tin bán hàng
    const keySale = new KeySale({
      keyId: key._id,
      ...req.body,
    });
    await keySale.save();

    const updatedKey = await Key.findById(key._id)
      .populate("categoryId", "name color")
      .populate("userId", "name color");

    res.json({ key: updatedKey, sale: keySale });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa key
router.delete("/:id", async (req, res) => {
  try {
    const key = await Key.findByIdAndDelete(req.params.id);
    if (!key) {
      return res.status(404).json({ message: "Không tìm thấy key" });
    }
    res.json({ message: "Đã xóa key" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
