import mongoose from "mongoose";

const clothesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Ethnic Wear", "Tops", "Bottom Wear", "Footwear", "Accessories"],
    },

    // Optional: clothes can exist without a folder
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    colour: {
      type: String,
      default: "Not specified",
    },

    material: {
      type: String,
      default: "Not specified",
    },

    pattern: {
      type: String,
      default: "Not specified",
    },
  },
  {
    timestamps: true,
  }
);

const Clothes = mongoose.model("Clothes", clothesSchema);

export default Clothes;
