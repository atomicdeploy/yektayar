import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Permission = 
  | 'view_dashboard'
  | 'view_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_appointments'
  | 'edit_appointments'
  | 'view_messages'
  | 'view_courses'
  | 'edit_courses'
  | 'view_assessments'
  | 'edit_assessments'
  | 'view_pages'
  | 'edit_pages'
  | 'view_reports'
  | 'view_settings'
  | 'edit_settings'

export type Role = 'admin' | 'moderator' | 'psychologist' | 'user'

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_users',
    'edit_users',
    'delete_users',
    'view_appointments',
    'edit_appointments',
    'view_messages',
    'view_courses',
    'edit_courses',
    'view_assessments',
    'edit_assessments',
    'view_pages',
    'edit_pages',
    'view_reports',
    'view_settings',
    'edit_settings',
  ],
  moderator: [
    'view_dashboard',
    'view_users',
    'view_appointments',
    'view_messages',
    'view_courses',
    'view_assessments',
    'view_reports',
  ],
  psychologist: [
    'view_dashboard',
    'view_appointments',
    'edit_appointments',
    'view_messages',
    'view_courses',
    'view_assessments',
  ],
  user: [
    'view_dashboard',
  ],
}

export const usePermissionsStore = defineStore('permissions', () => {
  // State
  const userRole = ref<Role>('admin') // Default to admin for development
  const customPermissions = ref<Permission[]>([])

  // Computed
  const permissions = computed(() => {
    const basePermissions = rolePermissions[userRole.value] || []
    return [...new Set([...basePermissions, ...customPermissions.value])]
  })

  // Actions
  function setRole(role: Role): void {
    userRole.value = role
  }

  function addPermission(permission: Permission): void {
    if (!customPermissions.value.includes(permission)) {
      customPermissions.value.push(permission)
    }
  }

  function removePermission(permission: Permission): void {
    const index = customPermissions.value.indexOf(permission)
    if (index > -1) {
      customPermissions.value.splice(index, 1)
    }
  }

  function hasPermission(permission: Permission): boolean {
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(permissionList: Permission[]): boolean {
    return permissionList.some((p) => permissions.value.includes(p))
  }

  function hasAllPermissions(permissionList: Permission[]): boolean {
    return permissionList.every((p) => permissions.value.includes(p))
  }

  return {
    userRole,
    customPermissions,
    permissions,
    setRole,
    addPermission,
    removePermission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
})
