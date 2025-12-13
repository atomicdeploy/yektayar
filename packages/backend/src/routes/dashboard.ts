import { Elysia } from 'elysia'
import { getDatabase } from '../services/database'

export const dashboardRoutes = new Elysia({ prefix: '/api/dashboard' })
  .get('/stats', async () => {
    try {
      const db = getDatabase()
      
      // Get total users count
      const usersCount = await db`SELECT COUNT(*) as count FROM users`
      
      // Get active sessions count (sessions that haven't expired and were active in last 24 hours)
      const activeSessions = await db`
        SELECT COUNT(*) as count FROM sessions 
        WHERE expires_at > NOW() 
        AND last_activity_at > NOW() - INTERVAL '24 hours'
      `
      
      // Get total appointments count
      const appointmentsCount = await db`SELECT COUNT(*) as count FROM appointments`
      
      // Get pending appointments count
      const pendingAppointments = await db`
        SELECT COUNT(*) as count FROM appointments 
        WHERE status = 'pending'
      `
      
      return {
        success: true,
        data: {
          totalUsers: parseInt(usersCount[0].count),
          activeSessions: parseInt(activeSessions[0].count),
          totalAppointments: parseInt(appointmentsCount[0].count),
          pendingAppointments: parseInt(pendingAppointments[0].count),
        },
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: 'Could not retrieve dashboard statistics from database'
      }
    }
  })
  .get('/user-growth', async () => {
    try {
      const db = getDatabase()
      
      // Get user count by month for the last 6 months
      const growth = await db`
        SELECT 
          TO_CHAR(created_at, 'TMMonth') as month,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'TMMonth')
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `
      
      // If no data, return empty arrays
      if (growth.length === 0) {
        return {
          success: true,
          data: {
            labels: [],
            data: [],
          },
        }
      }
      
      const labels = growth.map((row: any) => row.month.trim())
      const data = growth.map((row: any) => parseInt(row.count))
      
      return {
        success: true,
        data: {
          labels,
          data,
        },
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error)
      return {
        success: false,
        error: 'Failed to fetch user growth data',
        message: 'Could not retrieve user growth statistics from database'
      }
    }
  })
  .get('/appointment-stats', async () => {
    try {
      const db = getDatabase()
      
      // Get appointment count by day of week for the last 30 days
      const stats = await db`
        SELECT 
          CASE EXTRACT(DOW FROM scheduled_at)
            WHEN 0 THEN 'یکشنبه'
            WHEN 1 THEN 'دوشنبه'
            WHEN 2 THEN 'سه‌شنبه'
            WHEN 3 THEN 'چهارشنبه'
            WHEN 4 THEN 'پنجشنبه'
            WHEN 5 THEN 'جمعه'
            WHEN 6 THEN 'شنبه'
          END as day,
          EXTRACT(DOW FROM scheduled_at) as dow,
          COUNT(*) as count
        FROM appointments
        WHERE scheduled_at >= NOW() - INTERVAL '30 days'
        GROUP BY EXTRACT(DOW FROM scheduled_at)
        ORDER BY dow ASC
      `
      
      // Create array for all days of week, filling missing days with 0
      const daysMap = new Map<number, number>()
      stats.forEach((row: any) => {
        daysMap.set(parseInt(row.dow), parseInt(row.count))
      })
      
      const labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
      const data = [6, 0, 1, 2, 3, 4, 5].map(dow => daysMap.get(dow) || 0)
      
      return {
        success: true,
        data: {
          labels,
          data,
        },
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error)
      return {
        success: false,
        error: 'Failed to fetch appointment statistics',
        message: 'Could not retrieve appointment statistics from database'
      }
    }
  })
  .get('/recent-activities', async () => {
    try {
      const db = getDatabase()
      
      // Create a union of recent activities from different sources
      const activities = await db`
        SELECT * FROM (
          -- Recent user registrations
          SELECT 
            CONCAT('user_', id) as id,
            'user_registered' as type,
            CONCAT('کاربر ', name, ' ثبت‌نام کرد') as description,
            created_at as timestamp,
            id as user_id
          FROM users
          ORDER BY created_at DESC
          LIMIT 5
          
          UNION ALL
          
          -- Recent appointments
          SELECT 
            CONCAT('appointment_', id) as id,
            CASE 
              WHEN status = 'pending' THEN 'appointment_created'
              WHEN status = 'completed' THEN 'appointment_completed'
              WHEN status = 'cancelled' THEN 'appointment_cancelled'
              ELSE 'appointment_updated'
            END as type,
            CASE 
              WHEN status = 'pending' THEN 'نوبت جدید ایجاد شد'
              WHEN status = 'completed' THEN 'نوبت تکمیل شد'
              WHEN status = 'cancelled' THEN 'نوبت لغو شد'
              ELSE 'نوبت به‌روزرسانی شد'
            END as description,
            GREATEST(created_at, updated_at) as timestamp,
            patient_id as user_id
          FROM appointments
          ORDER BY GREATEST(created_at, updated_at) DESC
          LIMIT 5
          
          UNION ALL
          
          -- Recent messages
          SELECT 
            CONCAT('message_', id) as id,
            'message_sent' as type,
            'پیام جدید ارسال شد' as description,
            created_at as timestamp,
            sender_id as user_id
          FROM messages
          ORDER BY created_at DESC
          LIMIT 5
        ) combined
        ORDER BY timestamp DESC
        LIMIT 10
      `
      
      return {
        success: true,
        data: activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp.toISOString(),
          userId: activity.user_id,
        })),
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return {
        success: false,
        error: 'Failed to fetch recent activities',
        message: 'Could not retrieve recent activities from database'
      }
    }
  })
