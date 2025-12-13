/**
 * AI Service using pollinations.ai
 * Provides AI-powered chat responses for mental health counseling
 */

import { logger } from '@yektayar/shared'

const POLLINATIONS_API_URL = 'https://text.pollinations.ai'
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
}

/**
 * System prompt for the AI counselor
 * Defines the AI's role, personality, and guidelines
 */
const SYSTEM_PROMPT = `You are a compassionate and professional mental health AI counselor named YektaYar AI. Your role is to provide supportive, empathetic, and helpful guidance to users seeking mental health support.

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

/**
 * Stream AI response from pollinations.ai
 * @param message User's message
 * @param conversationHistory Previous conversation context (optional)
 * @returns Object with AI response and optional debug info
 */
export async function streamAIResponse(
  message: string,
  conversationHistory?: ConversationMessage[]
): Promise<{ response: string; debug?: AIDebugInfo }> {
  const debugInfo: AIDebugInfo = IS_DEVELOPMENT ? { timestamp: new Date().toISOString() } : {}
  
  try {
    // Build conversation context
    const messages: ConversationMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10)
      messages.push(...recentHistory)
    }

    // Add current user message
    messages.push({ role: 'user', content: message })

    // Create the prompt for pollinations.ai
    // Pollinations expects a simple text prompt, so we'll format the conversation
    let prompt = SYSTEM_PROMPT + '\n\n'
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n'
      conversationHistory.slice(-5).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant'
        prompt += `${role}: ${msg.content}\n`
      })
      prompt += '\n'
    }
    
    prompt += `User: ${message}\nAssistant:`

    if (IS_DEVELOPMENT) {
      debugInfo.apiUrl = POLLINATIONS_API_URL
      debugInfo.requestMethod = 'POST'
    }

    // Make request to pollinations.ai
    const response = await fetch(POLLINATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(1) // Skip the system message we already added
        ],
        model: 'openai', // or 'mistral', 'llama' depending on availability
        seed: Math.floor(Math.random() * 1000000),
        jsonMode: false
      })
    })

    if (IS_DEVELOPMENT) {
      debugInfo.responseStatus = response.status
      debugInfo.contentType = response.headers.get('content-type') || undefined
      debugInfo.responseHeaders = Object.fromEntries(response.headers.entries())
    }

    if (!response.ok) {
      // If the JSON API doesn't work, try the simple text API
      if (IS_DEVELOPMENT) {
        debugInfo.error = `POST request failed with status ${response.status}, trying GET fallback`
      }
      
      const simpleUrl = `${POLLINATIONS_API_URL}?prompt=${encodeURIComponent(prompt)}`
      const simpleResponse = await fetch(simpleUrl)
      
      if (IS_DEVELOPMENT) {
        debugInfo.apiUrl = simpleUrl
        debugInfo.requestMethod = 'GET'
        debugInfo.responseStatus = simpleResponse.status
        debugInfo.contentType = simpleResponse.headers.get('content-type') || undefined
      }
      
      if (!simpleResponse.ok) {
        throw new Error(`Pollinations API error: ${simpleResponse.status} ${simpleResponse.statusText}`)
      }
      const text = await simpleResponse.text()
      return { response: text.trim(), debug: IS_DEVELOPMENT ? debugInfo : undefined }
    }

    // Try to parse as JSON first, but fallback to text if it fails
    const contentType = response.headers.get('content-type')
    let aiResponse = ''
    
    if (contentType?.includes('application/json')) {
      try {
        const data = await response.json() as any
        
        // Extract the response text from JSON
        if (typeof data === 'string') {
          aiResponse = data
        } else if (data.choices && data.choices[0]?.message?.content) {
          aiResponse = data.choices[0].message.content
        } else if (data.response) {
          aiResponse = data.response
        } else if (data.text) {
          aiResponse = data.text
        } else {
          aiResponse = JSON.stringify(data)
        }
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        if (IS_DEVELOPMENT) {
          debugInfo.error = 'JSON parsing failed, falling back to text'
          debugInfo.errorDetails = jsonError instanceof Error ? jsonError.message : String(jsonError)
        }
        logger.warn('Failed to parse JSON response, falling back to text')
        aiResponse = await response.text()
      }
    } else {
      // Content is not JSON, get as text directly
      aiResponse = await response.text()
    }

    return { response: aiResponse.trim(), debug: IS_DEVELOPMENT ? debugInfo : undefined }
  } catch (error) {
    logger.error('Error in streamAIResponse:', error)
    
    if (IS_DEVELOPMENT) {
      debugInfo.isFallback = true
      debugInfo.error = 'API request failed, using fallback response'
      debugInfo.errorDetails = error instanceof Error ? error.message : String(error)
    }
    
    // Provide a fallback response
    return { 
      response: generateFallbackResponse(message), 
      debug: IS_DEVELOPMENT ? debugInfo : undefined 
    }
  }
}

/**
 * Generate a streaming AI response (for WebSocket)
 * This will chunk the response for real-time streaming
 */
export async function* streamAIResponseChunks(
  message: string,
  conversationHistory?: ConversationMessage[]
): AsyncGenerator<string, void, unknown> {
  try {
    // Get the full response
    const result = await streamAIResponse(message, conversationHistory)
    const fullResponse = result.response
    
    // Split into words for streaming effect
    const words = fullResponse.split(' ')
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const chunk = i === words.length - 1 ? word : word + ' '
      
      // Yield each word with a small delay simulation
      yield chunk
      
      // Small delay to simulate streaming (can be removed in production)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  } catch (error) {
    logger.error('Error in streamAIResponseChunks:', error)
    yield generateFallbackResponse(message)
  }
}

/**
 * Generate a fallback response when AI service is unavailable
 */
function generateFallbackResponse(_message: string): string {
  const responses = [
    "Thank you for reaching out. I'm here to support you. While I'm experiencing some technical difficulties at the moment, I want you to know that what you're feeling is valid and important. Could you tell me more about what's on your mind?",
    
    "I appreciate you sharing with me. Although I'm having trouble connecting to my full resources right now, I'm still here for you. Remember that seeking help is a sign of strength, and taking care of your mental health is important.",
    
    "I'm experiencing some technical challenges, but I want to acknowledge your message. Your mental wellbeing matters, and it's brave of you to reach out. Please know that you're not alone, and professional support is available if you need it.",
    
    "Thank you for trusting me with your thoughts. While I'm having some connectivity issues, I encourage you to continue this conversation. If you're in crisis or need immediate support, please reach out to a mental health professional or crisis hotline."
  ]
  
  // Return a random fallback response
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Health check for AI service
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(POLLINATIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      })
    })
    return response.ok
  } catch (error) {
    logger.error('AI service health check failed:', error)
    return false
  }
}
