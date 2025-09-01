const permissionRepo = require('../repos/permissionRepo');

const getAllPermissions = async (limit = 50, offset = 0, resource_type = null) => {
  return await permissionRepo.getAllPermissions(limit, offset, resource_type);
};

const createPermission = async (permissionData) => {
  return await permissionRepo.createPermission(permissionData);
};

const getPermissionById = async (id) => {
  return await permissionRepo.getPermissionById(id);
};

const getPermissionByName = async (name) => {
  return await permissionRepo.getPermissionByName(name);
};

const updatePermission = async (id, updateData) => {
  return await permissionRepo.updatePermission(id, updateData);
};

const deletePermission = async (id) => {
  return await permissionRepo.deletePermission(id);
};

const getUserPermissions = async (userId) => {
  return await permissionRepo.getUserPermissions(userId);
};

const assignPermissionToUser = async (userId, permissionId) => {
  // Check if permission exists
  const permission = await permissionRepo.getPermissionById(permissionId);
  if (!permission) {
    throw new Error('Permission not found');
  }
  
  // Check if user exists (you might want to add user validation here)
  
  // Check if permission is already assigned
  const existingAssignment = await permissionRepo.getUserPermissionAssignment(userId, permissionId);
  if (existingAssignment) {
    throw new Error('Permission already assigned to user');
  }
  
  return await permissionRepo.assignPermissionToUser(userId, permissionId);
};

const removePermissionFromUser = async (userId, permissionId) => {
  return await permissionRepo.removePermissionFromUser(userId, permissionId);
};

const checkUserPermission = async (userId, resourceType, action) => {
  const userPermissions = await permissionRepo.getUserPermissions(userId);
  
  return userPermissions.some(permission => 
    permission.resource_type === resourceType && 
    permission.action === action && 
    permission.is_active
  );
};

const getPermissionStats = async () => {
  return await permissionRepo.getPermissionStats();
};

module.exports = {
  getAllPermissions,
  createPermission,
  getPermissionById,
  getPermissionByName,
  updatePermission,
  deletePermission,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  checkUserPermission,
  getPermissionStats
};
