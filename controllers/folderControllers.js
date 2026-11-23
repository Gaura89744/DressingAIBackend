import Folder from "../models/Folder.js";
import Clothes from "../models/Clothes.js";

// CREATE FOLDER
export const createFolder = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name?.trim() || !category) {
      return res.status(400).json({
        success: false,
        message: "Folder name and category are required.",
      });
    }

    const folder = await Folder.create({
      userId: req.user._id,
      name: name.trim(),
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Folder created successfully.",
      folder,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A folder with this name already exists in this category.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET FOLDERS BY CATEGORY
export const getFoldersByCategory = async (req, res) => {
  try {
    const folders = await Folder.find({
      userId: req.user._id,
      category: req.params.category,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: folders.length,
      folders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RENAME FOLDER
export const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "New folder name is required.",
      });
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    folder.name = name.trim();
    await folder.save();

    return res.status(200).json({
      success: true,
      message: "Folder renamed successfully.",
      folder,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A folder with this name already exists in this category.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE FOLDER
export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    const clothesCount = await Clothes.countDocuments({
      userId: req.user._id,
      folderId: folder._id,
    });

    if (clothesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `This folder contains ${clothesCount} clothing item(s). Move them out before deleting the folder.`,
      });
    }

    await folder.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Folder deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
