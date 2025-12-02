/**
 * Tests/Assessments API Routes
 * Handles test management, submissions, and results
 */

import { Elysia, t } from 'elysia'
import { query, getDatabase } from '../services/database'
import { logger } from '@yektayar/shared'

export const testRoutes = new Elysia({ prefix: '/api/tests' })
  /**
   * GET /api/tests
   * Get all available tests/assessments (without questions to reduce payload size)
   */
  .get('/', async () => {
    try {
      const db = getDatabase()
      const tests = await db`
        SELECT 
          id,
          title,
          description,
          jsonb_array_length(questions) as question_count,
          created_at,
          updated_at
        FROM assessments
        ORDER BY created_at DESC
      `

      return {
        success: true,
        data: tests,
      }
    } catch (error) {
      logger.error('Error fetching tests:', error)
      return {
        success: false,
        error: 'Failed to fetch tests',
      }
    }
  }, {
    detail: {
      tags: ['Tests'],
      summary: 'List all tests',
      description: 'Get all available tests/assessments without question details'
    }
  })

  /**
   * GET /api/tests/:id
   * Get a specific test by ID
   */
  .get('/:id', async ({ params, set }) => {
    try {
      const db = getDatabase()
      const { id } = params

      const [test] = await db`
        SELECT 
          id,
          title,
          description,
          questions,
          created_at,
          updated_at
        FROM assessments
        WHERE id = ${id}
      `

      if (!test) {
        set.status = 404
        return {
          success: false,
          error: 'Test not found',
        }
      }

      return {
        success: true,
        data: test,
      }
    } catch (error) {
      logger.error('Error fetching test:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to fetch test',
      }
    }
  }, {
    detail: {
      tags: ['Tests'],
      summary: 'Get a specific test',
      description: 'Get detailed information about a specific test by ID'
    }
  })

  /**
   * POST /api/tests
   * Create a new test (admin only)
   */
  .post('/', async ({ body, set }) => {
    try {
      const db = getDatabase()
      const { title, description, questions } = body as {
        title: string
        description?: string
        questions: any[]
      }

      // Validate required fields
      if (!title || !questions) {
        set.status = 400
        return {
          success: false,
          error: 'Title and questions are required',
        }
      }

      const [test] = await db`
        INSERT INTO assessments (title, description, questions)
        VALUES (${title}, ${description || ''}, ${JSON.stringify(questions)})
        RETURNING *
      `

      logger.info(`Test created: ${test.id} - ${title}`)

      set.status = 201
      return {
        success: true,
        data: test,
      }
    } catch (error) {
      logger.error('Error creating test:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to create test',
      }
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      questions: t.Array(t.Any())
    }),
    detail: {
      tags: ['Tests'],
      summary: 'Create a new test',
      description: 'Create a new test/assessment (admin only)'
    }
  })

  /**
   * POST /api/tests/:id/submit
   * Submit test answers and get results
   */
  .post('/:id/submit', async ({ params, body, set, headers }) => {
    try {
      const db = getDatabase()
      const { id } = params
      const { answers, demographicInfo, userId } = body as {
        answers: any[]
        demographicInfo?: any
        userId?: number
      }

      // For now, we'll accept userId from body until auth is implemented
      if (!userId) {
        set.status = 401
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      // Validate required fields
      if (!answers) {
        set.status = 400
        return {
          success: false,
          error: 'Answers are required',
        }
      }

      // Get the test
      const [test] = await db`
        SELECT * FROM assessments WHERE id = ${id}
      `

      if (!test) {
        set.status = 404
        return {
          success: false,
          error: 'Test not found',
        }
      }

      // Calculate score based on test type
      let score = 0
      let personalityType = null
      let maxScore = 0
      const sectionScores: Record<string, { title: string; titleEn: string; score: number; maxScore: number }> = {}

      // For personality tests, sum up all answers
      if (test.questions && Array.isArray(test.questions)) {
        const questions = test.questions as any[]
        
        // Calculate total score
        questions.forEach((question, index) => {
          const answer = answers[index]
          if (typeof answer === 'number') {
            score += answer
            maxScore += 5
            
            // Track section scores if sections exist
            if (question.section) {
              if (!sectionScores[question.section]) {
                sectionScores[question.section] = {
                  title: question.sectionTitle || '',
                  titleEn: question.sectionTitleEn || '',
                  score: 0,
                  maxScore: 0,
                }
              }
              sectionScores[question.section].score += answer
              sectionScores[question.section].maxScore += 5
            }
          }
        })
      }

      // Determine personality type based on score ranges
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

      if (percentage < 30) {
        personalityType = 'low'
      } else if (percentage < 60) {
        personalityType = 'medium'
      } else {
        personalityType = 'high'
      }

      // Store the result with demographic info and section scores
      const answersWithDemographic = {
        answers,
        demographicInfo,
        sectionScores: Object.keys(sectionScores).length > 0 ? sectionScores : null,
      }

      const [result] = await db`
        INSERT INTO assessment_results (
          assessment_id,
          user_id,
          answers,
          score,
          personality_type
        )
        VALUES (
          ${id},
          ${userId},
          ${JSON.stringify(answersWithDemographic)},
          ${score},
          ${personalityType}
        )
        RETURNING *
      `

      logger.info(`Test submitted: User ${userId}, Test ${id}, Score: ${score}`)

      return {
        success: true,
        data: {
          id: result.id,
          score,
          maxScore,
          percentage: Math.round(percentage),
          personalityType,
          sectionScores: Object.keys(sectionScores).length > 0 ? sectionScores : null,
          completedAt: result.completed_at,
        },
      }
    } catch (error) {
      logger.error('Error submitting test:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to submit test',
      }
    }
  }, {
    body: t.Object({
      answers: t.Array(t.Any()),
      demographicInfo: t.Optional(t.Any()),
      userId: t.Optional(t.Number())
    }),
    detail: {
      tags: ['Tests'],
      summary: 'Submit test answers',
      description: 'Submit answers to a test and receive results with score and personality type'
    }
  })

  /**
   * GET /api/tests/:id/results
   * Get all results for a specific test (user's own results)
   */
  .get('/:id/results', async ({ params, query, set }) => {
    try {
      const db = getDatabase()
      const { id } = params
      const userId = parseInt(query.userId as string)

      if (!userId) {
        set.status = 401
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const results = await db`
        SELECT 
          id,
          assessment_id,
          score,
          personality_type,
          completed_at
        FROM assessment_results
        WHERE assessment_id = ${id} AND user_id = ${userId}
        ORDER BY completed_at DESC
      `

      return {
        success: true,
        data: results,
      }
    } catch (error) {
      logger.error('Error fetching test results:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to fetch test results',
      }
    }
  }, {
    detail: {
      tags: ['Tests'],
      summary: 'Get test results for user',
      description: 'Get all results for a specific test for the current user'
    }
  })

  /**
   * GET /api/tests/results/:resultId
   * Get a specific test result by ID
   */
  .get('/results/:resultId', async ({ params, query, set }) => {
    try {
      const db = getDatabase()
      const { resultId } = params
      const userId = parseInt(query.userId as string)

      if (!userId) {
        set.status = 401
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const [result] = await db`
        SELECT 
          ar.*,
          a.title,
          a.description
        FROM assessment_results ar
        JOIN assessments a ON ar.assessment_id = a.id
        WHERE ar.id = ${resultId} AND ar.user_id = ${userId}
      `

      if (!result) {
        set.status = 404
        return {
          success: false,
          error: 'Result not found',
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      logger.error('Error fetching test result:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to fetch test result',
      }
    }
  }, {
    detail: {
      tags: ['Tests'],
      summary: 'Get specific test result',
      description: 'Get detailed information about a specific test result by ID'
    }
  })

  /**
   * GET /api/tests/user/history
   * Get user's test history
   */
  .get('/user/history', async ({ query, set }) => {
    try {
      const db = getDatabase()
      const userId = parseInt(query.userId as string)

      if (!userId) {
        set.status = 401
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const results = await db`
        SELECT 
          ar.id,
          ar.score,
          ar.personality_type,
          ar.completed_at,
          a.id as assessment_id,
          a.title,
          a.description
        FROM assessment_results ar
        JOIN assessments a ON ar.assessment_id = a.id
        WHERE ar.user_id = ${userId}
        ORDER BY ar.completed_at DESC
      `

      return {
        success: true,
        data: results,
      }
    } catch (error) {
      logger.error('Error fetching user test history:', error)
      set.status = 500
      return {
        success: false,
        error: 'Failed to fetch test history',
      }
    }
  }, {
    detail: {
      tags: ['Tests'],
      summary: 'Get user test history',
      description: 'Get all tests taken by the user with results'
    }
  })
