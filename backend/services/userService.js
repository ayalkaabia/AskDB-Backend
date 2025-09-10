// Service layer for user business logic: registration, login, and profile.
// Handles hashing, token creation, and response shaping without leaking SQL.
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repos/userRepo');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register a new user if email is free, then return a sanitized user
const registerUser = async ({ email, password, name }) => {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const user = await userRepo.createUser({ id, email, passwordHash, name });
  return sanitizeUser(user);
};

// Verify credentials and issue a signed JWT for session auth
const loginUser = async ({ email, password }) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: sanitizeUser(user) };
};

// Return the current user's profile
const getProfile = async (userId) => {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return sanitizeUser(user);
};

// Update mutable profile fields
const updateProfile = async (userId, { name }) => {
  const updated = await userRepo.updateUser(userId, { name });
  return sanitizeUser(updated);
};

// Remove sensitive columns from outgoing user objects
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  // Convenience function to register then immediately issue a JWT
  registerAndLogin: async ({ email, password, name }) => {
    const user = await registerUser({ email, password, name });
    const login = await loginUser({ email, password });
    return { user, token: login.token };
  }
};


