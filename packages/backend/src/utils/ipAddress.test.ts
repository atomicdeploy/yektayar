/**
 * IP Address Extraction Utility Tests
 * 
 * Tests for IP address extraction from various proxy headers
 */

import { describe, it, expect } from 'vitest'
import { getClientIpAddress, isPrivateIp } from './ipAddress'

describe('IP Address Utilities', () => {
  describe('getClientIpAddress', () => {
    it('should extract IP from X-Real-IP header (priority 1)', () => {
      const headers = {
        'x-real-ip': '203.0.113.1',
        'x-forwarded-for': '198.51.100.1, 203.0.113.2',
        'cf-connecting-ip': '198.51.100.2'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract first IP from X-Forwarded-For header (priority 2)', () => {
      const headers = {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.0.2.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from CF-Connecting-IP header (priority 3)', () => {
      const headers = {
        'cf-connecting-ip': '203.0.113.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from X-Client-IP header (priority 4)', () => {
      const headers = {
        'x-client-ip': '203.0.113.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from X-Cluster-Client-IP header (priority 5)', () => {
      const headers = {
        'x-cluster-client-ip': '203.0.113.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from Forwarded header (RFC 7239) (priority 6)', () => {
      const headers = {
        'forwarded': 'for=203.0.113.1;proto=https'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from Forwarded header with quotes', () => {
      const headers = {
        'forwarded': 'for="203.0.113.1";proto=https'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should extract IP from True-Client-IP header (priority 7)', () => {
      const headers = {
        'true-client-ip': '203.0.113.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should return "unknown" when no headers present', () => {
      const headers = {}
      
      expect(getClientIpAddress(headers)).toBe('unknown')
    })

    it('should handle IPv4 address with port', () => {
      const headers = {
        'x-real-ip': '203.0.113.1:8080'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should handle IPv6 address', () => {
      const headers = {
        'x-real-ip': '2001:db8::1'
      }
      
      expect(getClientIpAddress(headers)).toBe('2001:db8::1')
    })

    it('should handle IPv6 address with brackets', () => {
      const headers = {
        'x-real-ip': '[2001:db8::1]'
      }
      
      expect(getClientIpAddress(headers)).toBe('2001:db8::1')
    })

    it('should handle IPv6 address with brackets and port', () => {
      const headers = {
        'x-real-ip': '[2001:db8::1]:8080'
      }
      
      expect(getClientIpAddress(headers)).toBe('2001:db8::1')
    })

    it('should trim whitespace from IP addresses', () => {
      const headers = {
        'x-real-ip': '  203.0.113.1  '
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should handle X-Forwarded-For with spaces', () => {
      const headers = {
        'x-forwarded-for': ' 203.0.113.1 , 198.51.100.1 '
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should prioritize X-Real-IP over X-Forwarded-For', () => {
      const headers = {
        'x-real-ip': '203.0.113.1',
        'x-forwarded-for': '198.51.100.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should handle multiple Forwarded directives', () => {
      const headers = {
        'forwarded': 'for=203.0.113.1;proto=https,for=198.51.100.1'
      }
      
      expect(getClientIpAddress(headers)).toBe('203.0.113.1')
    })

    it('should handle Forwarded with IPv6', () => {
      const headers = {
        'forwarded': 'for="[2001:db8::1]";proto=https'
      }
      
      expect(getClientIpAddress(headers)).toBe('2001:db8::1')
    })

    it('should return "unknown" for empty header values', () => {
      const headers = {
        'x-real-ip': '',
        'x-forwarded-for': ''
      }
      
      expect(getClientIpAddress(headers)).toBe('unknown')
    })

    it('should handle malformed X-Forwarded-For gracefully', () => {
      const headers = {
        'x-forwarded-for': ',,'
      }
      
      expect(getClientIpAddress(headers)).toBe('unknown')
    })
  })

  describe('isPrivateIp', () => {
    it('should identify "unknown" as private', () => {
      expect(isPrivateIp('unknown')).toBe(true)
    })

    it('should identify "localhost" as private', () => {
      expect(isPrivateIp('localhost')).toBe(true)
    })

    it('should identify "::1" as private', () => {
      expect(isPrivateIp('::1')).toBe(true)
    })

    it('should identify 10.x.x.x as private', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true)
      expect(isPrivateIp('10.255.255.255')).toBe(true)
    })

    it('should identify 172.16-31.x.x as private', () => {
      expect(isPrivateIp('172.16.0.1')).toBe(true)
      expect(isPrivateIp('172.31.255.255')).toBe(true)
      expect(isPrivateIp('172.20.10.1')).toBe(true)
    })

    it('should not identify 172.15.x.x as private', () => {
      expect(isPrivateIp('172.15.0.1')).toBe(false)
    })

    it('should not identify 172.32.x.x as private', () => {
      expect(isPrivateIp('172.32.0.1')).toBe(false)
    })

    it('should identify 192.168.x.x as private', () => {
      expect(isPrivateIp('192.168.0.1')).toBe(true)
      expect(isPrivateIp('192.168.255.255')).toBe(true)
    })

    it('should identify 127.x.x.x as private (loopback)', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true)
      expect(isPrivateIp('127.255.255.255')).toBe(true)
    })

    it('should identify fc00::/7 as private (IPv6 unique local)', () => {
      expect(isPrivateIp('fc00::1')).toBe(true)
      expect(isPrivateIp('fd00::1')).toBe(true)
    })

    it('should identify fe80::/10 as private (IPv6 link local)', () => {
      expect(isPrivateIp('fe80::1')).toBe(true)
      expect(isPrivateIp('fe80::dead:beef')).toBe(true)
    })

    it('should not identify public IPv4 as private', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false)
      expect(isPrivateIp('203.0.113.1')).toBe(false)
      expect(isPrivateIp('198.51.100.1')).toBe(false)
    })

    it('should not identify public IPv6 as private', () => {
      expect(isPrivateIp('2001:db8::1')).toBe(false)
      expect(isPrivateIp('2606:2800:220:1:248:1893:25c8:1946')).toBe(false)
    })

    it('should handle case insensitivity for IPv6', () => {
      expect(isPrivateIp('FC00::1')).toBe(true)
      expect(isPrivateIp('FE80::1')).toBe(true)
    })
  })
})
