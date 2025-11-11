import { Elysia } from 'elysia'

export const dashboardRoutes = new Elysia({ prefix: '/api/dashboard' })
  .get('/stats', async () => {
    // TODO: Fetch real stats from database
    return {
      success: true,
      data: {
        totalUsers: 1234,
        activeSessions: 42,
        totalAppointments: 567,
        pendingAppointments: 23,
      },
    }
  })
  .get('/user-growth', async () => {
    // TODO: Fetch real user growth data from database
    return {
      success: true,
      data: {
        labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
        data: [120, 190, 300, 500, 800, 1234],
      },
    }
  })
  .get('/appointment-stats', async () => {
    // TODO: Fetch real appointment stats from database
    return {
      success: true,
      data: {
        labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
        data: [12, 19, 15, 25, 22, 18, 8],
      },
    }
  })
  .get('/recent-activities', async () => {
    // TODO: Fetch real activities from database
    return {
      success: true,
      data: [
        {
          id: '1',
          type: 'user_registered',
          description: 'کاربر جدید ثبت‌نام کرد',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          type: 'appointment_created',
          description: 'نوبت جدید ایجاد شد',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          type: 'appointment_completed',
          description: 'نوبت تکمیل شد',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          id: '4',
          type: 'message_sent',
          description: 'پیام جدید ارسال شد',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        },
        {
          id: '5',
          type: 'user_registered',
          description: 'کاربر جدید ثبت‌نام کرد',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        },
      ],
    }
  })
