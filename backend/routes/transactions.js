import express from "express";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

const router = express.Router();

// Lấy tất cả giao dịch
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("accountId")
      .populate("createdBy")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy giao dịch theo account
router.get("/account/:accountId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      accountId: req.params.accountId,
    })
      .populate("createdBy")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo giao dịch bán hàng
router.post("/", async (req, res) => {
  try {
    const {
      accountId,
      buyerName,
      buyerContact,
      amount,
      paymentMethod,
      duration,
      registrationDate,
      expirationDate,
      apps,
      notes,
      createdBy,
    } = req.body;

    // Tạo transaction
    const transaction = new Transaction({
      accountId,
      type: "sold",
      buyerName,
      buyerContact,
      amount,
      paymentMethod,
      duration,
      registrationDate,
      expirationDate,
      apps,
      notes,
      createdBy,
      history: [
        {
          action: "sold",
          status: "active",
          notes: `Đã bán cho ${buyerName}`,
          timestamp: new Date(),
          updatedBy: createdBy,
        },
      ],
    });

    await transaction.save();

    // Cập nhật trạng thái account - chuyển các app đã bán sang "Đã bán"
    const account = await Account.findById(accountId);
    if (account) {
      const updatedFields = { ...account.customFields };
      apps.forEach((app) => {
        if (updatedFields[app] === "Thành công") {
          updatedFields[app] = "Đã bán";
        }
      });
      account.customFields = updatedFields;
      await account.save();
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Gia hạn giao dịch
router.patch("/:id/extend", async (req, res) => {
  try {
    const { duration, notes, updatedBy } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    // Tính ngày hết hạn mới từ ngày hết hạn hiện tại
    const currentExpiration = new Date(transaction.expirationDate);
    const newExpiration = new Date(currentExpiration);
    newExpiration.setMonth(newExpiration.getMonth() + parseInt(duration));

    // Cập nhật duration và expiration
    transaction.duration = transaction.duration + parseInt(duration);
    transaction.expirationDate = newExpiration;

    // Thêm vào history
    transaction.history.push({
      action: "extended",
      status: transaction.status,
      notes: notes || `Gia hạn thêm ${duration} tháng`,
      timestamp: new Date(),
      updatedBy,
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật trạng thái giao dịch (đổi trả, hoàn tiền, etc.)
router.patch("/:id", async (req, res) => {
  try {
    const { status, notes, action, updatedBy, apps } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    // Cập nhật status
    if (status) {
      transaction.status = status;
    }

    // Thêm vào history
    transaction.history.push({
      action: action || "status_changed",
      status: status || transaction.status,
      notes: notes || "",
      timestamp: new Date(),
      updatedBy,
    });

    await transaction.save();

    // Nếu là đổi trả/hoàn tiền, cập nhật lại account
    if (status === "returned" || status === "refunded") {
      const account = await Account.findById(transaction.accountId);
      if (account && apps) {
        const updatedFields = { ...account.customFields };
        apps.forEach((app) => {
          if (updatedFields[app] === "Đã bán") {
            updatedFields[app] = "Thành công"; // Trả về tồn kho
          }
        });
        account.customFields = updatedFields;
        await account.save();
      }
    }

    res.json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xóa giao dịch
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    await transaction.deleteOne();
    res.json({ message: "Đã xóa giao dịch" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
