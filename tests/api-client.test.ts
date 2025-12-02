import { describe, it, expect } from 'vitest'
import { ApiClient } from '../packages/shared/src/api/client'

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
    expect(axiosInstance.defaults.headers['User-Agent']).toBe('@yektayar/shared/0.1.0')
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
    expect(axiosInstance.defaults.headers['User-Agent']).toBe('@yektayar/shared/0.1.0')
  })
})
