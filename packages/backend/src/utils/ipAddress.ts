/**
 * IP Address Extraction Utility
 * 
 * Extracts the real client IP address from various proxy headers
 * with proper priority handling for trusted proxies.
 */

/**
 * Extract the real client IP address from request headers
 * 
 * This function checks multiple headers in priority order to find the real client IP:
 * 1. X-Real-IP - Often set by nginx and other proxies to the actual client IP
 * 2. X-Forwarded-For - Standard header for proxies (first IP in the list is the client)
 * 3. CF-Connecting-IP - Cloudflare's header for the connecting client IP
 * 4. X-Client-IP - Alternative header used by some proxies
 * 5. X-Cluster-Client-IP - Used by some load balancers
 * 6. Forwarded - RFC 7239 standard header
 * 
 * @param headers - The request headers object
 * @returns The client IP address or 'unknown' if not found
 */
export function getClientIpAddress(headers: Record<string, string | undefined>): string {
  // Priority 1: X-Real-IP (most direct, single IP)
  if (headers['x-real-ip']) {
    return cleanIpAddress(headers['x-real-ip'])
  }
  
  // Priority 2: X-Forwarded-For (may contain multiple IPs, first is the client)
  if (headers['x-forwarded-for']) {
    const forwardedIps = headers['x-forwarded-for'].split(',')
    if (forwardedIps.length > 0) {
      return cleanIpAddress(forwardedIps[0])
    }
  }
  
  // Priority 3: CF-Connecting-IP (Cloudflare)
  if (headers['cf-connecting-ip']) {
    return cleanIpAddress(headers['cf-connecting-ip'])
  }
  
  // Priority 4: X-Client-IP
  if (headers['x-client-ip']) {
    return cleanIpAddress(headers['x-client-ip'])
  }
  
  // Priority 5: X-Cluster-Client-IP
  if (headers['x-cluster-client-ip']) {
    return cleanIpAddress(headers['x-cluster-client-ip'])
  }
  
  // Priority 6: Forwarded (RFC 7239)
  if (headers['forwarded']) {
    const forwarded = headers['forwarded']
    // Parse "for=192.168.1.1" or "for=192.168.1.1;proto=https"
    const forMatch = forwarded.match(/for=([^;,\s]+)/)
    if (forMatch && forMatch[1]) {
      // Remove quotes and brackets if present
      return cleanIpAddress(forMatch[1].replace(/["[\]]/g, ''))
    }
  }
  
  // Priority 7: True-Client-IP (Akamai, Cloudflare)
  if (headers['true-client-ip']) {
    return cleanIpAddress(headers['true-client-ip'])
  }
  
  // If no proxy headers found, return unknown
  return 'unknown'
}

/**
 * Clean and validate an IP address string
 * Removes whitespace, brackets, and port numbers
 * 
 * @param ip - The raw IP address string
 * @returns Cleaned IP address
 */
function cleanIpAddress(ip: string): string {
  if (!ip) return 'unknown'
  
  // Remove whitespace
  ip = ip.trim()
  
  // Handle IPv6 with port: [2001:db8::1]:8080 -> 2001:db8::1
  if (ip.startsWith('[') && ip.includes(']:')) {
    const portIndex = ip.lastIndexOf(']:')
    ip = ip.substring(1, portIndex)
    return ip
  }
  
  // Remove IPv6 brackets without port: [2001:db8::1] -> 2001:db8::1
  ip = ip.replace(/^\[|\]$/g, '')
  
  // Remove port number from IPv4 (e.g., "192.168.1.1:8080" -> "192.168.1.1")
  const portIndex = ip.lastIndexOf(':')
  if (portIndex > 0) {
    // Check if it's IPv4 with port (not IPv6)
    const beforeColon = ip.substring(0, portIndex)
    if (!beforeColon.includes(':')) {
      // It's IPv4:port
      ip = beforeColon
    }
  }
  
  return ip
}

/**
 * Check if an IP address is private/local
 * 
 * @param ip - The IP address to check
 * @returns True if the IP is private/local
 */
export function isPrivateIp(ip: string): boolean {
  if (ip === 'unknown' || ip === 'localhost' || ip === '::1') {
    return true
  }
  
  // Check for private IPv4 ranges
  if (ip.includes('.')) {
    const parts = ip.split('.').map(p => parseInt(p, 10))
    if (parts.length === 4) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true
      // 127.0.0.0/8 (loopback)
      if (parts[0] === 127) return true
    }
  }
  
  // Check for private IPv6 ranges
  if (ip.includes(':')) {
    const lower = ip.toLowerCase()
    // fc00::/7 (unique local)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true
    // fe80::/10 (link local)
    if (lower.startsWith('fe80:')) return true
  }
  
  return false
}
