import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// configure cloudinary from env (ensure env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// storage configuration (resource_type: 'auto' helps with docs/images)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "gys-hrms",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
  },
});

// safe fileFilter (do not throw plain Error)
const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".txt"];
// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const mimetypeOk = /jpeg|jpg|png|gif|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|plain/.test(
//     file.mimetype
//   );

//   if (mimetypeOk && allowedExts.includes(ext)) {
//     cb(null, true);
//   } else {
//     // signal validation error without throwing; store message on req
//     req.fileValidationError = "File type not supported. Allowed: JPG, PNG, PDF, DOC, DOCX, TXT.";
//     cb(null, false);
//   }
// };

// backend/config/cloudinary.js - Update fileFilter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    req.fileValidationError = "File type not supported. Allowed: JPG, PNG, PDF, DOC, DOCX, TXT.";
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export { cloudinary, upload };
