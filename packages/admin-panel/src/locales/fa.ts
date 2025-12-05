export default {
  // Common
  app_title: 'یکتایار',
  tagline: 'پلتفرم مراقبت سلامت روان',
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
    assessments: 'آزمون‌ها',
    pages: 'صفحات',
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
  
  // Placeholder for unimplemented pages
  placeholder: {
    page_title: 'صفحه',
    coming_soon_message: 'این بخش در حال حاضر در دست توسعه است و به زودی در دسترس خواهد بود.',
    back_to_dashboard: 'بازگشت به داشبورد',
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
  
  // View Mode
  view_mode: {
    card_view: 'نمایش کارتی',
    table_view: 'نمایش جدولی',
  },
  
  // Messages
  messages: {
    success: 'عملیات با موفقیت انجام شد',
    error: 'خطایی رخ داده است',
    confirm_delete: 'آیا از حذف این مورد اطمینان دارید؟',
    saved: 'ذخیره شد',
    loading: 'در حال بارگذاری...',
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
    
    // Network error solutions
    network_solution_1: 'سرور API به نظر می‌رسد غیرفعال یا در دسترس نیست. لطفاً موارد زیر را بررسی کنید:',
    network_step_1: 'مطمئن شوید که سرور API در حال اجرا است (بررسی کنید که روی پورت پیکربندی‌شده در حال گوش دادن باشد)',
    network_step_2: 'تنظیمات فایروال خود را بررسی کنید تا مطمئن شوید اتصال را مسدود نمی‌کند',
    network_step_3: 'اطمینان حاصل کنید که API_BASE_URL در فایل .env با آدرس واقعی سرور مطابقت دارد',
    network_step_4: 'در صورت استفاده از Docker یا VM، اتصال شبکه بین کانتینرها/ماشین‌ها را بررسی کنید',
    
    // CORS error solutions
    cors_solution_1: 'سرور API باید برای پذیرش درخواست‌ها از این برنامه پیکربندی شود. موارد زیر را به فایل .env بک‌اند اضافه کنید:',
    cors_solution_2: 'مطمئن شوید که URL دقیق مبدأ (شامل پورت) که این برنامه روی آن اجرا می‌شود را وارد کرده‌اید، سپس سرور بک‌اند را مجدداً راه‌اندازی کنید.',
    
    // SSL error solutions
    ssl_solution_1: 'مشکلی در گواهی SSL/TLS وجود دارد. این راه‌حل‌ها را امتحان کنید:',
    ssl_step_1: 'در صورت استفاده از HTTPS در محیط توسعه، از HTTP استفاده کنید یا یک گواهی SSL معتبر نصب کنید',
    ssl_step_2: 'بررسی کنید که گواهی‌های ریشه سیستم شما به‌روز هستند',
    ssl_step_3: 'برای گواهی‌های خودامضا، آنها را به مخزن گواهی‌های قابل اعتماد خود اضافه کنید',
    
    // Timeout error solutions
    timeout_solution_1: 'اتصال به سرور API با وقفه زمانی مواجه شد. لطفاً موارد زیر را بررسی کنید:',
    timeout_step_1: 'بررسی کنید که سرور API در حال اجرا و پاسخگویی است (ممکن است بارگذاری زیاد یا در حال راه‌اندازی باشد)',
    timeout_step_2: 'اتصال شبکه و تأخیر خود به سرور را بررسی کنید',
    timeout_step_3: 'در صورت استفاده از شبکه کند، سرور ممکن است به زمان بیشتری برای پاسخ نیاز داشته باشد',
    
    // DNS error solutions
    dns_solution_1: 'نمی‌توان نام میزبان سرور را حل کرد. این راه‌حل‌ها را امتحان کنید:',
    dns_step_1: 'نام میزبان در API_BASE_URL را بررسی کنید که صحیح باشد',
    dns_step_2: 'تنظیمات DNS خود را بررسی کنید یا به جای نام میزبان از آدرس IP استفاده کنید',
    dns_step_3: 'در صورتی که سرور از راه دور است، اطمینان حاصل کنید که اتصال اینترنت دارید',
    
    // Server error solutions
    server_solution_1: 'سرور API یک خطا برگرداند. لطفاً موارد زیر را بررسی کنید:',
    server_step_1: 'لاگ‌های سرور بک‌اند را برای جزئیات خطا بررسی کنید',
    server_step_2: 'اطمینان حاصل کنید که endpoint مسیر /health به درستی در بک‌اند پیکربندی شده است',
    
    // Unknown error solutions
    unknown_solution_1: 'یک خطای غیرمنتظره رخ داده است. این مراحل عیب‌یابی عمومی را امتحان کنید:',
    unknown_step_1: 'کنسول مرورگر را برای پیام‌های خطای دقیق بررسی کنید',
    unknown_step_2: 'بررسی کنید که همه متغیرهای محیطی به درستی پیکربندی شده‌اند',
    unknown_step_3: 'سعی کنید هم سرور فرانت‌اند و هم بک‌اند را مجدداً راه‌اندازی کنید',
  },
}
