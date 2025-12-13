/**
 * AI Service using pollinations.ai
 * Provides AI-powered chat responses for mental health counseling
 */

import { logger } from '@yektayar/shared'

const POLLINATIONS_API_URL = 'https://text.pollinations.ai/v1/chat/completions'
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'

interface ConversationMessage {
  role: string
  content: string
}

export interface AIDebugInfo {
  error?: string
  errorDetails?: any
  apiUrl?: string
  requestMethod?: string
  responseStatus?: number
  responseHeaders?: Record<string, string>
  contentType?: string
  isFallback?: boolean
  timestamp?: string
  streaming?: boolean
}

export interface AIResponseMetadata {
  modelUsed?: string
  tokensUsed?: {
    prompt?: number
    completion?: number
    reasoning?: number
    total?: number
  }
}

/**
 * Get system prompt based on locale
 * Uses i18n translations for proper language support
 */
function getSystemPrompt(locale: string = 'en'): string {
  // Import translations dynamically to get system prompt
  try {
    const translations = require('@yektayar/shared/src/i18n/translations.json')
    const lang = locale.startsWith('fa') ? 'fa' : 'en'
    return translations[lang]?.ai?.system_prompt || getDefaultSystemPrompt()
  } catch (error) {
    logger.warn('Failed to load i18n translations, using default prompt')
    return getDefaultSystemPrompt()
  }
}

/**
 * Default system prompt (fallback)
 */
function getDefaultSystemPrompt(): string {
  return `You are a compassionate and professional mental health AI counselor named YektaYar AI. Your role is to provide supportive, empathetic, and helpful guidance to users seeking mental health support.

Guidelines:
1. Always be empathetic, warm, and non-judgmental
2. Provide practical, evidence-based advice for mental wellness
3. Encourage professional help when needed (you are not a replacement for professional therapy)
4. Maintain confidentiality and respect privacy
5. Use simple, clear language that's easy to understand
6. Be culturally sensitive and respectful
7. Focus on positive psychology and solution-oriented approaches
8. Validate users' feelings and experiences
9. Provide coping strategies and self-care techniques
10. Never give medical diagnoses or prescribe medication

Your responses should be:
- Supportive and understanding
- Practical and actionable
- Brief but comprehensive (2-4 paragraphs typically)
- Encouraging and hopeful
- Focused on the user's wellbeing

Remember: You are here to support, guide, and encourage users on their mental wellness journey.`
}

/**
 * Stream AI response from pollinations.ai
 * @param message User's message
 * @param conversationHistory Previous conversation context (optional)
 * @param locale User's locale for proper language support (default: 'en')
 * @returns Object with AI response and optional debug info
 */
