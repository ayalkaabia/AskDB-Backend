const multer = require('multer');
const path = require('path');

const uploadMiddleware = (req, res, next) => {
  // This middleware is used to handle file upload errors
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // Check file type
      if (file.mimetype === 'application/octet-stream' || 
          file.originalname.endsWith('.sql') || 
          file.originalname.endsWith('.db')) {
        cb(null, true);
      } else {
        cb(new Error('Only .sql and .db files are allowed'), false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  }).single('file');

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'File too large (max 50MB)'
        });
      }
      return res.status(400).json({
        error: 'Bad Request',
        message: err.message
      });
    } else if (err) {
      return res.status(400).json({
        error: 'Bad Request',
        message: err.message
      });
    }
    next();
  });
};

module.exports = {
  uploadMiddleware
};
