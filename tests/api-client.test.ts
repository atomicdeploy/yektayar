import { describe, it, expect, vi } from 'vitest'
import { ApiClient } from '../packages/shared/src/api/client'
import packageJson from '../packages/shared/package.json'

describe('ApiClient URL Normalization', () => {
  it('should normalize URLs correctly with various formats', () => {
    // Test with baseURL without trailing slash
    const client1 = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      storageKey: 'test_token'
    })
    
    expect(client1.getBaseURL()).toBe('http://localhost:3000/api')
    
    // Test with baseURL with trailing slash
    const client2 = new ApiClient({
      baseURL: 'http://localhost:3000/api/',
      storageKey: 'test_token'
    })
    
    expect(client2.getBaseURL()).toBe('http://localhost:3000/api/')
  })

  it('should have correct default configuration', () => {
    const client = new ApiClient({
      baseURL: 'https://api.yektayar.ir/api',
      storageKey: 'test_token'
    })
    
    const axiosInstance = client.getAxiosInstance()
    expect(axiosInstance.defaults.headers['Accept']).toBe('application/json')
    expect(axiosInstance.defaults.headers['User-Agent']).toBe(`${packageJson.name}/${packageJson.version}`)
    expect(axiosInstance.defaults.timeout).toBe(30000)
  })

  it('should allow custom timeout', () => {
    const client = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      storageKey: 'test_token',
      timeout: 60000
    })
    
    const axiosInstance = client.getAxiosInstance()
    expect(axiosInstance.defaults.timeout).toBe(60000)
  })

  it('should preserve custom headers', () => {
    const client = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      storageKey: 'test_token',
      headers: {
        'X-Custom-Header': 'test-value'
      }
    })
    
    const axiosInstance = client.getAxiosInstance()
    expect(axiosInstance.defaults.headers['X-Custom-Header']).toBe('test-value')
    expect(axiosInstance.defaults.headers['Accept']).toBe('application/json')
    expect(axiosInstance.defaults.headers['User-Agent']).toBe(`${packageJson.name}/${packageJson.version}`)
  })

  it('should not set User-Agent header in browser environment', () => {
    // Mock browser environment by defining window
    const originalWindow = (global as any).window
    ;(global as any).window = { document: {} }
    
    const client = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      storageKey: 'test_token'
    })
    
    const axiosInstance = client.getAxiosInstance()
    expect(axiosInstance.defaults.headers['User-Agent']).toBeUndefined()
    expect(axiosInstance.defaults.headers['Accept']).toBe('application/json')
    
    // Restore original state
    if (originalWindow === undefined) {
      delete (global as any).window
    } else {
      ;(global as any).window = originalWindow
    }
  })

  it('should set User-Agent header in non-browser environment (Node.js)', () => {
    // This test runs in Node.js by default where window is undefined
    // Store and delete window if it exists
    const originalWindow = (global as any).window
    delete (global as any).window
    
    const client = new ApiClient({
      baseURL: 'http://localhost:3000/api',
      storageKey: 'test_token'
    })
    
    const axiosInstance = client.getAxiosInstance()
    expect(axiosInstance.defaults.headers['User-Agent']).toBe(`${packageJson.name}/${packageJson.version}`)
    expect(axiosInstance.defaults.headers['Accept']).toBe('application/json')
    
    // Restore original state
    if (originalWindow !== undefined) {
      ;(global as any).window = originalWindow
    }
  })
})
