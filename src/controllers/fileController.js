const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { ValidationException, NotFoundException } = require('../exceptions');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.params.type || 'general';
    const uploadPath = path.join(process.env.UPLOAD_PATH || 'uploads/', uploadType);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    general: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const uploadType = req.params.type || 'general';
  const allowed = allowedTypes[uploadType] || allowedTypes.general;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationException(`File type ${file.mimetype} not allowed for ${uploadType} uploads`, [
      { field: 'file', message: `Allowed types: ${allowed.join(', ')}` }
    ]), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

/**
 * @route POST /api/files/upload/:type
 * @desc Upload single file
 * @access Authenticated users
 */
router.post('/upload/:type?', authenticate, upload.single('file'), ErrorHandler.asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationException('No file provided', [{ field: 'file', message: 'File is required' }]);
  }

  const fileInfo = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadType: req.params.type || 'general',
    url: `/api/files/download/${req.file.filename}`
  };

  logger.info(`File uploaded: ${req.file.originalname} by user ${req.user.id}`);

  res.json(ResponseFormatter.success(fileInfo, 'File uploaded successfully'));
}));

/**
 * @route POST /api/files/upload-multiple/:type
 * @desc Upload multiple files
 * @access Authenticated users
 */
router.post('/upload-multiple/:type?', authenticate, upload.array('files', 5), ErrorHandler.asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ValidationException('No files provided', [{ field: 'files', message: 'At least one file is required' }]);
  }

  const filesInfo = req.files.map(file => ({
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    uploadType: req.params.type || 'general',
    url: `/api/files/download/${file.filename}`
  }));

  logger.info(`${req.files.length} files uploaded by user ${req.user.id}`);

  res.json(ResponseFormatter.success(filesInfo, `${req.files.length} files uploaded successfully`));
}));

/**
 * @route GET /api/files/download/:filename
 * @desc Download file by filename
 * @access Public (if file exists and is accessible)
 */
router.get('/download/:filename', ErrorHandler.asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Search for file in all upload directories
  const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
  const searchDirs = ['general', 'images', 'documents', 'spreadsheets'];
  
  let filePath = null;
  for (const dir of searchDirs) {
    const potentialPath = path.join(uploadPath, dir, filename);
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath;
      break;
    }
  }

  // Also check root upload directory
  if (!filePath) {
    const rootPath = path.join(uploadPath, filename);
    if (fs.existsSync(rootPath)) {
      filePath = rootPath;
    }
  }

  if (!filePath) {
    throw new NotFoundException('File', filename);
  }

  // Set appropriate headers
  const stat = fs.statSync(filePath);
  const fileExtension = path.extname(filename).toLowerCase();
  
  // Set content type based on file extension
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[fileExtension] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `inline; filename="${path.basename(filename)}"`);

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}));

/**
 * @route GET /api/files/info/:filename
 * @desc Get file information
 * @access Authenticated users
 */
router.get('/info/:filename', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Search for file in all upload directories
  const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
  const searchDirs = ['general', 'images', 'documents', 'spreadsheets'];
  
  let filePath = null;
  let uploadType = 'general';
  
  for (const dir of searchDirs) {
    const potentialPath = path.join(uploadPath, dir, filename);
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath;
      uploadType = dir;
      break;
    }
  }

  if (!filePath) {
    const rootPath = path.join(uploadPath, filename);
    if (fs.existsSync(rootPath)) {
      filePath = rootPath;
    }
  }

  if (!filePath) {
    throw new NotFoundException('File', filename);
  }

  const stat = fs.statSync(filePath);
  const fileInfo = {
    filename: filename,
    size: stat.size,
    uploadType: uploadType,
    createdAt: stat.birthtime,
    modifiedAt: stat.mtime,
    url: `/api/files/download/${filename}`
  };

  res.json(ResponseFormatter.success(fileInfo, 'File information retrieved successfully'));
}));

/**
 * @route DELETE /api/files/:filename
 * @desc Delete file
 * @access Authenticated users (only own files or admin)
 */
router.delete('/:filename', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Search for file in all upload directories
  const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
  const searchDirs = ['general', 'images', 'documents', 'spreadsheets'];
  
  let filePath = null;
  for (const dir of searchDirs) {
    const potentialPath = path.join(uploadPath, dir, filename);
    if (fs.existsSync(potentialPath)) {
      filePath = potentialPath;
      break;
    }
  }

  if (!filePath) {
    const rootPath = path.join(uploadPath, filename);
    if (fs.existsSync(rootPath)) {
      filePath = rootPath;
    }
  }

  if (!filePath) {
    throw new NotFoundException('File', filename);
  }

  // Delete the file
  fs.unlinkSync(filePath);

  logger.info(`File deleted: ${filename} by user ${req.user.id}`);

  res.json(ResponseFormatter.success(null, 'File deleted successfully'));
}));

/**
 * @route GET /api/files/list/:type?
 * @desc List files by type
 * @access Authenticated users
 */
router.get('/list/:type?', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const uploadType = req.params.type || 'general';
  const uploadPath = path.join(process.env.UPLOAD_PATH || 'uploads/', uploadType);

  if (!fs.existsSync(uploadPath)) {
    return res.json(ResponseFormatter.success([], 'No files found'));
  }

  const files = fs.readdirSync(uploadPath)
    .map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stat = fs.statSync(filePath);
      
      return {
        filename: filename,
        size: stat.size,
        uploadType: uploadType,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
        url: `/api/files/download/${filename}`
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(ResponseFormatter.success(files, `Files in ${uploadType} category retrieved successfully`));
}));

/**
 * @route POST /api/files/cleanup
 * @desc Clean up old files (admin only)
 * @access Admin, SuperAdmin
 */
router.post('/cleanup', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { olderThanDays = 30 } = req.body;
  const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));

  const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
  const searchDirs = ['general', 'images', 'documents', 'spreadsheets'];
  
  let deletedCount = 0;
  let totalSize = 0;

  for (const dir of searchDirs) {
    const dirPath = path.join(uploadPath, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const filename of files) {
      const filePath = path.join(dirPath, filename);
      const stat = fs.statSync(filePath);
      
      if (stat.mtime < cutoffDate) {
        totalSize += stat.size;
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  }

  const cleanupResult = {
    deletedFiles: deletedCount,
    freedSpace: totalSize,
    cutoffDate: cutoffDate.toISOString()
  };

  logger.info(`File cleanup completed: ${deletedCount} files deleted, ${totalSize} bytes freed by user ${req.user.id}`);

  res.json(ResponseFormatter.success(cleanupResult, 'File cleanup completed successfully'));
}));

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(ResponseFormatter.error('File too large', [{
        field: 'file',
        message: `File size must be less than ${process.env.MAX_FILE_SIZE || '10MB'}`
      }]));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(ResponseFormatter.error('Too many files', [{
        field: 'files',
        message: 'Maximum 5 files allowed per request'
      }]));
    }
  }
  next(error);
});

module.exports = router;