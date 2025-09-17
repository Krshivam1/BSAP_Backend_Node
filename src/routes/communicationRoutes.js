const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
	validatePagination,
	validateId,
	validateCommunicationCreate,
	validateMessageCreate,
	validateArrayOfIds
} = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/auth');
const communicationController = require('../controllers/communicationController');

const router = express.Router();

// Configure multer storage for communication attachments
const uploadDir = path.join(__dirname, '..', 'uploads', 'communications');
try {
	fs.mkdirSync(uploadDir, { recursive: true });
} catch (_) { /* no-op */ }

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, `attachment-${uniqueSuffix}${ext}`);
	}
});

const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
		if (extname && mimetype) return cb(null, true);
		return cb(new Error('Invalid file type'));
	}
});

// Routes
// Static routes first
router.get('/', authenticate, validatePagination, communicationController.list);
router.get('/user', authenticate, communicationController.userCommunications);
router.get('/search/:searchTerm', authenticate, communicationController.search);
router.put('/messages/:messageId/status', authenticate, communicationController.updateMessageStatus);
router.post('/start', authenticate, upload.array('attachments', 5), validateCommunicationCreate, communicationController.start);

// Routes with :id
router.get('/:id/statistics', authenticate, validateId, communicationController.statistics);
router.get('/:id/messages', authenticate, validateId, communicationController.messages);
router.get('/:id/users', authenticate, validateId, communicationController.users);
router.post('/:id/users', authenticate, validateId, validateArrayOfIds('userIds'), communicationController.addUsers);
router.delete('/:id/users/:userId', authenticate, communicationController.removeUser);
router.get('/:id/update-status', authenticate, validateId, communicationController.updateStatus);
router.get('/:id', authenticate, validateId, communicationController.detail);
router.put('/:id', authenticate, validateId, communicationController.update);
router.delete('/:id', authenticate, validateId, communicationController.remove);
router.post('/:id/reply', authenticate, upload.array('attachments', 5), validateMessageCreate, communicationController.reply);

module.exports = router;