import express from "express";

import {
  createItemShare,
  createFolderShare,
  getSharedContent,
  revokeShare,
} from "../controllers/shareController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: recipient does not need to log in.
router.get("/:token", getSharedContent);

// Protected routes: only logged-in owners can create or revoke links.
router.post("/item/:clothesId", protect, createItemShare);
router.post("/folder/:folderId", protect, createFolderShare);
router.delete("/:shareId", protect, revokeShare);

export default router;
