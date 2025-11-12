// API Configuration Validation Utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that the API base URL is configured
 */
export function validateApiBaseUrlConfig(apiBaseUrl: string): ValidationResult {
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    return {
      isValid: false,
      error: 'API_BASE_URL environment variable is not set. Please configure the API base URL.'
    };
  }

  // Validate URL format
  try {
    const url = new URL(apiBaseUrl);
    if (!url.protocol.startsWith('http')) {
      return {
        isValid: false,
        error: 'API_BASE_URL must be a valid HTTP or HTTPS URL.'
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'API_BASE_URL is not a valid URL format.'
    };
  }

  return { isValid: true };
}

/**
 * Tests if the API is reachable by attempting a health check
 */
export async function validateApiReachability(apiBaseUrl: string): Promise<ValidationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${apiBaseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isValid: false,
        error: `API is not reachable. Server responded with status ${response.status}.`
      };
    }

    return { isValid: true };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        isValid: false,
        error: 'API health check timed out. The server may be down or unreachable.'
      };
    }

    return {
      isValid: false,
      error: `Failed to connect to API: ${error.message || 'Network error'}`
    };
  }
}

/**
 * Performs complete API validation (config + reachability)
 */
export async function validateApi(apiBaseUrl: string): Promise<ValidationResult> {
  // First validate configuration
  const configValidation = validateApiBaseUrlConfig(apiBaseUrl);
  if (!configValidation.isValid) {
    return configValidation;
  }

  // Then validate reachability
  return await validateApiReachability(apiBaseUrl);
}
