const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');

// Import middleware (we'll create this later)
// const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/auth/register', userController.registerUser);
router.post('/auth/login', userController.loginUser);

// Protected routes (authentication required)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

// User management routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
