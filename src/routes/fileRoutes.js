const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Mount file controller routes
router.use('/', fileController);

module.exports = router;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: fileFilter
});

// Upload single file
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'No file uploaded'));
    }

    const fileData = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };

    res.json(formatResponse(true, 'File uploaded successfully', fileData));
    logger.info(`File uploaded: ${req.file.originalname} by user ${req.user.email}`);
  } catch (error) {
    logger.error('File upload error:', error);
    next(error);
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticate, upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(formatResponse(false, 'No files uploaded'));
    }

    const filesData = req.files.map(file => ({
      fileName: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`
    }));

    res.json(formatResponse(true, 'Files uploaded successfully', { files: filesData }));
    logger.info(`${req.files.length} files uploaded by user ${req.user.email}`);
  } catch (error) {
    logger.error('Multiple file upload error:', error);
    next(error);
  }
});

// Download file
router.get('/download/:filename', authenticate, async (req, res, next) => {
  try {
    const { filename } = req.params;
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    const filePath = path.join(uploadPath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(formatResponse(false, 'File not found'));
    }

    // Send file
    res.download(filePath, (err) => {
      if (err) {
        logger.error('File download error:', err);
        return res.status(500).json(formatResponse(false, 'Error downloading file'));
      }
      logger.info(`File downloaded: ${filename} by user ${req.user.email}`);
    });
  } catch (error) {
    logger.error('File download error:', error);
    next(error);
  }
});

// Delete file
router.delete('/:filename', authenticate, async (req, res, next) => {
  try {
    const { filename } = req.params;
    const uploadPath = process.env.UPLOAD_PATH || 'uploads/';
    const filePath = path.join(uploadPath, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(formatResponse(false, 'File not found'));
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json(formatResponse(true, 'File deleted successfully'));
    logger.info(`File deleted: ${filename} by user ${req.user.email}`);
  } catch (error) {
    logger.error('File deletion error:', error);
    next(error);
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(formatResponse(false, 'File too large'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(formatResponse(false, 'Too many files'));
    }
  }
  next(error);
});

module.exports = router;