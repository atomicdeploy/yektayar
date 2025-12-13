import { Elysia } from 'elysia'
import { query, getDatabase } from '../services/database'
import { logger } from '@yektayar/shared'

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
      logger.error('Error fetching courses:', error)
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
      logger.error('Error creating course:', error)
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
      logger.error('Error fetching course:', error)
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
      logger.error('Error updating course:', error)
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
      logger.error('Error deleting course:', error)
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
      logger.error('Error enrolling in course:', error)
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
      logger.error('Error fetching assessments:', error)
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
      logger.error('Error submitting assessment:', error)
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
  // Course Modules
  .get('/:id/modules', async ({ params: { id } }) => {
    try {
      const db = getDatabase()
      const modules = await db`
        SELECT * FROM course_modules
        WHERE course_id = ${id}
        ORDER BY "order" ASC
      `

      return {
        success: true,
        data: modules
      }
    } catch (error) {
      logger.error('Error fetching course modules:', error)
      return {
        success: false,
        error: 'Failed to fetch modules',
        message: 'Could not retrieve course modules'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get course modules',
      description: 'Get all modules for a specific course'
    }
  })
  .post('/:id/modules', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { title, description, order } = body as any

      if (!title || order === undefined) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Title and order are required'
        }
      }

      const result = await db`
        INSERT INTO course_modules (course_id, title, description, "order")
        VALUES (${id}, ${title}, ${description || null}, ${order})
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Module created successfully'
      }
    } catch (error) {
      logger.error('Error creating module:', error)
      return {
        success: false,
        error: 'Failed to create module',
        message: 'Could not create module'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Create course module',
      description: 'Create a new module for a course (admin only)'
    }
  })
  .get('/modules/:moduleId/lessons', async ({ params: { moduleId } }) => {
    try {
      const db = getDatabase()
      const lessons = await db`
        SELECT * FROM course_lessons
        WHERE module_id = ${moduleId}
        ORDER BY "order" ASC
      `

      return {
        success: true,
        data: lessons
      }
    } catch (error) {
      logger.error('Error fetching lessons:', error)
      return {
        success: false,
        error: 'Failed to fetch lessons',
        message: 'Could not retrieve lessons'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get module lessons',
      description: 'Get all lessons for a specific module'
    }
  })
  .post('/modules/:moduleId/lessons', async ({ params: { moduleId }, body }) => {
    try {
      const db = getDatabase()
      const { title, description, content, contentType, mediaUrl, duration, order, isFree } = body as any

      if (!title || !content || !contentType || order === undefined) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'Title, content, contentType, and order are required'
        }
      }

      const result = await db`
        INSERT INTO course_lessons 
        (module_id, title, description, content, content_type, media_url, duration, "order", is_free)
        VALUES (${moduleId}, ${title}, ${description || null}, ${content}, ${contentType}, 
                ${mediaUrl || null}, ${duration || null}, ${order}, ${isFree !== undefined ? isFree : false})
        RETURNING *
      `

      return {
        success: true,
        data: result[0],
        message: 'Lesson created successfully'
      }
    } catch (error) {
      logger.error('Error creating lesson:', error)
      return {
        success: false,
        error: 'Failed to create lesson',
        message: 'Could not create lesson'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Create lesson',
      description: 'Create a new lesson in a module (admin only)'
    }
  })
  .get('/lessons/:lessonId', async ({ params: { lessonId } }) => {
    try {
      const db = getDatabase()
      const lessons = await db`
        SELECT cl.*, cm.course_id 
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cl.id = ${lessonId}
      `

      if (lessons.length === 0) {
        return {
          success: false,
          error: 'Lesson not found',
          message: `No lesson found with ID ${lessonId}`
        }
      }

      return {
        success: true,
        data: lessons[0]
      }
    } catch (error) {
      logger.error('Error fetching lesson:', error)
      return {
        success: false,
        error: 'Failed to fetch lesson',
        message: 'Could not retrieve lesson details'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get lesson details',
      description: 'Get detailed information about a specific lesson'
    }
  })
  .put('/lessons/:lessonId', async ({ params: { lessonId }, body }) => {
    try {
      const db = getDatabase()
      const updateData = body as any

      const allowedFields = ['title', 'description', 'content', 'content_type', 'media_url', 'duration', 'order', 'is_free']
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
      values.push(lessonId)

      const result = await db.unsafe(`
        UPDATE course_lessons
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `, values)

      if (result.length === 0) {
        return {
          success: false,
          error: 'Lesson not found',
          message: `No lesson found with ID ${lessonId}`
        }
      }

      return {
        success: true,
        data: result[0],
        message: 'Lesson updated successfully'
      }
    } catch (error) {
      logger.error('Error updating lesson:', error)
      return {
        success: false,
        error: 'Failed to update lesson',
        message: 'Could not update lesson'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Update lesson',
      description: 'Update lesson details (admin only)'
    }
  })
  .post('/:id/enroll/:userId/progress', async ({ params: { id, userId }, body }) => {
    try {
      const db = getDatabase()
      const { lessonId, completed, timeSpent, lastPosition } = body as any

      // Get enrollment
      const enrollments = await db`
        SELECT id FROM course_enrollments
        WHERE user_id = ${userId} AND course_id = ${id}
      `

      if (enrollments.length === 0) {
        return {
          success: false,
          error: 'Not enrolled',
          message: 'User is not enrolled in this course'
        }
      }

      const enrollmentId = enrollments[0].id

      // Check if progress exists
      const existing = await db`
        SELECT id FROM lesson_progress
        WHERE enrollment_id = ${enrollmentId} AND lesson_id = ${lessonId}
      `

      let result
      if (existing.length > 0) {
        // Update existing progress
        result = await db`
          UPDATE lesson_progress
          SET completed = ${completed !== undefined ? completed : false},
              time_spent = ${timeSpent || 0},
              last_position = ${lastPosition || null},
              completed_at = ${completed ? db`CURRENT_TIMESTAMP` : null}
          WHERE id = ${existing[0].id}
          RETURNING *
        `
      } else {
        // Create new progress
        result = await db`
          INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, time_spent, last_position)
          VALUES (${enrollmentId}, ${lessonId}, ${completed !== undefined ? completed : false}, 
                  ${timeSpent || 0}, ${lastPosition || null})
          RETURNING *
        `
      }

      // Update overall course progress
      const progressStats = await db`
        SELECT 
          COUNT(*) as total_lessons,
          COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.enrollment_id = ${enrollmentId}
        WHERE cm.course_id = ${id}
      `

      const totalLessons = parseInt(progressStats[0].total_lessons)
      const completedLessons = parseInt(progressStats[0].completed_lessons)
      const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      await db`
        UPDATE course_enrollments
        SET progress = ${overallProgress},
            completed = ${overallProgress === 100},
            completed_at = ${overallProgress === 100 ? db`CURRENT_TIMESTAMP` : null}
        WHERE id = ${enrollmentId}
      `

      return {
        success: true,
        data: {
          lessonProgress: result[0],
          overallProgress,
          completedLessons,
          totalLessons
        },
        message: 'Progress updated successfully'
      }
    } catch (error) {
      logger.error('Error updating progress:', error)
      return {
        success: false,
        error: 'Failed to update progress',
        message: 'Could not update lesson progress'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Update lesson progress',
      description: 'Update progress for a specific lesson'
    }
  })
  .get('/:id/enroll/:userId/progress', async ({ params: { id, userId } }) => {
    try {
      const db = getDatabase()

      // Get enrollment
      const enrollments = await db`
        SELECT * FROM course_enrollments
        WHERE user_id = ${userId} AND course_id = ${id}
      `

      if (enrollments.length === 0) {
        return {
          success: false,
          error: 'Not enrolled',
          message: 'User is not enrolled in this course'
        }
      }

      const enrollment = enrollments[0]

      // Get all lessons with progress
      const lessonsProgress = await db`
        SELECT 
          cl.id as lesson_id,
          cl.title as lesson_title,
          cl.order as lesson_order,
          cm.id as module_id,
          cm.title as module_title,
          cm.order as module_order,
          lp.completed,
          lp.time_spent,
          lp.last_position,
          lp.completed_at
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.enrollment_id = ${enrollment.id}
        WHERE cm.course_id = ${id}
        ORDER BY cm.order, cl.order
      `

      return {
        success: true,
        data: {
          enrollment,
          lessonsProgress
        }
      }
    } catch (error) {
      logger.error('Error fetching progress:', error)
      return {
        success: false,
        error: 'Failed to fetch progress',
        message: 'Could not retrieve course progress'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get course progress',
      description: 'Get detailed progress for a user in a course'
    }
  })
  .post('/:id/reviews', async ({ params: { id }, body }) => {
    try {
      const db = getDatabase()
      const { userId, rating, comment } = body as any

      if (!userId || !rating) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'User ID and rating are required'
        }
      }

      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'Invalid rating',
          message: 'Rating must be between 1 and 5'
        }
      }

      // Check if user is enrolled
      const enrollments = await db`
        SELECT id FROM course_enrollments
        WHERE user_id = ${userId} AND course_id = ${id}
      `

      if (enrollments.length === 0) {
        return {
          success: false,
          error: 'Not enrolled',
          message: 'You must be enrolled to leave a review'
        }
      }

      // Check if already reviewed
      const existing = await db`
        SELECT id FROM course_reviews
        WHERE user_id = ${userId} AND course_id = ${id}
      `

      let result
      if (existing.length > 0) {
        // Update existing review
        result = await db`
          UPDATE course_reviews
          SET rating = ${rating}, comment = ${comment || null}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existing[0].id}
          RETURNING *
        `
      } else {
        // Create new review
        result = await db`
          INSERT INTO course_reviews (course_id, user_id, rating, comment)
          VALUES (${id}, ${userId}, ${rating}, ${comment || null})
          RETURNING *
        `
      }

      return {
        success: true,
        data: result[0],
        message: 'Review submitted successfully'
      }
    } catch (error) {
      logger.error('Error submitting review:', error)
      return {
        success: false,
        error: 'Failed to submit review',
        message: 'Could not submit review'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Submit course review',
      description: 'Submit or update a review for a course'
    }
  })
  .get('/:id/reviews', async ({ params: { id }, query }) => {
    try {
      const db = getDatabase()
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 10
      const offset = (page - 1) * limit

      const [countResult, reviews] = await Promise.all([
        db`SELECT COUNT(*) FROM course_reviews WHERE course_id = ${id}`,
        db`
          SELECT cr.*, u.name as user_name, u.avatar as user_avatar
          FROM course_reviews cr
          JOIN users u ON cr.user_id = u.id
          WHERE cr.course_id = ${id}
          ORDER BY cr.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      ])

      const total = parseInt(countResult[0].count)

      // Calculate average rating
      const avgResult = await db`
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
        FROM course_reviews
        WHERE course_id = ${id}
      `

      return {
        success: true,
        data: {
          reviews,
          statistics: {
            averageRating: parseFloat(avgResult[0].avg_rating) || 0,
            totalReviews: parseInt(avgResult[0].total_reviews) || 0
          },
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      logger.error('Error fetching reviews:', error)
      return {
        success: false,
        error: 'Failed to fetch reviews',
        message: 'Could not retrieve course reviews'
      }
    }
  }, {
    detail: {
      tags: ['Courses'],
      summary: 'Get course reviews',
      description: 'Get all reviews for a course with statistics'
    }
  })
