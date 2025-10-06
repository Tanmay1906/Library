const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, requirePermission } = require('../middlewares/auth');
const { catchAsync, ValidationError } = require('../middlewares/errorHandler');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.params.type || 'general';
    const fullPath = path.join(uploadDir, subfolder);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types based on upload type
  const allowedTypes = {
    'aadhar': ['.pdf', '.jpg', '.jpeg', '.png'],
    'profile': ['.jpg', '.jpeg', '.png'],
    'book': ['.pdf', '.epub', '.txt'],
    'general': ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
  };

  const uploadType = req.params.type || 'general';
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes[uploadType] && allowedTypes[uploadType].includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`File type ${fileExt} not allowed for ${uploadType} upload`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload endpoint
router.post('/:type', 
  authenticate,
  requirePermission('write:students'), // Adjust permission based on upload type
  upload.single('file'),
  catchAsync(async (req, res) => {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadType: req.params.type,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    // Generate file URL (adjust based on your setup)
    const fileUrl = `/uploads/${req.params.type}/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: req.file.filename,
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });
  })
);

// Serve uploaded files
router.get('/:type/:filename', catchAsync(async (req, res) => {
  const filePath = path.join(uploadDir, req.params.type, req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  res.sendFile(filePath);
}));

module.exports = router;