export async function streamAIResponse(
  message: string,
  conversationHistory?: ConversationMessage[],
  locale: string = 'en'
): Promise<{ response: string; metadata?: AIResponseMetadata; debug?: AIDebugInfo }> {
  const debugInfo: AIDebugInfo = IS_DEVELOPMENT ? { timestamp: new Date().toISOString() } : {}
  const metadata: AIResponseMetadata = {}
  
  try {
    // Get system prompt based on locale (from i18n translations)
    const systemPrompt = getSystemPrompt(locale)
    
    // Build conversation context with system prompt
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10)
      messages.push(...recentHistory)
    }

    // Add current user message
    messages.push({ role: 'user', content: message })

    if (IS_DEVELOPMENT) {
      debugInfo.apiUrl = POLLINATIONS_API_URL
      debugInfo.requestMethod = 'POST'
      debugInfo.streaming = false
    }

    // Make request to pollinations.ai v1/chat/completions endpoint
    // Uses OpenAI-compatible API format
    const response = await fetch(POLLINATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'YektaYar/1.0 (Mental Health Platform)',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'openai', // Available: openai, openai-large, mistral, llama
        stream: false, // For non-streaming responses (use streamAIResponseSSE for streaming)
        seed: Math.floor(Math.random() * 1000000)
      })
    })

    if (IS_DEVELOPMENT) {
      debugInfo.responseStatus = response.status
      debugInfo.contentType = response.headers.get('content-type') || undefined
      debugInfo.responseHeaders = Object.fromEntries(response.headers.entries())
    }

    // Extract metadata from response headers (x-* headers from Pollinations)
    const modelUsed = response.headers.get('x-model-used')
    const promptTokens = response.headers.get('x-usage-prompt-text-tokens')
    const completionTokens = response.headers.get('x-usage-completion-text-tokens')
    const reasoningTokens = response.headers.get('x-usage-completion-reasoning-tokens')
    const totalTokens = response.headers.get('x-usage-total-tokens')

    if (modelUsed) {
      metadata.modelUsed = modelUsed
    }

    if (promptTokens || completionTokens || reasoningTokens || totalTokens) {
      metadata.tokensUsed = {
        prompt: promptTokens ? parseInt(promptTokens, 10) : undefined,
        completion: completionTokens ? parseInt(completionTokens, 10) : undefined,
        reasoning: reasoningTokens ? parseInt(reasoningTokens, 10) : undefined,
        total: totalTokens ? parseInt(totalTokens, 10) : undefined
      }
    }

    if (!response.ok) {
      if (IS_DEVELOPMENT) {
        debugInfo.error = `POST request failed with status ${response.status}`
      }
      throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`)
    }

    // Try to parse response - handle both JSON and plain text responses
    // Pollinations API may return either format depending on configuration
    const contentType = response.headers.get('content-type')
    let aiResponse = ''
    
    if (contentType?.includes('application/json')) {
      try {
        const data = await response.json() as any
        
        // Extract the response text from JSON (OpenAI-compatible format)
        if (typeof data === 'string') {
          aiResponse = data
        } else if (data.choices && data.choices[0]?.message?.content) {
          // Standard OpenAI format: data.choices[0].message.content
          aiResponse = data.choices[0].message.content
        } else if (data.response) {
          aiResponse = data.response
        } else if (data.text) {
          aiResponse = data.text
        } else {
          aiResponse = JSON.stringify(data)
        }
      } catch (jsonError) {
        // If JSON parsing fails, fallback to plain text
        if (IS_DEVELOPMENT) {
          debugInfo.error = 'JSON parsing failed, falling back to text'
          debugInfo.errorDetails = jsonError instanceof Error ? jsonError.message : String(jsonError)
        }
        logger.warn('Failed to parse JSON response, falling back to text')
        aiResponse = await response.text()
      }
    } else {
      // Content is plain text, not JSON - read directly
      aiResponse = await response.text()
    }

    return { 
      response: aiResponse.trim(), 
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      debug: IS_DEVELOPMENT ? debugInfo : undefined 
    }
  } catch (error) {
    logger.error('Error in streamAIResponse:', error)
    
    // Provide debug info in development mode
    if (IS_DEVELOPMENT) {
      debugInfo.isFallback = true
      debugInfo.error = 'API request failed, using fallback response'
      debugInfo.errorDetails = error instanceof Error ? error.message : String(error)
    }
    
    // Provide a fallback response
    return { 
      response: generateFallbackResponse(message, locale), 
      metadata: undefined,
      debug: IS_DEVELOPMENT ? debugInfo : undefined 
    }
  }
}

/**
 * Stream AI response with real SSE from Pollinations.ai
 * This uses actual Server-Sent Events from the API for real-time streaming
 * Used by WebSocket handlers to provide streaming responses to frontend
 */
export async function* streamAIResponseSSE(
  message: string,
  conversationHistory?: ConversationMessage[],
  locale: string = 'en'
): AsyncGenerator<string, void, unknown> {
  try {
    // Get locale-specific system prompt from i18n
    const systemPrompt = getSystemPrompt(locale)
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history for context (last 10 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-10))
    }
    messages.push({ role: 'user', content: message })

    // Request streaming response from Pollinations API
    const response = await fetch(POLLINATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'YektaYar/1.0 (Mental Health Platform)',
      },
      body: JSON.stringify({
        messages: messages,
        model: 'openai',
        stream: true, // Enable SSE streaming
        seed: Math.floor(Math.random() * 1000000)
      })
    })

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`)
    }

    // Process Server-Sent Events (SSE) stream
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (!reader) {
      throw new Error('No response body available')
    }

    let buffer = ''
    
    // Read and process SSE chunks as they arrive
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      // Decode incoming bytes and split into lines
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      // Process each complete SSE line
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // Remove 'data: ' prefix
          if (data === '[DONE]') continue // SSE completion signal
          
          try {
            // Parse SSE JSON chunk (OpenAI-compatible format)
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              yield content // Yield text chunk to caller
            }
          } catch (e) {
            // Skip malformed JSON chunks (can happen with SSE)
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error in streamAIResponseSSE:', error)
    // Return locale-aware fallback on error
    yield generateFallbackResponse(message, locale)
  }
}

