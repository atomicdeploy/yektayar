export default {
  // Common - مشترک در همه برنامه‌ها
  common: {
    app_name: 'یکتایار',
    welcome: 'خوش آمدید',
    login: 'ورود',
    register: 'ثبت‌نام',
    logout: 'خروج',
    submit: 'ارسال',
    cancel: 'انصراف',
    save: 'ذخیره',
    delete: 'حذف',
    edit: 'ویرایش',
    search: 'جستجو',
    filter: 'فیلتر',
    add: 'افزودن',
    close: 'بستن',
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    success: 'موفقیت‌آمیز',
  },

  // Auth - احراز هویت
  auth: {
    email: 'ایمیل',
    phone: 'شماره تلفن',
    password: 'رمز عبور',
    name: 'نام',
    login_title: 'ورود به یکتایار',
    register_title: 'ثبت‌نام در یکتایار',
    send_otp: 'ارسال کد تأیید',
    verify_otp: 'تأیید کد',
    forgot_password: 'فراموشی رمز عبور',
  },

  // Navigation - منوی ناوبری مشترک
  nav: {
    home: 'خانه',
    dashboard: 'داشبورد',
    users: 'کاربران',
    chat: 'گفتگو',
    appointments: 'نوبت‌ها',
    messages: 'پیام‌ها',
    courses: 'دوره‌ها',
    reports: 'گزارش‌ها',
    profile: 'پروفایل',
    settings: 'تنظیمات',
  },

  // Dashboard - مخصوص پنل مدیریت
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

  // Placeholder برای صفحات در حال توسعه
  placeholder: {
    page_title: 'صفحه',
    coming_soon_message: 'این بخش در حال حاضر در دست توسعه است و به زودی در دسترس خواهد بود.',
    back_to_dashboard: 'بازگشت به داشبورد',
  },

  // Users - مدیریت کاربران
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

  // Roles - نقش‌ها
  roles: {
    admin: 'مدیر',
    psychologist: 'روانشناس',
    user: 'کاربر',
    moderator: 'ناظر',
  },

  // Status - وضعیت‌ها
  status: {
    active: 'فعال',
    inactive: 'غیرفعال',
    pending: 'در انتظار',
    blocked: 'مسدود',
  },

  // Theme - تم
  theme: {
    light: 'روشن',
    dark: 'تیره',
    system: 'سیستم',
  },

  // Messages - پیام‌ها
  messages: {
    success: 'عملیات با موفقیت انجام شد',
    error: 'خطایی رخ داده است',
    confirm_delete: 'آیا از حذف این مورد اطمینان دارید؟',
    saved: 'ذخیره شد',
    loading: 'در حال بارگذاری...',
    no_messages: 'پیامی وجود ندارد',
    type_message: 'پیام خود را بنویسید...',
    send: 'ارسال',
  },

  // Appointments - نوبت‌دهی
  appointments: {
    book: 'رزرو نوبت',
    upcoming: 'نوبت‌های آینده',
    past: 'نوبت‌های گذشته',
    no_appointments: 'نوبتی وجود ندارد',
  },

  // Error Screen - صفحه خطا مشترک
  error_screen: {
    title: 'خطای پیکربندی',
    api_config_error: 'خطای پیکربندی API',
    cannot_start: 'امکان راه‌اندازی برنامه به دلیل مشکل در پیکربندی API وجود ندارد.',
    cannot_start_admin: 'امکان راه‌اندازی پنل مدیریت به دلیل مشکل در پیکربندی API وجود ندارد.',
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

  // App specific - پنل مدیریت
  admin_panel: 'پنل مدیریت',

  // App specific - موبایل
  app_title: 'یکتایار',
}
