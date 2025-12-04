import { validateSessionToken } from './sessionService'
import { getDatabase } from './database'

export interface UserPreferences {
  welcomeScreenShown?: boolean
  language?: string
  theme?: string
  notifications?: boolean
  [key: string]: any
}

/**
 * Get user preferences for a given session token
 */
export async function getUserPreferences(token: string): Promise<UserPreferences> {
  const db = getDatabase()
  
  // Validate session first
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  // Use user_id if logged in, otherwise use token as key
  const key = session.userId || token
  
  try {
    // Try to fetch from database
    const result = await db`
      SELECT welcome_screen_shown, language, theme, notifications
      FROM user_preferences
      WHERE user_id = ${key}
    `
    
    if (result.length > 0) {
      return {
        welcomeScreenShown: result[0].welcome_screen_shown,
        language: result[0].language,
        theme: result[0].theme,
        notifications: result[0].notifications,
      }
    }
    
    // Return defaults if not found
    return {
      welcomeScreenShown: false,
      language: 'fa',
      theme: 'auto',
      notifications: true
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    // Return defaults on error
    return {
      welcomeScreenShown: false,
      language: 'fa',
      theme: 'auto',
      notifications: true
    }
  }
}

/**
 * Update user preferences for a given session token
 */
export async function updateUserPreferences(
  token: string, 
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  const db = getDatabase()
  
  // Validate session first
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  // Use user_id if logged in, otherwise use token as key
  const key = session.userId || token
  
  try {
    // Get existing preferences
    const currentPreferences = await getUserPreferences(token)
    
    // Merge updates
    const updatedPreferences = {
      ...currentPreferences,
      ...updates
    }
    
    // Upsert to database
    const welcomeScreenShown = updatedPreferences.welcomeScreenShown ?? false
    const language = updatedPreferences.language ?? 'fa'
    const theme = updatedPreferences.theme ?? 'auto'
    const notifications = updatedPreferences.notifications ?? true
    
    await db`
      INSERT INTO user_preferences (
        user_id, 
        welcome_screen_shown, 
        language, 
        theme, 
        notifications,
        updated_at
      )
      VALUES (
        ${key}, 
        ${welcomeScreenShown}, 
        ${language}, 
        ${theme}, 
        ${notifications},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        welcome_screen_shown = EXCLUDED.welcome_screen_shown,
        language = EXCLUDED.language,
        theme = EXCLUDED.theme,
        notifications = EXCLUDED.notifications,
        updated_at = CURRENT_TIMESTAMP
    `
    
    return updatedPreferences
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw new Error('Failed to update user preferences')
  }
}

/**
 * Delete user preferences
 */
export async function deleteUserPreferences(token: string): Promise<void> {
  const db = getDatabase()
  
  const session = await validateSessionToken(token)
  
  if (!session) {
    throw new Error('Invalid session')
  }

  const key = session.userId || token
  
  try {
    await db`DELETE FROM user_preferences WHERE user_id = ${key}`
  } catch (error) {
    console.error('Error deleting user preferences:', error)
    throw new Error('Failed to delete user preferences')
  }
}
