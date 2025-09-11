// file: backend/routes/upload.route.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload endpoint
router.post('/upload', protect, upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Map files to return their Cloudinary info
    const uploadedFiles = req.files.map(file => ({
      name: file.originalname,
      url: file.path,
      publicId: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Server error during file upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete file endpoint
router.delete('/upload/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Server error during file deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;