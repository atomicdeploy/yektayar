import { z } from 'zod'

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().min(2).max(100),
  type: z.enum(['patient', 'psychologist', 'admin']),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6).optional()
})

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  type: z.enum(['patient', 'psychologist']).default('patient')
})

// Message schemas
export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  threadId: z.string().uuid().optional()
})

export const threadSchema = z.object({
  participants: z.array(z.string().uuid()).min(2),
  category: z.string().optional(),
  initialMessage: z.string().min(1)
})

// Appointment schemas
export const appointmentSchema = z.object({
  psychologistId: z.string().uuid(),
  scheduledAt: z.date(),
  duration: z.number().min(30).max(180),
  notes: z.string().max(1000).optional()
})

// Course schemas
export const courseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.string(),
  duration: z.number().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  thumbnailUrl: z.string().url().optional()
})
