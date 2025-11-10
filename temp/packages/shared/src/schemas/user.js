const { z } = require('zod');

const registerSchema = z.object({
  identifier: z.string().min(3),
  type: z.enum(['phone', 'email']),
  password: z.string().min(6).optional()
});

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().optional(),
  code: z.string().optional()
});

module.exports = { registerSchema, loginSchema };