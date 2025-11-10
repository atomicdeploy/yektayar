// User types
export interface User {
  id: string
  email?: string
  phone?: string
  name: string
  type: UserType
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export enum UserType {
  PATIENT = 'patient',
  PSYCHOLOGIST = 'psychologist',
  ADMIN = 'admin'
}

// Session types
export interface Session {
  token: string
  userId?: string
  isLoggedIn: boolean
  expiresAt: Date
  metadata?: Record<string, any>
}

// Message types
export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  createdAt: Date
  isRead: boolean
}

export interface MessageThread {
  id: string
  participants: string[]
  category?: string
  status: ThreadStatus
  lastMessage?: Message
  createdAt: Date
  updatedAt: Date
}

export enum ThreadStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

// Appointment types
export interface Appointment {
  id: string
  patientId: string
  psychologistId: string
  scheduledAt: Date
  duration: number
  status: AppointmentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Course types
export interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: number
  difficulty: CourseDifficulty
  thumbnailUrl?: string
  createdAt: Date
  updatedAt: Date
}

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Assessment types
export interface Assessment {
  id: string
  title: string
  questions: AssessmentQuestion[]
  createdAt: Date
  updatedAt: Date
}

export interface AssessmentQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer?: number
}

export interface AssessmentResult {
  id: string
  assessmentId: string
  userId: string
  answers: Record<string, number>
  score?: number
  personalityType?: string
  completedAt: Date
}
