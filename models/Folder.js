import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
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

    category: {
      type: String,
      required: true,
      enum: ["Ethnic Wear", "Tops", "Bottom Wear", "Footwear", "Accessories"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate folder names within the same user's category
folderSchema.index({ userId: 1, category: 1, name: 1 }, { unique: true });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
