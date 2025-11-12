export default {
  // Common
  welcome: 'خوش آمدید به یکتایار',
  admin_panel: 'پنل مدیریت',
  dashboard: 'داشبورد',
  users: 'کاربران',
  settings: 'تنظیمات',
  logout: 'خروج',
  search: 'جستجو',
  filter: 'فیلتر',
  save: 'ذخیره',
  cancel: 'انصراف',
  edit: 'ویرایش',
  delete: 'حذف',
  add: 'افزودن',
  close: 'بستن',
  loading: 'در حال بارگذاری...',
  
  // Navigation
  nav: {
    dashboard: 'داشبورد',
    users: 'کاربران',
    appointments: 'نوبت‌ها',
    messages: 'پیام‌ها',
    courses: 'دوره‌ها',
    reports: 'گزارش‌ها',
    settings: 'تنظیمات',
  },
  
  // Dashboard
  dashboard_page: {
    title: 'داشبورد مدیریت',
    welcome_message: 'به پنل مدیریت یکتایار خوش آمدید',
    total_users: 'کل کاربران',
    active_sessions: 'نشست‌های فعال',
    total_appointments: 'کل نوبت‌ها',
    pending_appointments: 'نوبت‌های در انتظار',
    user_growth: 'رشد کاربران',
    appointment_stats: 'آمار نوبت‌ها',
    recent_activities: 'فعالیت‌های اخیر',
    system_status: 'وضعیت سیستم',
    no_activities: 'فعالیتی وجود ندارد',
  },
  
  // Users
  users_page: {
    title: 'مدیریت کاربران',
    list_title: 'لیست کاربران',
    add_user: 'افزودن کاربر',
    edit_user: 'ویرایش کاربر',
    delete_user: 'حذف کاربر',
    user_details: 'جزئیات کاربر',
    name: 'نام',
    email: 'ایمیل',
    phone: 'تلفن',
    role: 'نقش',
    status: 'وضعیت',
    created_at: 'تاریخ ثبت',
    actions: 'عملیات',
    search_placeholder: 'جستجوی کاربران...',
    no_users: 'کاربری یافت نشد',
  },
  
  // Roles
  roles: {
    admin: 'مدیر',
    psychologist: 'روانشناس',
    user: 'کاربر',
    moderator: 'ناظر',
  },
  
  // Status
  status: {
    active: 'فعال',
    inactive: 'غیرفعال',
    pending: 'در انتظار',
    blocked: 'مسدود',
  },
  
  // Theme
  theme: {
    light: 'روشن',
    dark: 'تیره',
    system: 'سیستم',
  },
  
  // Messages
  messages: {
    success: 'عملیات با موفقیت انجام شد',
    error: 'خطایی رخ داده است',
    confirm_delete: 'آیا از حذف این مورد اطمینان دارید؟',
    saved: 'ذخیره شد',
    loading: 'در حال بارگذاری...',
  },
  
  // Placeholder
  placeholder: {
    page_title: 'صفحه',
    coming_soon_message: 'این بخش در حال حاضر در دست توسعه است و به زودی در دسترس خواهد بود.',
    back_to_dashboard: 'بازگشت به داشبورد',
  },
  
  // Error Screen
  error_screen: {
    title: 'خطای پیکربندی',
    api_config_error: 'خطای پیکربندی API',
    cannot_start: 'امکان راه‌اندازی پنل مدیریت به دلیل مشکل در پیکربندی API وجود ندارد.',
    api_url_missing: 'متغیر محیطی API_BASE_URL تنظیم نشده است. لطفاً آدرس پایه API را پیکربندی کنید.',
    details: 'جزئیات',
    solution: 'راه‌حل',
    show_solution: 'نمایش راه‌حل',
    hide_solution: 'پنهان کردن راه‌حل',
    fix_instruction: 'برای رفع این مشکل، می‌توانید دستور زیر را در ترمینال اجرا کنید:',
    or: 'یا',
    manual_setup: 'به صورت دستی یک فایل .env در ریشه پروژه با محتوای زیر ایجاد کنید:',
    restart_note: 'پس از تنظیم متغیر محیطی، سرور توسعه را مجدداً راه‌اندازی کنید.',
  },
}
