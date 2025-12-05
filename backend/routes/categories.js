import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// Lấy tất cả categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("userId", "name color")
      .sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy category theo ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "userId",
      "name color"
    );
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo category mới
router.post("/", async (req, res) => {
  const category = new Category(req.body);
  try {
    const newCategory = await category.save();
    const populated = await Category.findById(newCategory._id).populate(
      "userId",
      "name color"
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật category
router.patch("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "name color");

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
