// API Configuration Validation Utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: 'config' | 'cors' | 'ssl' | 'network' | 'timeout' | 'dns' | 'server' | 'unknown';
}

/**
 * Validates that the API base URL is configured
 */
export function validateApiBaseUrlConfig(apiBaseUrl: string): ValidationResult {
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    return {
      isValid: false,
      error: 'API_BASE_URL environment variable is not set. Please configure the API base URL.',
      errorType: 'config'
    };
  }

  // Validate URL format
  try {
    const url = new URL(apiBaseUrl);
    if (!url.protocol.startsWith('http')) {
      return {
        isValid: false,
        error: 'API_BASE_URL must be a valid HTTP or HTTPS URL.',
        errorType: 'config'
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'API_BASE_URL is not a valid URL format.',
      errorType: 'config'
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
        error: `API is not reachable. Server responded with status ${response.status}.`,
        errorType: 'server'
      };
    }

    return { isValid: true };
  } catch (error: any) {
    // Timeout error
    if (error.name === 'AbortError') {
      return {
        isValid: false,
        error: 'API health check timed out. The server may be down or unreachable.',
        errorType: 'timeout'
      };
    }

    // Detect specific error types based on error message
    const errorMessage = error.message?.toLowerCase() || '';
    
    // CORS errors
    if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
      return {
        isValid: false,
        error: 'CORS error: The API server is not configured to accept requests from this origin.',
        errorType: 'cors'
      };
    }
    
    // SSL/TLS errors
    if (errorMessage.includes('ssl') || errorMessage.includes('tls') || errorMessage.includes('certificate')) {
      return {
        isValid: false,
        error: 'SSL/TLS error: There is a problem with the API server\'s security certificate.',
        errorType: 'ssl'
      };
    }
    
    // DNS errors
    if (errorMessage.includes('dns') || errorMessage.includes('resolve') || errorMessage.includes('enotfound')) {
      return {
        isValid: false,
        error: 'DNS error: Cannot resolve the API server hostname. Check your DNS settings or the API URL.',
        errorType: 'dns'
      };
    }
    
    // Network errors (including "Failed to fetch")
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('refused') || errorMessage.includes('econnrefused')) {
      return {
        isValid: false,
        error: 'Network error: Cannot connect to the API server. The server may be offline or blocked by a firewall.',
        errorType: 'network'
      };
    }

    // Generic error
    return {
      isValid: false,
      error: `Failed to connect to API: ${error.message || 'Unknown network error'}`,
      errorType: 'unknown'
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
