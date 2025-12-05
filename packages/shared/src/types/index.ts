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
  isPublished: boolean
  instructorId?: string
  tags?: string[]
  rating?: number
  enrollmentCount?: number
  createdAt: Date
  updatedAt: Date
}

export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface CourseLesson {
  id: string
  moduleId: string
  title: string
  description?: string
  content: string
  contentType: LessonContentType
  mediaUrl?: string
  duration?: number
  order: number
  isFree: boolean
  createdAt: Date
  updatedAt: Date
}

export enum LessonContentType {
  VIDEO = 'video',
  TEXT = 'text',
  IMAGE = 'image',
  QUIZ = 'quiz',
  DOCUMENT = 'document'
}

export interface CourseEnrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  completed: boolean
  enrolledAt: Date
  completedAt?: Date
}

export interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  completed: boolean
  timeSpent: number
  lastPosition?: number
  completedAt?: Date
}

export interface CourseReview {
  id: string
  courseId: string
  userId: string
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
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

// Update types
export interface UpdateInfo {
  id: string
  version: string
  platform: UpdatePlatform
  buildNumber?: number
  releaseDate: Date
  mandatory: boolean
  changelog: string
  downloadUrl: string
  fileSize: number
  checksum?: string
  minAppVersion?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum UpdatePlatform {
  ANDROID = 'android',
  IOS = 'ios',
  PWA = 'pwa',
  WEB = 'web'
}

export enum UpdateStatus {
  IDLE = 'idle',
  CHECKING = 'checking',
  AVAILABLE = 'available',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  DOWNLOADED = 'downloaded',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  FAILED = 'failed',
  UP_TO_DATE = 'up_to_date'
}

export interface UpdateDownloadProgress {
  bytesDownloaded: number
  totalBytes: number
  percentage: number
  speed: number // bytes per second
  estimatedTimeRemaining: number // seconds
  status: UpdateStatus
  error?: string
}

export interface UpdateInstallReport {
  updateId: string
  version: string
  platform: UpdatePlatform
  installedAt: Date
  previousVersion?: string
  userId?: string
  deviceInfo?: Record<string, any>
}
