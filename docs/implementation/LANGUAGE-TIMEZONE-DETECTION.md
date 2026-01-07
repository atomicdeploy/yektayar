# Language and Timezone Detection Implementation

This document describes the implementation of automatic client language and timezone detection across the YektaYar platform.

## Overview

The YektaYar platform now automatically detects and stores client language preferences and timezone information. This enables:

- Automatic language selection based on browser/system settings
- Accurate timezone handling for appointments and scheduling
- Personalized date/time formatting
- Better user experience with minimal configuration

## Features

### 1. Client-Side Detection

The `@yektayar/shared` package provides utilities for detecting client locale information:

#### Language Detection
```typescript
import { detectLanguage } from '@yektayar/shared'

// Detects browser language (returns 'fa' or 'en')
const language = detectLanguage()
```

**Detection Priority:**
1. `navigator.language` (primary browser language)
2. `navigator.languages[0]` (first preferred language)
3. Falls back to Persian ('fa') as default

**Supported Languages:**
- Persian (fa) - Default
- English (en)

#### Timezone Detection
```typescript
import { detectTimezone, getTimezoneInfo } from '@yektayar/shared'

// Get IANA timezone identifier
const timezone = detectTimezone() // e.g., 'Asia/Tehran'

// Get detailed timezone information
const info = getTimezoneInfo()
// {
//   timezone: 'Asia/Tehran',
//   offset: 210,
//   offsetString: '+03:30'
// }
```

#### Complete Locale Information
```typescript
import { detectLocaleInfo } from '@yektayar/shared'

const locale = detectLocaleInfo()
// {
//   language: 'fa',
//   timezone: 'Asia/Tehran',
//   languages: ['fa', 'en']
// }
```

### 2. Server-Side Integration

The backend automatically captures and stores locale information during session creation.

#### Session Metadata
When a client acquires a session, the server:
1. Parses the `Accept-Language` HTTP header
2. Reads the `X-Timezone` custom header
3. Stores language and timezone in session metadata

**Request Headers:**
```http
POST /api/auth/acquire-session
Accept-Language: fa-IR,fa;q=0.9,en;q=0.8
X-Timezone: Asia/Tehran
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "session_token_here",
    "expiresAt": "2024-02-15T12:00:00Z",
    "language": "fa",
    "timezone": "Asia/Tehran"
  }
}
```

#### Accept-Language Parsing
The server-side utility parses and prioritizes languages:

```typescript
import { getBestLanguageMatch } from '@yektayar/shared'

const language = getBestLanguageMatch('en-US,en;q=0.9,fa;q=0.8')
// Returns: 'en' (best matching supported language)
```

### 3. Frontend Integration

Both mobile app and admin panel automatically detect and send locale information.

#### Mobile App (Ionic)

**Session Store:** `packages/mobile-app/src/stores/session.ts`

```typescript
// Automatically detects and sends timezone during session acquisition
const clientLanguage = detectLanguage()
const clientTimezone = detectTimezone()

const response = await apiClient.post('/auth/acquire-session', {}, {
  skipAuth: true,
  headers: {
    'X-Timezone': clientTimezone
  }
})
```

#### Admin Panel (Vue.js)

**Session Store:** `packages/admin-panel/src/stores/session.ts`

Similar implementation to mobile app - automatically detects and sends locale information.

### 4. User Preferences Service

The preferences service integrates with session metadata:

```typescript
import { getUserPreferences } from '@/services/preferencesService'

const prefs = await getUserPreferences(sessionToken)
// {
//   welcomeScreenShown: false,
//   language: 'fa',  // From session metadata
//   timezone: 'Asia/Tehran',  // From session metadata
//   theme: 'auto',
//   notifications: true
// }
```

## API Reference

### Shared Package Utilities

#### `detectLanguage(): SupportedLanguage`
Detects the user's preferred language from browser settings.

**Returns:** `'fa' | 'en'`

#### `detectTimezone(): string`
Detects the user's timezone using the Intl API.

**Returns:** IANA timezone identifier (e.g., `'Asia/Tehran'`, `'America/New_York'`)

#### `getBrowserLanguages(): readonly string[]`
Gets all browser languages in order of preference.

**Returns:** Array of language codes

#### `getTimezoneInfo(timezone?: string): TimezoneInfo`
Gets detailed timezone information including offset.

**Parameters:**
- `timezone` (optional): Timezone to get info for (defaults to detected timezone)

**Returns:**
```typescript
{
  timezone: string      // IANA identifier
  offset: number       // Offset in minutes
  offsetString: string // Formatted offset (e.g., '+03:30')
}
```

#### `detectLocaleInfo(): LocaleInfo`
Gets complete locale information.

**Returns:**
```typescript
{
  language: string           // Detected language
  timezone: string          // Detected timezone
  languages: readonly string[] // Browser languages
}
```

#### `isSupportedLanguage(language: string): boolean`
Checks if a language is supported.

**Parameters:**
- `language`: Language code to check

**Returns:** `true` if supported

#### `parseAcceptLanguage(acceptLanguage: string): Array<{language: string, quality: number}>`
Parses Accept-Language header (server-side utility).

**Parameters:**
- `acceptLanguage`: Accept-Language header value

**Returns:** Array of languages with quality scores, sorted by priority

#### `getBestLanguageMatch(acceptLanguage: string): SupportedLanguage`
Gets the best matching supported language from Accept-Language header.

**Parameters:**
- `acceptLanguage`: Accept-Language header value

**Returns:** Best matching supported language or default ('fa')

#### `formatDateByLocale(date: Date, language?: SupportedLanguage, options?: Intl.DateTimeFormatOptions): string`
Formats a date according to locale.

