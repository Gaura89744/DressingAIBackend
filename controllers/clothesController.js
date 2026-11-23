import Clothes from "../models/Clothes.js";
import Folder from "../models/Folder.js";
import cloudinary from "../config/cloudinary.js";

// ADD CLOTHES
export const addClothes = async (req, res) => {
  try {
    const { name, category, type, colour, material, pattern, folderId } =
      req.body;

    if (!name || !category || !type || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name, category, type and image are required.",
      });
    }

    // Validate optional folder
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id,
        category,
      });

      if (!folder) {
        return res.status(400).json({
          success: false,
          message: "Invalid folder for this category.",
        });
      }
    }

    const clothes = await Clothes.create({
      userId: req.user._id,
      name,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
      category,
      folderId: folderId || null,
      type,
      colour,
      material,
      pattern,
    });

    return res.status(201).json({
      success: true,
      message: "Clothing added successfully.",
      clothes,
    });
  } catch (error) {
    console.error("ADD CLOTHES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL CLOTHES
export const getClothes = async (req, res) => {
  try {
    const clothes = await Clothes.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clothes.length,
      clothes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CLOTHES BY CATEGORY
export const getClothesByCategory = async (req, res) => {
  try {
    const clothes = await Clothes.find({
      userId: req.user._id,
      category: req.params.category,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clothes.length,
      clothes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CLOTHES BY FOLDER
export const getClothesByFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.folderId,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found.",
      });
    }

    const clothes = await Clothes.find({
      userId: req.user._id,
      folderId: folder._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clothes.length,
      clothes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CLOTHES
export const updateClothes = async (req, res) => {
  try {
    const clothes = await Clothes.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "type",
      "colour",
      "material",
      "pattern",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        clothes[field] = req.body[field];
      }
    }

    // Handle folder assignment or removal
    if (req.body.folderId !== undefined) {
      if (req.body.folderId) {
        const folder = await Folder.findOne({
          _id: req.body.folderId,
          userId: req.user._id,
          category: clothes.category,
        });

        if (!folder) {
          return res.status(400).json({
            success: false,
            message: "Invalid folder for this category.",
          });
        }

        clothes.folderId = folder._id;
      } else {
        clothes.folderId = null;
      }
    }

    // If category changes, the old folder may no longer match
    if (req.body.category !== undefined && clothes.folderId) {
      const folder = await Folder.findOne({
        _id: clothes.folderId,
        userId: req.user._id,
        category: clothes.category,
      });

      if (!folder) {
        clothes.folderId = null;
      }
    }

    if (req.file) {
      if (clothes.imagePublicId) {
        await cloudinary.uploader.destroy(clothes.imagePublicId);
      }

      clothes.imageUrl = req.file.path;
      clothes.imagePublicId = req.file.filename;
    }

    await clothes.save();

    return res.status(200).json({
      success: true,
      message: "Clothing updated successfully.",
      clothes,
    });
  } catch (error) {
    console.error("UPDATE CLOTHES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CLOTHES
export const deleteClothes = async (req, res) => {
  try {
    const clothes = await Clothes.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!clothes) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    if (clothes.imagePublicId) {
      await cloudinary.uploader.destroy(clothes.imagePublicId);
    }

    await clothes.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Clothing deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CLOTHES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
