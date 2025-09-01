const permissionService = require('../services/permissionService');

const getAllPermissions = async (req, res) => {
  try {
    const { limit = 50, offset = 0, resource_type } = req.query;
    
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Limit must be a number between 1 and 100'
      });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Offset must be a non-negative number'
      });
    }

    const permissions = await permissionService.getAllPermissions(limitNum, offsetNum, resource_type);
    
    res.status(200).json(permissions);

  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve permissions'
    });
  }
};

const createPermission = async (req, res) => {
  try {
    const { name, description, resource_type, action, conditions } = req.body;
    
    if (!name || !resource_type || !action) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, resource_type, and action are required'
      });
    }

    // Validate action
    const validActions = ['create', 'read', 'update', 'delete', 'execute'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Action must be one of: create, read, update, delete, execute'
      });
    }

    // Check if permission already exists
    const existingPermission = await permissionService.getPermissionByName(name);
    if (existingPermission) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Permission with this name already exists'
      });
    }

    const permissionData = {
      name,
      description: description || '',
      resource_type,
      action,
      conditions: conditions || null
    };

    const newPermission = await permissionService.createPermission(permissionData);
    
    res.status(201).json({
      message: 'Permission created successfully',
      permission: newPermission
    });

  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create permission'
    });
  }
};

const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Permission ID is required'
      });
    }

    const permission = await permissionService.getPermissionById(id);
    
    if (!permission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Permission not found'
      });
    }

    res.status(200).json(permission);

  } catch (error) {
    console.error('Get permission by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve permission'
    });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, resource_type, action, conditions, is_active } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Permission ID is required'
      });
    }

    if (!name && !description && !resource_type && !action && conditions === undefined && is_active === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one field to update is required'
      });
    }

    // Check if permission exists
    const existingPermission = await permissionService.getPermissionById(id);
    if (!existingPermission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Permission not found'
      });
    }

    // Check if name is being updated and if it's already taken
    if (name && name !== existingPermission.name) {
      const permissionWithName = await permissionService.getPermissionByName(name);
      if (permissionWithName && permissionWithName.id !== id) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Permission name already taken by another permission'
        });
      }
    }

    // Validate action if being updated
    if (action) {
      const validActions = ['create', 'read', 'update', 'delete', 'execute'];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Action must be one of: create, read, update, delete, execute'
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (resource_type !== undefined) updateData.resource_type = resource_type;
    if (action !== undefined) updateData.action = action;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updated = await permissionService.updatePermission(id, updateData);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Permission not found'
      });
    }

    res.status(200).json({
      message: 'Permission updated successfully',
      id: id,
      updated: updateData
    });

  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update permission'
    });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Permission ID is required'
      });
    }

    // Check if permission exists
    const existingPermission = await permissionService.getPermissionById(id);
    if (!existingPermission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Permission not found'
      });
    }

    const deleted = await permissionService.deletePermission(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Permission not found'
      });
    }

    res.status(200).json({
      message: 'Permission deleted successfully',
      id: id
    });

  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete permission'
    });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    const permissions = await permissionService.getUserPermissions(userId);
    
    res.status(200).json(permissions);

  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user permissions'
    });
  }
};

const assignPermissionToUser = async (req, res) => {
  try {
    const { userId, permissionId } = req.body;
    
    if (!userId || !permissionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID and Permission ID are required'
      });
    }

    const result = await permissionService.assignPermissionToUser(userId, permissionId);
    
    res.status(200).json({
      message: 'Permission assigned successfully',
      user_id: userId,
      permission_id: permissionId
    });

  } catch (error) {
    console.error('Assign permission to user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to assign permission to user'
    });
  }
};

const removePermissionFromUser = async (req, res) => {
  try {
    const { userId, permissionId } = req.params;
    
    if (!userId || !permissionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID and Permission ID are required'
      });
    }

    const result = await permissionService.removePermissionFromUser(userId, permissionId);
    
    res.status(200).json({
      message: 'Permission removed successfully',
      user_id: userId,
      permission_id: permissionId
    });

  } catch (error) {
    console.error('Remove permission from user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove permission from user'
    });
  }
};

module.exports = {
  getAllPermissions,
  createPermission,
  getPermissionById,
  updatePermission,
  deletePermission,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser
};
