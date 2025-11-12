export default {
  // Common - shared across all apps
  common: {
    app_name: 'YektaYar',
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    add: 'Add',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },

  // Auth - authentication related
  auth: {
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    name: 'Name',
    login_title: 'Login to YektaYar',
    register_title: 'Register for YektaYar',
    send_otp: 'Send OTP',
    verify_otp: 'Verify OTP',
    forgot_password: 'Forgot Password',
  },

  // Navigation - shared navigation items
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    users: 'Users',
    chat: 'Chat',
    appointments: 'Appointments',
    messages: 'Messages',
    courses: 'Courses',
    reports: 'Reports',
    profile: 'Profile',
    settings: 'Settings',
  },

  // Dashboard - admin panel specific
  dashboard_page: {
    title: 'Admin Dashboard',
    welcome_message: 'Welcome to YektaYar Admin Panel',
    total_users: 'Total Users',
    active_sessions: 'Active Sessions',
    total_appointments: 'Total Appointments',
    pending_appointments: 'Pending Appointments',
    user_growth: 'User Growth',
    appointment_stats: 'Appointment Statistics',
    recent_activities: 'Recent Activities',
    system_status: 'System Status',
    no_activities: 'No activities found',
  },

  // Placeholder for unimplemented pages
  placeholder: {
    page_title: 'Page',
    coming_soon_message: 'This section is currently under development and will be available soon.',
    back_to_dashboard: 'Back to Dashboard',
  },

  // Users - user management
  users_page: {
    title: 'User Management',
    list_title: 'Users List',
    add_user: 'Add User',
    edit_user: 'Edit User',
    delete_user: 'Delete User',
    user_details: 'User Details',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    status: 'Status',
    created_at: 'Created At',
    actions: 'Actions',
    search_placeholder: 'Search users...',
    no_users: 'No users found',
  },

  // Roles
  roles: {
    admin: 'Admin',
    psychologist: 'Psychologist',
    user: 'User',
    moderator: 'Moderator',
  },

  // Status
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    blocked: 'Blocked',
  },

  // Theme
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },

  // Messages
  messages: {
    success: 'Operation completed successfully',
    error: 'An error occurred',
    confirm_delete: 'Are you sure you want to delete this item?',
    saved: 'Saved',
    loading: 'Loading...',
    no_messages: 'No messages',
    type_message: 'Type your message...',
    send: 'Send',
  },

  // Appointments
  appointments: {
    book: 'Book Appointment',
    upcoming: 'Upcoming Appointments',
    past: 'Past Appointments',
    no_appointments: 'No appointments',
  },

  // Error Screen - shared error screen component
  error_screen: {
    title: 'Configuration Error',
    api_config_error: 'API Configuration Error',
    cannot_start: 'Cannot start the application due to API configuration issues.',
    cannot_start_admin: 'Cannot start the admin panel due to API configuration issues.',
    api_url_missing: 'API_BASE_URL environment variable is not set. Please configure the API base URL.',
    details: 'Details',
    solution: 'Solution',
    show_solution: 'Show Solution',
    hide_solution: 'Hide Solution',
    fix_instruction: 'To fix this issue, you can run the following command in your terminal:',
    or: 'Or',
    manual_setup: 'Manually create a .env file in the project root with:',
    restart_note: 'After setting the environment variable, restart the development server.',
  },

  // App specific - admin panel
  admin_panel: 'Admin Panel',

  // App specific - mobile
  app_title: 'YektaYar',
}
