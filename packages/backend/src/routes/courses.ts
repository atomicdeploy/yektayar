import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'

export const courseRoutes = new Elysia({ prefix: '/api/courses' })
  .get('/', async ({ query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit
      const category = query.category as string || undefined
      const difficulty = query.difficulty as string || undefined

      let countQuery
      let coursesQuery

      if (category && difficulty) {
        countQuery = db`
          SELECT COUNT(*) FROM courses 
          WHERE is_published = true AND category = ${category} AND difficulty = ${difficulty}
        `
        coursesQuery = db`
          SELECT * FROM courses
          WHERE is_published = true AND category = ${category} AND difficulty = ${difficulty}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (category) {
        countQuery = db`
          SELECT COUNT(*) FROM courses 
          WHERE is_published = true AND category = ${category}
        `
        coursesQuery = db`
          SELECT * FROM courses
          WHERE is_published = true AND category = ${category}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (difficulty) {
        countQuery = db`
          SELECT COUNT(*) FROM courses 
          WHERE is_published = true AND difficulty = ${difficulty}
        `
        coursesQuery = db`
          SELECT * FROM courses
          WHERE is_published = true AND difficulty = ${difficulty}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        countQuery = db`SELECT COUNT(*) FROM courses WHERE is_published = true`
        coursesQuery = db`
          SELECT * FROM courses
          WHERE is_published = true
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }

      const [countResult, courses] = await Promise.all([countQuery, coursesQuery])
      const total = parseInt(countResult[0].count)

      // Get enrollment count for each course
      for (const course of courses) {
        const enrollmentCount = await db`
          SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = ${course.id}
        `
        course.enrollment_count = parseInt(enrollmentCount[0].count)
      }

      return {
        success: true,
        data: courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      return {
        success: false,
        error: 'Failed to fetch courses',
        message: 'Could not retrieve course list'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'List courses',
      description: 'Get paginated list of published courses with optional filters',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'difficulty', in: 'query', schema: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] } }
      ]
    }
  })
  .post('/', async ({ body }) => {
    try {
      const db = getDatabase()
      const { title, description, category, duration, difficulty = 'beginner', thumbnailUrl, isPublished = true } = body as any

      if (!title || !description || !category || !duration) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Title, description, category, and duration are required'
        }
      }

      const result = await db`
        INSERT INTO courses (title, description, category, duration, difficulty, thumbnail_url, is_published)
        VALUES (${title}, ${description}, ${category}, ${duration}, ${difficulty}, ${thumbnailUrl || null}, ${isPublished})
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Course created successfully'
      }
    } catch (error) {
      console.error('Error creating course:', error)
      return {
        success: false,
        error: 'Failed to create course',
        message: 'Could not create course'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Create course',
      description: 'Create a new course (admin only)'
    }
  })
  .get('/:id', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      const courses = await db`
        SELECT * FROM courses WHERE id = ${id}
      `

      if (courses.length === 0) {
        return {
          success: false,
          error: 'Course not found',
          message: `No course found with ID ${id}`
        }
      }

      const course = courses[0]

      // Get enrollment statistics
      const enrollmentStats = await db`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_count,
          AVG(progress) as average_progress
        FROM course_enrollments
        WHERE course_id = ${id}
      `
      course.stats = enrollmentStats[0]

      return {
        success: true,
        data: course
      }
    } catch (error) {
      console.error('Error fetching course:', error)
      return {
        success: false,
        error: 'Failed to fetch course',
        message: 'Could not retrieve course details'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get course details',
      description: 'Retrieve detailed information about a specific course'
    }
  })
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const updateData = body as any

      const allowedFields = ['title', 'description', 'category', 'duration', 'difficulty', 'thumbnail_url', 'is_published']
      const updates: string[] = []
      const values: any[] = []

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${values.length + 1}`)
          values.push(updateData[field])
        }
      }

      if (updates.length === 0) {
        return {
          success: false,
          error: 'No valid fields to update',
          message: 'Please provide at least one field to update'
        }
      }

      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      const result = await db.unsafe(`
        UPDATE courses
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `, values)

      if (result.length === 0) {
        return {
          success: false,
          error: 'Course not found',
          message: `No course found with ID ${id}`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Course updated successfully'
      }
    } catch (error) {
      console.error('Error updating course:', error)
      return {
        success: false,
        error: 'Failed to update course',
        message: 'Could not update course'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Update course',
      description: 'Update course details (admin only)'
    }
  })
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      const result = await db`
        DELETE FROM courses
        WHERE id = ${id}
        RETURNING id
      `

      if (result.length === 0) {
        return {
          success: false,
          error: 'Course not found',
          message: `No course found with ID ${id}`
        }
      }

      return {
        success: true,
        message: 'Course deleted successfully'
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      return {
        success: false,
        error: 'Failed to delete course',
        message: 'Could not delete course'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Delete course',
      description: 'Delete a course (admin only)'
    }
  })
  .post('/:id/enroll', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { userId } = body as any

      if (!userId) {
        return {
          success: false,
          error: 'Missing user ID',
          message: 'User ID is required to enroll in a course'
        }
      }

      // Check if course exists
      const courses = await db`
        SELECT id FROM courses WHERE id = ${id} AND is_published = true
      `

      if (courses.length === 0) {
        return {
          success: false,
          error: 'Course not found',
          message: 'Course not found or not available'
        }
      }

      // Check if already enrolled
      const existing = await db`
        SELECT id FROM course_enrollments 
        WHERE user_id = ${userId} AND course_id = ${id}
      `

      if (existing.length > 0) {
        return {
          success: false,
          error: 'Already enrolled',
          message: 'User is already enrolled in this course'
        }
      }

      // Enroll user
      const result = await db`
        INSERT INTO course_enrollments (user_id, course_id, progress, completed)
        VALUES (${userId}, ${id}, 0, false)
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Successfully enrolled in course'
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      return {
        success: false,
        error: 'Failed to enroll',
        message: 'Could not enroll in course'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Enroll in course',
      description: 'Enroll a user in a course'
    }
  })
  .get('/assessments', async ({ query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit

      const countQuery = db`SELECT COUNT(*) FROM assessments`
      const assessmentsQuery = db`
        SELECT id, title, description, created_at, updated_at
        FROM assessments
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const [countResult, assessments] = await Promise.all([countQuery, assessmentsQuery])
      const total = parseInt(countResult[0].count)

      return {
        success: true,
        data: assessments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
      return {
        success: false,
        error: 'Failed to fetch assessments',
        message: 'Could not retrieve assessment list'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'List assessments',
      description: 'Get list of available psychological assessments',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ]
    }
  })
  .post('/assessments/:id/submit', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { userId, answers } = body as any

      if (!userId || !answers) {
        return {
          success: false,
          error: 'Missing required data',
          message: 'User ID and answers are required'
        }
      }

      // Check if assessment exists
      const assessments = await db`
        SELECT id, questions FROM assessments WHERE id = ${id}
      `

      if (assessments.length === 0) {
        return {
          success: false,
          error: 'Assessment not found',
          message: `No assessment found with ID ${id}`
        }
      }

      // Calculate score (simple implementation)
      const score = Object.keys(answers).length

      // Save result
      const result = await db`
        INSERT INTO assessment_results (assessment_id, user_id, answers, score)
        VALUES (${id}, ${userId}, ${JSON.stringify(answers)}, ${score})
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Assessment submitted successfully'
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      return {
        success: false,
        error: 'Failed to submit assessment',
        message: 'Could not submit assessment'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Submit assessment',
      description: 'Submit answers for a psychological assessment'
    }
  })
