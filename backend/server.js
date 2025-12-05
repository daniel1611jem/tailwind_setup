import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import accountRoutes from "./routes/accounts.js";
import proxyRoutes from "./routes/proxies.js";
import columnRoutes from "./routes/columns.js";
import settingsRoutes from "./routes/settings.js";
import mediaRoutes from "./routes/media.js";
import userRoutes from "./routes/users.js";
import exifRoutes from "./routes/exif.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";
import keyRoutes from "./routes/keys.js";
import keySaleRoutes from "./routes/key-sales.js";

dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/proxies", proxyRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exif", exifRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/key-sales", keySaleRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "MMO Account Management API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