/**
 * Generate a streaming AI response (for WebSocket)
 * This will chunk the response for real-time streaming
 */
export async function* streamAIResponseChunks(
  message: string,
  conversationHistory?: ConversationMessage[],
  locale: string = 'en'
): AsyncGenerator<string, void, unknown> {
  try {
    // Use SSE streaming for real-time response
    for await (const chunk of streamAIResponseSSE(message, conversationHistory, locale)) {
      yield chunk
    }
  } catch (error) {
    logger.error('Error in streamAIResponseChunks:', error)
    yield generateFallbackResponse(message)
  }
}

/**
 * Generate a fallback response when AI service is unavailable
 * Returns locale-specific fallback
 */
function generateFallbackResponse(_message: string, locale: string = 'en'): string {
  const fallbackResponses = {
    en: [
      "Thank you for reaching out. I'm here to support you. While I'm experiencing some technical difficulties at the moment, I want you to know that what you're feeling is valid and important. Could you tell me more about what's on your mind?",
      "I appreciate you sharing with me. Although I'm having trouble connecting to my full resources right now, I'm still here for you. Remember that seeking help is a sign of strength, and taking care of your mental health is important.",
      "I'm experiencing some technical challenges, but I want to acknowledge your message. Your mental wellbeing matters, and it's brave of you to reach out. Please know that you're not alone, and professional support is available if you need it.",
      "Thank you for trusting me with your thoughts. While I'm having some connectivity issues, I encourage you to continue this conversation. If you're in crisis or need immediate support, please reach out to a mental health professional or crisis hotline."
    ],
    fa: [
      "ممنون که با من صحبت می‌کنی. الان یه کم مشکل فنی دارم، ولی می‌خوام بدونی که احساسات تو واقعی و مهم هستن. می‌خوای بیشتر بهم بگی چی توی ذهنته؟",
      "خیلی ممنون که باهام به اشتراک گذاشتی. الان یه کم مشکل دارم برای اتصال، ولی اینجام برای تو. یادت باشه که درخواست کمک نشونه قدرت هست و مراقبت از سلامت روانت خیلی مهمه.",
      "الان یه چالش فنی دارم، ولی می‌خوام پیامت رو تأیید کنم. سلامتی روانت مهمه و شجاعانه بود که تماس گرفتی. بدون که تنها نیستی و در صورت نیاز می‌تونی به متخصصین مراجعه کنی.",
      "ممنون که افکارت رو باهام در میون گذاشتی. الان یه کم مشکل اتصال دارم، ولی خوشحال میشم بیشتر صحبت کنیم. اگه در بحران هستی یا نیاز به کمک فوری داری، لطفاً با متخصص سلامت روان یا خط بحران تماس بگیر."
    ]
  }
  
  const lang = locale.startsWith('fa') ? 'fa' : 'en'
  const responses = fallbackResponses[lang]
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Health check for AI service
 * Tests the Pollinations API with a specific test query
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    // Use the specific test URL to verify operational state
    const testUrl = 'https://text.pollinations.ai/Return+a+valid+json+only+stating+operational=true+without+markdown'
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'YektaYar/1.0 (Mental Health Platform)',
      }
    })
    
    if (!response.ok) {
      return false
    }

    // Try to parse the response as JSON
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      // Check if operational key is true
      return data.operational === true
    } catch (parseError) {
      // If we can't parse as JSON or operational is not true, return false
      logger.warn('AI service health check: Invalid JSON response')
      return false
    }
  } catch (error) {
    logger.error('AI service health check failed:', error)
    return false
  }
}
