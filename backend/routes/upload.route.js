import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload, cloudinary } from "../config/cloudinary.js";

const router = express.Router();


// Single file upload (existing)
router.post("/upload", upload.single("document"), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      message: req.fileValidationError
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  res.json({
    success: true,
    file: {
      url: req.file.path,
      originalName: req.file.originalname,
      type: req.file.mimetype
    }
  });
});

// Multiple files upload (NEW) - Yeh add karo
router.post("/upload-multiple", upload.array("documents", 10), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      message: req.fileValidationError
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded"
    });
  }

  const uploadedFiles = req.files.map(file => ({
    url: file.path,
    originalName: file.originalname,
    type: file.mimetype,
    // Agar frontend se type bhej rahe ho toh woh bhi include karo
    documentType: req.body.types ? req.body.types[req.files.indexOf(file)] : null
  }));

  res.json({
    success: true,
    files: uploadedFiles
  });
});


// Delete file endpoint (unchanged but slightly more explicit)
router.delete("/upload/:publicId", protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);

    if (result && result.result === "ok") {
      return res.status(200).json({ message: "File deleted successfully" });
    } else if (result && result.result === "not found") {
      return res.status(404).json({ message: "File not found on Cloudinary" });
    } else {
      return res.status(400).json({ message: "Unable to delete file", detail: result });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      message: "Server error during file deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
