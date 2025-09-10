// Repository layer for user persistence. Keeps raw SQL in one place.
// Exposes simple CRUD/find operations used by services.
const { pool } = require('../utils/database');

// Find a user by email, used during registration and login flows
const findUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

// Find a user by id, used by auth middleware and profile endpoints
const findUserById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

// Create a new user record with a pre-hashed password
const createUser = async ({ id, email, passwordHash, name }) => {
  await pool.execute(
    'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
    [id, email, passwordHash, name || null]
  );
  return findUserById(id);
};

// Update mutable user fields (kept minimal for now)
const updateUser = async (id, { name }) => {
  await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name || null, id]);
  return findUserById(id);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser
};


