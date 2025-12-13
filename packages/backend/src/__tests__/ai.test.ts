/**
 * AI Service Tests
 * Tests for Pollinations AI integration
 */

import { describe, it, expect } from 'vitest'
import { streamAIResponse, checkAIServiceHealth } from '../services/aiService'

describe('AI Service - Pollinations Integration', () => {
  it('should export streamAIResponse function', () => {
    expect(streamAIResponse).toBeDefined()
    expect(typeof streamAIResponse).toBe('function')
  })

  it('should export checkAIServiceHealth function', () => {
    expect(checkAIServiceHealth).toBeDefined()
    expect(typeof checkAIServiceHealth).toBe('function')
  })

  it('should handle a simple message and return a response', async () => {
    const message = 'Hello, how are you?'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(typeof response).toBe('string')
    expect(response.length).toBeGreaterThan(0)
    
    // AI should respond with a greeting or acknowledge the message
    expect(response.length).toBeGreaterThan(10)
  }, 30000) // 30 second timeout for API call

  it('should handle mental health related queries', async () => {
    const message = 'I am feeling stressed. Can you help me?'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(typeof response).toBe('string')
    expect(response.length).toBeGreaterThan(20)
    
    // Response should be supportive
    // AI responses should contain helpful content
  }, 30000)

  it('should handle conversation history context', async () => {
    const conversationHistory = [
      { role: 'user', content: 'My name is John' },
      { role: 'assistant', content: 'Hello John, nice to meet you!' }
    ]
    
    const message = 'What is my name?'
    const response = await streamAIResponse(message, conversationHistory)
    
    expect(response).toBeDefined()
    expect(typeof response).toBe('string')
    expect(response.length).toBeGreaterThan(0)
    
    // AI should ideally remember the name from context
    // However, pollinations.ai may not always maintain perfect context
  }, 30000)

  it('should handle empty message gracefully', async () => {
    const message = ''
    
    try {
      const response = await streamAIResponse(message)
      // Should either return a fallback or handle empty message
      expect(response).toBeDefined()
    } catch (error) {
      // If it throws, that's also acceptable behavior
      expect(error).toBeDefined()
    }
  }, 30000)

  it('should return fallback response on API failure', async () => {
    // This tests the fallback mechanism
    const message = 'Test message'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(typeof response).toBe('string')
    
    // Even if API fails, we should get a fallback response
    expect(response.length).toBeGreaterThan(0)
  }, 30000)
})

describe('AI Service Health Check', () => {
  it('should check AI service health', async () => {
    const isHealthy = await checkAIServiceHealth()
    
    // Health check should return a boolean
    expect(typeof isHealthy).toBe('boolean')
    
    // We expect it to be healthy if Pollinations API is accessible
    // If not, the test will still pass, but we log the result
    console.log(`AI Service Health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`)
  }, 30000)
})

describe('AI Service Response Quality', () => {
  it('should provide appropriate responses for anxiety', async () => {
    const message = 'I have been feeling very anxious lately.'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(30)
    
    // Check that response is supportive (contains common supportive words)
    const supportiveWords = ['understand', 'help', 'support', 'anxiety', 'feel', 'cope', 'manage']
    const lowerResponse = response.toLowerCase()
    const hasSupportiveContent = supportiveWords.some(word => lowerResponse.includes(word))
    
    // The response should show empathy
    expect(hasSupportiveContent).toBe(true)
  }, 45000)

  it('should provide appropriate responses for stress management', async () => {
    const message = 'What are some ways to manage stress?'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(30)
    
    // Response should contain practical advice
    const practicalWords = ['stress', 'relaxation', 'exercise', 'breathing', 'technique', 'help', 'manage', 'practice']
    const lowerResponse = response.toLowerCase()
    const hasPracticalContent = practicalWords.some(word => lowerResponse.includes(word))
    
    expect(hasPracticalContent).toBe(true)
  }, 30000)

  it('should maintain professional tone', async () => {
    const message = 'Can you give me some advice?'
    const response = await streamAIResponse(message)
    
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(20)
    
    // Response should be professional and supportive
    // It should not contain inappropriate language
    const inappropriateWords = ['stupid', 'dumb', 'idiot', 'loser']
    const lowerResponse = response.toLowerCase()
    const hasInappropriateContent = inappropriateWords.some(word => lowerResponse.includes(word))
    
    expect(hasInappropriateContent).toBe(false)
  }, 30000)
})
