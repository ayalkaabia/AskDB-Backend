const express = require('express');
const router = express.Router();

// Import controllers
const permissionController = require('../controllers/permissionController');

// Import middleware (we'll create this later)
// const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Protected routes (authentication required)
// router.use(authenticateToken); // Uncomment when auth middleware is ready

// Permission management routes
router.get('/permissions', permissionController.getAllPermissions);
router.post('/permissions', permissionController.createPermission);
router.get('/permissions/:id', permissionController.getPermissionById);
router.put('/permissions/:id', permissionController.updatePermission);
router.delete('/permissions/:id', permissionController.deletePermission);

// User permission routes
router.get('/users/:userId/permissions', permissionController.getUserPermissions);
router.post('/users/permissions', permissionController.assignPermissionToUser);
router.delete('/users/:userId/permissions/:permissionId', permissionController.removePermissionFromUser);

module.exports = router;
