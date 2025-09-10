// Thin HTTP controller mapping requests to user service operations.
// Returns appropriate HTTP codes and simple JSON payloads.
const userService = require('../services/userService');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.validated || req.body;
    const { user, token } = await userService.registerAndLogin({ email, password, name });
    return res.status(201).json({ user, token });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.validated || req.body;
    const result = await userService.loginUser({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Login failed' });
  }
};

const me = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return res.status(200).json({ user: profile });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Profile fetch failed' });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await userService.updateProfile(req.user.id, { name });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Profile update failed' });
  }
};

module.exports = {
  register,
  login,
  me,
  updateMe
};


