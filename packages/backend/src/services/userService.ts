import { sql } from '../db/connection'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'psychologist' | 'user' | 'moderator'
  status: 'active' | 'inactive' | 'blocked'
  createdAt: Date
  updatedAt: Date
}

export interface UserFilters {
  role?: string
  status?: string
  search?: string
}

/**
 * Get all users with optional filters
 */
export async function getAllUsers(filters?: UserFilters): Promise<User[]> {
  try {
    let users
    
    // Build query based on filters
    if (!filters || (!filters.role && !filters.status && !filters.search)) {
      // No filters, get all users
      users = await sql`
        SELECT 
          id::text,
          name,
          email,
          phone,
          role,
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users
        ORDER BY created_at DESC
      `
    } else {
      // Build query with filters
      const whereClauses: string[] = []
      const params: any[] = []
      
      if (filters.role) {
        whereClauses.push(`role = $${params.length + 1}`)
        params.push(filters.role)
      }
      
      if (filters.status) {
        whereClauses.push(`status = $${params.length + 1}`)
        params.push(filters.status)
      }
      
      if (filters.search) {
        whereClauses.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`)
        params.push(`%${filters.search}%`)
      }
      
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
      
      users = await sql.unsafe(`
        SELECT 
          id::text,
          name,
          email,
          phone,
          role,
          status,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
      `, params)
    }
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'admin' | 'psychologist' | 'user' | 'moderator',
      status: user.status as 'active' | 'inactive' | 'blocked',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT 
        id::text,
        name,
        email,
        phone,
        role,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE id = ${id}::uuid
      LIMIT 1
    `
    
    if (users.length === 0) return null
    
    const user = users[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'admin' | 'psychologist' | 'user' | 'moderator',
      status: user.status as 'active' | 'inactive' | 'blocked',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await sql`
      SELECT 
        id::text,
        name,
        email,
        phone,
        role,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `
    
    if (users.length === 0) return null
    
    const user = users[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'admin' | 'psychologist' | 'user' | 'moderator',
      status: user.status as 'active' | 'inactive' | 'blocked',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const users = await sql`
      INSERT INTO users (name, email, phone, role, status)
      VALUES (
        ${userData.name},
        ${userData.email},
        ${userData.phone},
        ${userData.role},
        ${userData.status}
      )
      RETURNING 
        id::text,
        name,
        email,
        phone,
        role,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    const user = users[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'admin' | 'psychologist' | 'user' | 'moderator',
      status: user.status as 'active' | 'inactive' | 'blocked',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update a user
 */
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
  try {
    // If no updates, return existing user
    if (Object.keys(userData).length === 0) {
      return getUserById(id)
    }
    
    // Build the SET clause dynamically
    const updates: any = {}
    if (userData.name !== undefined) updates.name = userData.name
    if (userData.email !== undefined) updates.email = userData.email
    if (userData.phone !== undefined) updates.phone = userData.phone
    if (userData.role !== undefined) updates.role = userData.role
    if (userData.status !== undefined) updates.status = userData.status
    
    const users = await sql`
      UPDATE users
      SET ${sql(updates)}
      WHERE id = ${id}::uuid
      RETURNING 
        id::text,
        name,
        email,
        phone,
        role,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    if (users.length === 0) return null
    
    const user = users[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'admin' | 'psychologist' | 'user' | 'moderator',
      status: user.status as 'active' | 'inactive' | 'blocked',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}::uuid
    `
    
    return result.count > 0
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