**Parameters:**
- `date`: Date to format
- `language` (optional): Language code (defaults to 'fa')
- `options` (optional): Intl.DateTimeFormat options

**Returns:** Formatted date string

### Backend API Endpoints

#### `POST /api/auth/acquire-session`
Acquires a new session with automatic locale detection.

**Request Headers:**
```http
Accept-Language: fa-IR,fa;q=0.9,en;q=0.8
X-Timezone: Asia/Tehran
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "expiresAt": "ISO-8601 date",
    "language": "fa",
    "timezone": "Asia/Tehran"
  }
}
```

#### `GET /api/auth/session`
Validates and returns session information including locale.

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "userId": "string | null",
    "isLoggedIn": boolean,
    "expiresAt": "ISO-8601 date",
    "language": "fa",
    "timezone": "Asia/Tehran"
  }
}
```

## Database Schema

Session metadata stores language and timezone information:

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER,
  is_logged_in BOOLEAN DEFAULT FALSE,
  metadata JSONB,  -- Stores { language, timezone, userAgent, ip, deviceInfo }
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT NOW()
);
```

For persistent user preferences (to be implemented with database):

```sql
CREATE TABLE user_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  welcome_screen_shown BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'fa',
  timezone VARCHAR(100) DEFAULT 'UTC',
  theme VARCHAR(20) DEFAULT 'auto',
  notifications BOOLEAN DEFAULT TRUE,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Example 1: Format Date by User's Locale

```typescript
import { formatDateByLocale } from '@yektayar/shared'
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()
const userLanguage = sessionStore.session?.language || 'fa'

const date = new Date()
const formatted = formatDateByLocale(date, userLanguage, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
// Persian: '۱۵ بهمن ۱۴۰۲'
// English: 'February 15, 2024'
```

### Example 2: Display Timezone-Aware Appointment Times

```typescript
import { getTimezoneInfo } from '@yektayar/shared'
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()
const userTimezone = sessionStore.session?.timezone || 'UTC'

const info = getTimezoneInfo(userTimezone)
logger.info(`User timezone: ${info.timezone} (${info.offsetString})`)

// Display appointment in user's timezone
const appointmentDate = new Date(appointmentData.scheduledAt)
const localTime = formatDateByLocale(appointmentDate, userLanguage, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: userTimezone
})
```

### Example 3: Automatic Language Selection

```typescript
import { detectLanguage } from '@yektayar/shared'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// On app initialization
const detectedLanguage = detectLanguage()
locale.value = detectedLanguage
logger.info(`Auto-selected language: ${detectedLanguage}`)
```

## Testing

The implementation includes comprehensive unit tests:

```bash
# Run locale detection tests
npm test -- locale.test.ts
```

**Test Coverage:**
- Language detection from browser settings
- Fallback to default language
- Timezone detection using Intl API
- Timezone offset calculation for specific timezones
- Accept-Language header parsing
- Language quality score prioritization
- Date formatting by locale
- Language and timezone validation
- Safe normalization functions
- Edge cases and error handling

**Test Results:**
- ✅ 30 tests passing
- ✅ All detection scenarios covered
- ✅ Validation functions tested
- ✅ Error handling validated

## Browser Compatibility

The implementation uses standard Web APIs:
- `navigator.language` / `navigator.languages`
- `Intl.DateTimeFormat`

**Supported Browsers:**
- Chrome 24+
- Firefox 29+
- Safari 10+
- Edge 12+
- Opera 15+
- iOS Safari 10+
- Android Browser 4.4+

## Migration Notes

### Existing Sessions
Existing sessions created before this update will not have language/timezone information. They will:
1. Use default values ('fa' for language, 'UTC' for timezone)
2. Auto-detect on next session renewal
3. Update metadata when user preferences are saved

### Client Updates
When clients update to the new version:
1. First session acquisition will detect and send locale information
2. Subsequent requests will use stored session locale data
3. No user action required

## Future Enhancements

Potential improvements for future versions:

1. **Additional Language Support**
   - Add Arabic (ar)
   - Add Turkish (tr)
   - Add other regional languages

2. **Timezone Conversions**
   - Automatic timezone conversion for multi-timezone teams
   - Display both local and UTC times
   - Smart scheduling across timezones

3. **User Preferences UI**
   - Allow manual language override
   - Timezone selection for travelers
   - Preference synchronization across devices

4. **Analytics**
   - Track language distribution
   - Monitor timezone patterns
   - Optimize content delivery

## Troubleshooting

### Language Not Detected
**Symptom:** Always defaults to Persian

**Solutions:**
1. Check browser language settings
2. Verify `navigator.language` returns valid locale
3. Ensure Accept-Language header is sent

### Timezone Issues
**Symptom:** Incorrect timezone detected

**Solutions:**
1. Verify system timezone settings
2. Check if Intl API is supported
3. Manually send X-Timezone header

### Session Not Storing Locale
**Symptom:** Locale information not in session

**Solutions:**
1. Verify X-Timezone header is sent
2. Check Accept-Language header format
3. Ensure backend routes are updated

## Related Documentation

- [i18n Implementation Guide](./I18N-VALIDATION.md)
- [Session Management](../api/SESSION-GUIDE.md)
- [API Client Documentation](../../packages/shared/API_CLIENT.md)
- [User Preferences Service](../guides/USER-PREFERENCES.md)

## Contributing

When contributing to locale detection:

1. Always add tests for new detection methods
2. Ensure fallback values are provided
3. Document browser compatibility
4. Update this guide with new features

## License

This implementation is part of the YektaYar platform and follows the project license.
