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
 * Checks if a solution exists for a given error detail
 */
export function findSolutionForError(solutions: SolutionsData, errorDetails: string): Solution | null {
  // Check for API_BASE_URL related errors
  if (errorDetails.includes('API_BASE_URL') || errorDetails.includes('VITE_API_BASE_URL')) {
    return getSolution(solutions, 'API_BASE_URL')
  }
  
  return null
}
