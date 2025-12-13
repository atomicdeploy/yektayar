import { validateSessionToken } from './sessionService'

export interface UserPreferences {
  welcomeScreenShown?: boolean
  language?: string
  timezone?: string
  theme?: string
  notifications?: boolean
  [key: string]: any
}

// In-memory storage for preferences (will be replaced with database)
const preferencesStore = new Map<string, UserPreferences>()

/**
 * Get user preferences for a given session token
 * TODO: Implement with database
 * Database schema suggestion:
 * CREATE TABLE user_preferences (
 *   user_id VARCHAR(255) PRIMARY KEY,
 *   welcome_screen_shown BOOLEAN DEFAULT FALSE,
 *   language VARCHAR(10) DEFAULT 'fa',
 *   timezone VARCHAR(100) DEFAULT 'UTC',
 *   theme VARCHAR(20) DEFAULT 'auto',
 *   notifications BOOLEAN DEFAULT TRUE,
 *   preferences JSONB,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 */
export async function getUserPreferences(token: string): Promise<UserPreferences> {
  // Validate session first
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  // Use token as key for now (in production, use user_id)
  const key = session.userId || token
  
  // Return stored preferences or defaults (with session metadata as fallback)
  const preferences = preferencesStore.get(key) || {
    welcomeScreenShown: false,
    language: session.metadata?.language || 'fa',
    timezone: session.metadata?.timezone || 'UTC',
    theme: 'auto',
    notifications: true
  }

  return preferences
}

/**
 * Update user preferences for a given session token
 * TODO: Implement with database
 * SQL: UPDATE user_preferences SET ... WHERE user_id = ?
 */
export async function updateUserPreferences(
  token: string, 
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  // Validate session first
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  // Use token as key for now (in production, use user_id)
  const key = session.userId || token
  
  // Get existing preferences
  const currentPreferences = await getUserPreferences(token)
  
  // Merge updates
  const updatedPreferences = {
    ...currentPreferences,
    ...updates
  }
  
  // Store updated preferences
  preferencesStore.set(key, updatedPreferences)
  
  // TODO: In production, save to database:
  // await db.query(
  //   'INSERT INTO user_preferences (user_id, welcome_screen_shown, ...) 
  //    VALUES ($1, $2, ...) 
  //    ON CONFLICT (user_id) DO UPDATE SET ...',
  //   [key, updatedPreferences.welcomeScreenShown, ...]
  // )

  return updatedPreferences
}

/**
 * Delete user preferences
 * TODO: Implement with database
 */
export async function deleteUserPreferences(token: string): Promise<void> {
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  const key = session.userId || token
  preferencesStore.delete(key)
  
  // TODO: In production:
  // await db.query('DELETE FROM user_preferences WHERE user_id = $1', [key])
}
