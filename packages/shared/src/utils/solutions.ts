/**
 * Solutions utility for loading error solutions in development mode
 */

export interface Solution {
  problem: string
  solution: string
  steps: string[]
  note?: string
}

export interface SolutionsData {
  [key: string]: Solution
}

/**
 * Parses the solutions markdown file and returns structured data
 */
export function parseSolutionsMarkdown(markdown: string): SolutionsData {
  const solutions: SolutionsData = {}
  
  // Split by ## headers (which represent different error types)
  const sections = markdown.split(/^## /m).slice(1)
  
  sections.forEach(section => {
    const lines = section.split('\n')
    const key = lines[0].trim()
    
    let problem = ''
    let solution = ''
    const steps: string[] = []
    let note = ''
    
    let currentSection = ''
    let inCodeBlock = false
    let currentCodeBlock = ''
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      // Check for section headers
      if (line.startsWith('### Problem')) {
        currentSection = 'problem'
        continue
      } else if (line.startsWith('### Solution')) {
        currentSection = 'solution'
        continue
      }
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          steps.push(currentCodeBlock.trim())
          currentCodeBlock = ''
          inCodeBlock = false
        } else {
          // Start of code block
          inCodeBlock = true
        }
        continue
      }
      
      if (inCodeBlock) {
        currentCodeBlock += line + '\n'
        continue
      }
      
      // Handle regular content
      if (line.trim() === '') continue
      
      if (currentSection === 'problem') {
        problem += line.trim() + ' '
      } else if (currentSection === 'solution') {
        if (line.startsWith('**Note:**')) {
          note = line.replace('**Note:**', '').trim()
        } else if (!line.startsWith('You can') && !line.startsWith('Or manually')) {
          solution += line.trim() + ' '
        }
      }
    }
    
    solutions[key] = {
      problem: problem.trim(),
      solution: solution.trim(),
      steps: steps.filter(s => s.length > 0),
      note: note || undefined
    }
  })
  
  return solutions
}

/**
 * Gets a specific solution by key
 */
export function getSolution(solutions: SolutionsData, key: string): Solution | null {
  return solutions[key] || null
}

/**
 * Maps error type to solution key
 */
export function mapErrorTypeToSolutionKey(errorType?: string): string | null {
  switch (errorType) {
    case 'config':
      return 'CONFIG_ERROR'
    case 'network':
      return 'NETWORK_ERROR'
    case 'cors':
      return 'CORS_ERROR'
    case 'ssl':
      return 'SSL_ERROR'
    case 'dns':
      return 'DNS_ERROR'
    case 'timeout':
      return 'TIMEOUT_ERROR'
    case 'server':
      return 'SERVER_ERROR'
    default:
      return null
  }
}

/**
 * Checks if a solution exists for a given error detail or error type
 */
export function findSolutionForError(solutions: SolutionsData, errorDetails: string, errorType?: string): Solution | null {
  // First try to find solution based on errorType
  if (errorType) {
    const solutionKey = mapErrorTypeToSolutionKey(errorType)
    if (solutionKey) {
      const solution = getSolution(solutions, solutionKey)
      if (solution) return solution
    }
  }
  
  // Fallback: Check for API_BASE_URL related errors in details
  if (errorDetails.includes('API_BASE_URL') || errorDetails.includes('VITE_API_BASE_URL')) {
    return getSolution(solutions, 'CONFIG_ERROR')
  }
  
  return null
}
