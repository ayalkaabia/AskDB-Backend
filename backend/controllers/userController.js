const userService = require('../services/userService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'user' } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    const existingUsername = await userService.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Username already taken'
      });
    }

    // Create user
    const userData = {
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      role
    };

    const newUser = await userService.createUser(userData);
    
    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login'
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, role } = req.query;
    
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

    const users = await userService.getAllUsers(limitNum, offsetNum, role);
    
    // Remove passwords from response
    const usersResponse = users.map(user => {
      const { password, ...userResponse } = user;
      return userResponse;
    });
    
    res.status(200).json(usersResponse);

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve users'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.status(200).json(userResponse);

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, isActive } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    if (!username && !email && !firstName && !lastName && role === undefined && isActive === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one field to update is required'
      });
    }

    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== existingUser.email) {
      const userWithEmail = await userService.getUserByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already taken by another user'
        });
      }
    }

    // Check if username is being updated and if it's already taken
    if (username && username !== existingUser.username) {
      const userWithUsername = await userService.getUserByUsername(username);
      if (userWithUsername && userWithUsername.id !== id) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Username already taken by another user'
        });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await userService.updateUser(id, updateData);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      id: id,
      updated: updateData
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const deleted = await userService.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      id: id
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
