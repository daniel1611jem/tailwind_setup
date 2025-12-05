import express from "express";
import KeySale from "../models/KeySale.js";

const router = express.Router();

// Lấy tất cả key sales
router.get("/", async (req, res) => {
  try {
    const sales = await KeySale.find()
      .populate({
        path: "keyId",
        populate: [{ path: "categoryId", select: "name color" }],
      })
      .populate("userId", "name color")
      .sort({ saleDate: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy sales theo key
router.get("/key/:keyId", async (req, res) => {
  try {
    const sale = await KeySale.findOne({ keyId: req.params.keyId })
      .populate({
        path: "keyId",
        populate: [{ path: "categoryId", select: "name color" }],
      })
      .populate("userId", "name color");
    if (!sale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin bán hàng" });
    }
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy sale theo ID
router.get("/:id", async (req, res) => {
  try {
    const sale = await KeySale.findById(req.params.id)
      .populate({
        path: "keyId",
        populate: [{ path: "categoryId", select: "name color" }],
      })
      .populate("userId", "name color");
    if (!sale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin bán hàng" });
    }
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cập nhật sale
router.patch("/:id", async (req, res) => {
  try {
    const sale = await KeySale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "keyId",
        populate: [
          { path: "serviceId", select: "name price" },
          { path: "categoryId", select: "name color" },
        ],
      })
      .populate("userId", "name color");

    if (!sale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin bán hàng" });
    }
    res.json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa sale
router.delete("/:id", async (req, res) => {
  try {
    const sale = await KeySale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin bán hàng" });
    }
    res.json({ message: "Đã xóa thông tin bán hàng" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
