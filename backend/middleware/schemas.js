const { z } = require('zod');

// Auth schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});


module.exports = {
  registerSchema,
  loginSchema,
  
};


