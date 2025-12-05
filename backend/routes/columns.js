import express from "express";
import ColumnConfig from "../models/ColumnConfig.js";
import Category from "../models/Category.js";

const router = express.Router();

// GET all column configs
router.get("/", async (req, res) => {
  try {
    const columns = await ColumnConfig.find().sort({ order: 1 });
    res.json(columns);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching columns", error: error.message });
  }
});

// GET single column config
router.get("/:id", async (req, res) => {
  try {
    const column = await ColumnConfig.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }
    res.json(column);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching column", error: error.message });
  }
});

// CREATE new column config
router.post("/", async (req, res) => {
  try {
    const column = new ColumnConfig(req.body);
    const savedColumn = await column.save();

    // Nếu là cột select và có autoGenerateCategory = true, tự động tạo category
    if (
      savedColumn.type === "select" &&
      savedColumn.autoGenerateCategory &&
      req.body.userId
    ) {
      const categoryName = savedColumn.label || savedColumn.name;

      // Kiểm tra xem category đã tồn tại chưa
      let category = await Category.findOne({
        name: categoryName,
        userId: req.body.userId,
        type: "key",
      });

      // Nếu chưa có, tạo mới
      if (!category) {
        category = new Category({
          name: categoryName,
          description: `Danh mục tự động tạo từ cột ${categoryName}`,
          type: "key",
          userId: req.body.userId,
          color: "#3B82F6",
        });
        await category.save();
      }

      // Cập nhật categoryId vào column
      savedColumn.categoryId = category._id;
      await savedColumn.save();
    }

    res.status(201).json(savedColumn);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating column", error: error.message });
  }
});

// UPDATE column config
router.put("/:id", async (req, res) => {
  try {
    const column = await ColumnConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    // Nếu bật autoGenerateCategory và chưa có categoryId, tạo category
    if (
      column.type === "select" &&
      column.autoGenerateCategory &&
      !column.categoryId &&
      req.body.userId
    ) {
      const categoryName = column.label || column.name;

      // Kiểm tra xem category đã tồn tại chưa
      let category = await Category.findOne({
        name: categoryName,
        userId: req.body.userId,
        type: "key",
      });

      // Nếu chưa có, tạo mới
      if (!category) {
        category = new Category({
          name: categoryName,
          description: `Danh mục tự động tạo từ cột ${categoryName}`,
          type: "key",
          userId: req.body.userId,
          color: "#3B82F6",
        });
        await category.save();
      }

      // Cập nhật categoryId vào column
      column.categoryId = category._id;
      await column.save();
    }

    res.json(column);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating column", error: error.message });
  }
});

// DELETE column config
router.delete("/:id", async (req, res) => {
  try {
    const column = await ColumnConfig.findByIdAndDelete(req.params.id);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }
    res.json({ message: "Column deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting column", error: error.message });
  }
});

// Bulk update order
router.post("/reorder", async (req, res) => {
  try {
    const { columns } = req.body; // Array of { id, order }

    const updates = columns.map(({ id, order }) =>
      ColumnConfig.updateOne({ _id: id }, { $set: { order } })
    );

    await Promise.all(updates);

    const updatedColumns = await ColumnConfig.find().sort({ order: 1 });
    res.json(updatedColumns);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error reordering columns", error: error.message });
  }
});

export default router;
