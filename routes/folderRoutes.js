import express from "express";

import {
  createFolder,
  getFoldersByCategory,
  renameFolder,
  deleteFolder,
} from "../controllers/folderController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createFolder);
router.get("/category/:category", getFoldersByCategory);
router.put("/:id", renameFolder);
router.delete("/:id", deleteFolder);

export default router;
