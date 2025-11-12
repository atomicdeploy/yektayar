export default {
  // Common
  welcome: 'Welcome to YektaYar',
  admin_panel: 'Admin Panel',
  dashboard: 'Dashboard',
  users: 'Users',
  settings: 'Settings',
  logout: 'Logout',
  search: 'Search',
  filter: 'Filter',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  close: 'Close',
  loading: 'Loading...',
  
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    users: 'Users',
    appointments: 'Appointments',
    messages: 'Messages',
    courses: 'Courses',
    reports: 'Reports',
    settings: 'Settings',
  },
  
  // Dashboard
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
  },
  
  // Users
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
  },
  
  // Error Screen
  error_screen: {
    title: 'Configuration Error',
    api_config_error: 'API Configuration Error',
    cannot_start: 'Cannot start the admin panel due to API configuration issues.',
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
}
