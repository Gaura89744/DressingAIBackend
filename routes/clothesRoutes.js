import express from "express";

import {
  addClothes,
  getClothes,
  getClothesByCategory,
  updateClothes,
  deleteClothes,
} from "../controllers/clothesController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("image"), addClothes);

router.get("/", getClothes);

router.get("/category/:category", getClothesByCategory);

router.put("/:id", upload.single("image"), updateClothes);

router.delete("/:id", deleteClothes);

export default router;
