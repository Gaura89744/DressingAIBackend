import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["item", "folder"],
      required: true,
    },

    clothesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothes",
      default: null,
    },

    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Automatically remove expired share links.
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;
