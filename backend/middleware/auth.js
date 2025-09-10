// Auth middleware validates a Bearer JWT, loads user, and attaches it to req.
// Responds 401 on missing/invalid token.
const jwt = require('jsonwebtoken');
const { findUserById } = require('../repos/userRepo');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = auth;


