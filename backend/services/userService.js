const userRepo = require('../repos/userRepo');
const bcrypt = require('bcryptjs');

const createUser = async (userData) => {
  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  
  const userWithHashedPassword = {
    ...userData,
    password: hashedPassword
  };
  
  return await userRepo.createUser(userWithHashedPassword);
};

const getUserById = async (id) => {
  return await userRepo.getUserById(id);
};

const getUserByEmail = async (email) => {
  return await userRepo.getUserByEmail(email);
};

const getUserByUsername = async (username) => {
  return await userRepo.getUserByUsername(username);
};

const getAllUsers = async (limit = 50, offset = 0, role = null) => {
  return await userRepo.getAllUsers(limit, offset, role);
};

const updateUser = async (id, updateData) => {
  // If password is being updated, hash it
  if (updateData.password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(updateData.password, saltRounds);
  }
  
  return await userRepo.updateUser(id, updateData);
};

const deleteUser = async (id) => {
  return await userRepo.deleteUser(id);
};

const changePassword = async (id, currentPassword, newPassword) => {
  // Get current user
  const user = await userRepo.getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const saltRounds = 10;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  
  // Update password
  return await userRepo.updateUser(id, { password: hashedNewPassword });
};

const getUserStats = async () => {
  return await userRepo.getUserStats();
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  getUserStats
};
