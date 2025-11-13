/**
 * AI Service using pollinations.ai
 * Provides AI-powered chat responses for mental health counseling
 */

const POLLINATIONS_API_URL = 'https://text.pollinations.ai'

interface ConversationMessage {
  role: string
  content: string
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
 * @returns AI response as a string
 */
export async function streamAIResponse(
  message: string,
  conversationHistory?: ConversationMessage[]
): Promise<string> {
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

    if (!response.ok) {
      // If the JSON API doesn't work, try the simple text API
      const simpleResponse = await fetch(`${POLLINATIONS_API_URL}?prompt=${encodeURIComponent(prompt)}`)
      if (!simpleResponse.ok) {
        throw new Error(`Pollinations API error: ${simpleResponse.status} ${simpleResponse.statusText}`)
      }
      const text = await simpleResponse.text()
      return text.trim()
    }

    // Parse JSON response
    const data = await response.json()
    
    // Extract the response text
    let aiResponse = ''
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

    return aiResponse.trim()
  } catch (error) {
    console.error('Error in streamAIResponse:', error)
    
    // Provide a fallback response
    return generateFallbackResponse(message)
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
    const fullResponse = await streamAIResponse(message, conversationHistory)
    
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
    console.error('Error in streamAIResponseChunks:', error)
    yield generateFallbackResponse(message)
  }
}

/**
 * Generate a fallback response when AI service is unavailable
 */
function generateFallbackResponse(message: string): string {
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
    console.error('AI service health check failed:', error)
    return false
  }
}
