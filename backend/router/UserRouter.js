const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Import controllers
const userController = require('../controllers/userController');

// Import middleware
const auth = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../middleware/schemas');

// =============================================================================
// AUTH & USER ROUTES
// =============================================================================

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/register - Register new user
router.post('/auth/register', authLimiter, validateBody(registerSchema), userController.register);

// POST /auth/login - Login user
router.post('/auth/login', authLimiter, validateBody(loginSchema), userController.login);

// GET /users/me - Get current user profile
router.get('/me', auth, userController.me);

// PUT /users/me - Update current user profile
router.put('/me', auth, userController.updateMe);

module.exports = router;
