import crypto from "crypto";
import mongoose from "mongoose";

import ShareLink from "../models/ShareLink.js";
import Clothes from "../models/Clothes.js";
import Folder from "../models/Folder.js";

// CREATE SHARE LINK FOR ONE CLOTHING ITEM
export const createItemShare = async (req, res) => {
  try {
    const { clothesId } = req.params;

    if (!mongoose.isValidObjectId(clothesId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid clothing ID.",
      });
    }

    // Verify that this item belongs to the logged-in user.
    const clothes = await Clothes.findOne({
      _id: clothesId,
      userId: req.user._id,
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const share = await ShareLink.create({
      ownerId: req.user._id,
      targetType: "item",
      clothesId: clothes._id,
      token,
    });

    return res.status(201).json({
      success: true,
      message: "Clothing share link created.",
      share,
      token,
    });
  } catch (error) {
    console.error("CREATE ITEM SHARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create share link.",
    });
  }
};

// CREATE SHARE LINK FOR AN ENTIRE FOLDER
export const createFolderShare = async (req, res) => {
  try {
    const { folderId } = req.params;

    if (!mongoose.isValidObjectId(folderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid folder ID.",
      });
    }

    // Verify folder ownership.
    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const share = await ShareLink.create({
      ownerId: req.user._id,
      targetType: "folder",
      folderId: folder._id,
      token,
    });

    return res.status(201).json({
      success: true,
      message: "Folder share link created.",
      share,
      token,
    });
  } catch (error) {
    console.error("CREATE FOLDER SHARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create folder share link.",
    });
  }
};

// PUBLIC: VIEW SHARED ITEM OR FOLDER
export const getSharedContent = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await ShareLink.findOne({
      token,
      isActive: true,
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "This sharing link is invalid or has been revoked.",
      });
    }

    // Check expiration explicitly. Do not rely only on MongoDB TTL cleanup.
    if (share.expiresAt && share.expiresAt <= new Date()) {
      return res.status(410).json({
        success: false,
        message: "This sharing link has expired.",
      });
    }

    if (share.targetType === "item") {
      const clothes = await Clothes.findOne({
        _id: share.clothesId,
        userId: share.ownerId,
      }).select(
        "name imageUrl category type colour material pattern createdAt"
      );

      if (!clothes) {
        return res.status(404).json({
          success: false,
          message: "This clothing item is no longer available.",
        });
      }

      return res.status(200).json({
        success: true,
        targetType: "item",
        clothes,
      });
    }

    if (share.targetType === "folder") {
      const folder = await Folder.findOne({
        _id: share.folderId,
        userId: share.ownerId,
      }).select("name category");

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "This folder is no longer available.",
        });
      }

      // Fetch the folder's current contents.
      const clothes = await Clothes.find({
        userId: share.ownerId,
        folderId: folder._id,
      })
        .select("name imageUrl category type colour material pattern createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        targetType: "folder",
        folder,
        count: clothes.length,
        clothes,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid sharing type.",
    });
  } catch (error) {
    console.error("GET SHARED CONTENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load shared content.",
    });
  }
};

// REVOKE A SHARE LINK
export const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!mongoose.isValidObjectId(shareId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid share ID.",
      });
    }

    const share = await ShareLink.findOneAndUpdate(
      {
        _id: shareId,
        ownerId: req.user._id,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share link not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Share link revoked successfully.",
    });
  } catch (error) {
    console.error("REVOKE SHARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to revoke share link.",
    });
  }
};
