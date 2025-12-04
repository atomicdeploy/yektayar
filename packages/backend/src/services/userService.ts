/**
 * User Service - Business logic for user operations
 * Adapted from PR #84 with improvements from current implementation
 */

import { getDatabase } from './database'

export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  type: 'admin' | 'psychologist' | 'patient'
  avatar: string | null
  bio: string | null
  specialization: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserFilters {
  type?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Get all users with optional filters and pagination
 */
export async function getAllUsers(filters?: UserFilters): Promise<{
  users: User[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}> {
  const db = getDatabase()
  
  try {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const offset = (page - 1) * limit
    
    // Build WHERE clause dynamically
    const whereClauses: string[] = []
    const params: any[] = []
    
    if (filters?.type) {
      whereClauses.push(`type = $${params.length + 1}`)
      params.push(filters.type)
    }
    
    if (filters?.search) {
      whereClauses.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`)
      params.push(`%${filters.search}%`)
    }
    
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    
    // Get total count
    const countResult = await db.unsafe(`
      SELECT COUNT(*) as count
      FROM users
      ${whereClause}
    `, params)
    
    const total = parseInt(countResult[0].count)

    /*
      if (filters?type) {
        countResult = await query<{ count: string }>('SELECT COUNT(*) FROM users WHERE type = $1', [type])
        users = await query(`
          SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
          FROM users
          WHERE type = $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [type, limit, offset])
      } else {
        countResult = await query<{ count: string }>('SELECT COUNT(*) FROM users')
        users = await query(`
          SELECT id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
          FROM users
          ORDER BY created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset])
      }
    */
    
    // Get users with pagination
    const users = await db.unsafe(`
      SELECT 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset])
    
    return {
      users: users.map(mapDatabaseUserToUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string | number): Promise<User | null> {
  const db = getDatabase()
  
  try {
    /*
    const users = await query(`
      SELECT id, email, phone, name, type, avatar, bio, specialization,
      is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id])
    */
    
    const users = await db`
      SELECT 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    
    if (users.length === 0) return null
    
    return mapDatabaseUserToUser(users[0])
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase()
  
  try {
    const users = await db`
      SELECT 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    
    if (users.length === 0) return null
    
    return mapDatabaseUserToUser(users[0])
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

/**
 * Get a user by phone
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  const db = getDatabase()
  
  try {
    const users = await db`
      SELECT 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE phone = ${phone}
      LIMIT 1
    `
    
    if (users.length === 0) return null
    
    return mapDatabaseUserToUser(users[0])
  } catch (error) {
    console.error('Error fetching user by phone:', error)
    throw error
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  name: string
  email?: string
  phone?: string
  type?: 'admin' | 'psychologist' | 'patient'
  avatar?: string
  bio?: string
  specialization?: string
  passwordHash?: string
}): Promise<User> {
  const db = getDatabase()
  
  try {
    const users = await db`
      INSERT INTO users (
        name, email, phone, type, avatar, bio, specialization, password_hash, is_active
      )
      VALUES (
        ${userData.name},
        ${userData.email || null},
        ${userData.phone || null},
        ${userData.type || 'patient'},
        ${userData.avatar || null},
        ${userData.bio || null},
        ${userData.specialization || null},
        ${userData.passwordHash || null},
        true
      )
      RETURNING 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `
    
    return mapDatabaseUserToUser(users[0])
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update a user
 */
export async function updateUser(
  id: string | number,
  updates: Partial<{
    name: string
    email: string
    phone: string
    avatar: string
    bio: string
    specialization: string
    isActive: boolean
  }>
): Promise<User | null> {
  const db = getDatabase()
  
  try {
    // If no updates, return existing user
    if (Object.keys(updates).length === 0) {
      return getUserById(id)
    }
    
    // Build the SET clause dynamically
    const setClauses: string[] = []
    const params: any[] = []
    
    if (updates.name !== undefined) {
      setClauses.push(`name = $${params.length + 1}`)
      params.push(updates.name)
    }
    if (updates.email !== undefined) {
      setClauses.push(`email = $${params.length + 1}`)
      params.push(updates.email)
    }
    if (updates.phone !== undefined) {
      setClauses.push(`phone = $${params.length + 1}`)
      params.push(updates.phone)
    }
    if (updates.avatar !== undefined) {
      setClauses.push(`avatar = $${params.length + 1}`)
      params.push(updates.avatar)
    }
    if (updates.bio !== undefined) {
      setClauses.push(`bio = $${params.length + 1}`)
      params.push(updates.bio)
    }
    if (updates.specialization !== undefined) {
      setClauses.push(`specialization = $${params.length + 1}`)
      params.push(updates.specialization)
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${params.length + 1}`)
      params.push(updates.isActive)
    }
    
    // Always update updated_at
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`)

    params.push(id)

    /*
      const result = await query(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, email, phone, name, type, avatar, bio, specialization, is_active, created_at, updated_at
      `, values)
    */
    
    const users = await db.unsafe(`
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${params.length}
      RETURNING 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `, params)
    
    if (users.length === 0) return null
    
    return mapDatabaseUserToUser(users[0])
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string | number): Promise<boolean> {
  const db = getDatabase()
  
  try {
    const result = await db`
      DELETE FROM users
      WHERE id = ${id}
    `
    
    return result.count > 0
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Get user profile with statistics
 */
export async function getUserProfile(id: string | number): Promise<(User & { stats?: any }) | null> {
  const db = getDatabase()
  
  try {
    /*
    const users = await query(`
      SELECT id, email, phone, name, type, avatar, bio, specialization,
      is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id])
    */
    
    const users = await db`
      SELECT 
        id, email, phone, name, type, avatar, bio, specialization, 
        is_active as "isActive", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE id = ${id}
    `
    
    if (users.length === 0) return null
    
    const user = mapDatabaseUserToUser(users[0])
    
    // Add type-specific statistics

    // If psychologist, get their appointments count
    if (user.type === 'psychologist') {

      /*
      const stats = await query(`
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments
        FROM appointments
        WHERE psychologist_id = $1
      `, [id])
      */
      
      const stats = await db`
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments
        FROM appointments
        WHERE psychologist_id = ${id}
      `
      return { ...user, stats: stats[0] }
    }

    // If patient, get their course enrollments
    if (user.type === 'patient') {

      /*
      const enrollmentStats = await query(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_courses
        FROM course_enrollments
        WHERE user_id = $1
      `, [id])
      */
      
      const stats = await db`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_courses
        FROM course_enrollments
        WHERE user_id = ${id}
      `
      return { ...user, stats: stats[0] }
    }
    
    return user
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Map database user to User interface
 */
function mapDatabaseUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    type: dbUser.type as 'admin' | 'psychologist' | 'patient',
    avatar: dbUser.avatar,
    bio: dbUser.bio,
    specialization: dbUser.specialization,
    isActive: dbUser.isActive,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt)
  }
}
