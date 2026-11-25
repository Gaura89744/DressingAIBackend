import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import folderRoutes from "./routes/folderRoutes.js";
import connectDB from "./config/db.js";
import shareRoutes from "./routes/shareRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import clothesRoutes from "./routes/clothesRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ClosetAI API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/shares", shareRoutes);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ClosetAI server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
