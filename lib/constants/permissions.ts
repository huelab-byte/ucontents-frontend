/**
 * Permission slugs constants
 * 
 * These slugs must match the backend permission slugs created by module seeders.
 * Use these constants throughout the frontend to avoid typos and enable type safety.
 */

// Dashboard
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",

  // Files (general)
  VIEW_FILES: "view_files",
  UPLOAD_FILES: "upload_files",

  // Footage Library
  VIEW_FOOTAGE_LIBRARY: "view_footage_library",
  MANAGE_FOOTAGE_LIBRARY: "manage_footage_library",
  USE_FOOTAGE_LIBRARY: "use_footage_library",
  MANAGE_FOOTAGE_FOLDERS: "manage_footage_folders",
  VIEW_ALL_FOOTAGE: "view_all_footage",

  // Audio Library
  VIEW_AUDIO_LIBRARY: "view_audio_library",
  MANAGE_AUDIO_LIBRARY: "manage_audio_library",
  USE_AUDIO_LIBRARY: "use_audio_library",
  MANAGE_AUDIO_FOLDERS: "manage_audio_folders",
  VIEW_ALL_AUDIO: "view_all_audio",

  // Image Library
  VIEW_IMAGE_LIBRARY: "view_image_library",
  MANAGE_IMAGE_LIBRARY: "manage_image_library",
  USE_IMAGE_LIBRARY: "use_image_library",
  MANAGE_IMAGE_FOLDERS: "manage_image_folders",
  VIEW_ALL_IMAGE: "view_all_image",

  // BGM Library
  VIEW_BGM_LIBRARY: "view_bgm_library",
  MANAGE_BGM_LIBRARY: "manage_bgm_library",
  USE_BGM_LIBRARY: "use_bgm_library",
  MANAGE_BGM_FOLDERS: "manage_bgm_folders",
  VIEW_ALL_BGM: "view_all_bgm",
  VIEW_BGM: "view_bgm",
  MANAGE_BGM: "manage_bgm",

  // Video Overlay
  VIEW_VIDEO_OVERLAY: "view_video_overlay",
  MANAGE_VIDEO_OVERLAY: "manage_video_overlay",
  VIEW_VIDEO_OVERLAY_LIBRARY: "view_video_overlay_library",
  MANAGE_VIDEO_OVERLAY_LIBRARY: "manage_video_overlay_library",
  USE_VIDEO_OVERLAY: "use_video_overlay",
  MANAGE_VIDEO_OVERLAY_FOLDERS: "manage_video_overlay_folders",
  VIEW_ALL_VIDEO_OVERLAY: "view_all_video_overlay",

  // Image Overlay
  VIEW_IMAGE_OVERLAY: "view_image_overlay",
  MANAGE_IMAGE_OVERLAY: "manage_image_overlay",
  VIEW_IMAGE_OVERLAY_LIBRARY: "view_image_overlay_library",
  MANAGE_IMAGE_OVERLAY_LIBRARY: "manage_image_overlay_library",
  USE_IMAGE_OVERLAY: "use_image_overlay",
  MANAGE_IMAGE_OVERLAY_FOLDERS: "manage_image_overlay_folders",
  VIEW_ALL_IMAGE_OVERLAY: "view_all_image_overlay",

  // Support Tickets
  VIEW_ALL_TICKETS: "view_all_tickets",
  MANAGE_TICKETS: "manage_tickets",

  // Customer Management
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",

  // Plans
  VIEW_PLANS: "view_plans",
  MANAGE_PLANS: "manage_plans",

  // User Management
  VIEW_USERS: "view_users",
  MANAGE_USERS: "manage_users",

  // Roles
  VIEW_ROLES: "view_roles",
  MANAGE_ROLES: "manage_roles",

  // Permissions
  VIEW_PERMISSIONS: "view_permissions",
  MANAGE_PERMISSIONS: "manage_permissions",

  // General Settings
  VIEW_GENERAL_SETTINGS: "view_general_settings",
  MANAGE_GENERAL_SETTINGS: "manage_general_settings",

  // Auth Settings
  VIEW_AUTH_SETTINGS: "view_auth_settings",
  MANAGE_AUTH_SETTINGS: "manage_auth_settings",

  // Client Settings (API Clients)
  VIEW_CLIENTS: "view_clients",
  MANAGE_CLIENTS: "manage_clients",
  VIEW_API_CLIENTS: "view_api_clients",
  MANAGE_API_CLIENTS: "manage_api_clients",

  // Email Settings
  VIEW_EMAIL_CONFIG: "view_email_config",
  MANAGE_EMAIL_CONFIG: "manage_email_config",

  // AI Integration
  VIEW_AI_USAGE: "view_ai_usage",
  MANAGE_AI_API_KEYS: "manage_ai_api_keys",
  MANAGE_AI_PROVIDERS: "manage_ai_providers",

  // Storage Settings
  VIEW_STORAGE_CONFIG: "view_storage_config",
  MANAGE_STORAGE_CONFIG: "manage_storage_config",

  // Payment Gateway
  MANAGE_PAYMENT_GATEWAYS: "manage_payment_gateways",
  VIEW_ALL_INVOICES: "view_all_invoices",
  EDIT_INVOICES: "edit_invoices",

  // Logs
  VIEW_LOGS: "view_logs",
  MANAGE_LOGS: "manage_logs",

  // Social Connection
  MANAGE_SOCIAL_CONNECTION_PROVIDERS: "manage_social_connection_providers",

  // Notification Settings
  VIEW_NOTIFICATION_SETTINGS: "view_notification_settings",
  MANAGE_NOTIFICATION_SETTINGS: "manage_notification_settings",

  // Bulk Posting
  VIEW_BULK_POSTING_CAMPAIGNS: "view_bulk_posting_campaigns",
  MANAGE_BULK_POSTING_CAMPAIGNS: "manage_bulk_posting_campaigns",

  // Proxy Setup
  VIEW_PROXIES: "view_proxies",
  MANAGE_PROXIES: "manage_proxies",
} as const

export type PermissionSlug = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Permission groups for common use cases
 */
export const PERMISSION_GROUPS = {
  // Library - Admin view
  ADMIN_LIBRARY: [
    PERMISSIONS.VIEW_FILES,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.VIEW_FOOTAGE_LIBRARY,
    PERMISSIONS.MANAGE_FOOTAGE_LIBRARY,
    PERMISSIONS.VIEW_AUDIO_LIBRARY,
    PERMISSIONS.MANAGE_AUDIO_LIBRARY,
    PERMISSIONS.VIEW_IMAGE_LIBRARY,
    PERMISSIONS.MANAGE_IMAGE_LIBRARY,
  ],

  // Overlay - Admin view
  ADMIN_OVERLAY: [
    PERMISSIONS.VIEW_VIDEO_OVERLAY,
    PERMISSIONS.MANAGE_VIDEO_OVERLAY,
    PERMISSIONS.VIEW_BGM,
    PERMISSIONS.MANAGE_BGM,
    PERMISSIONS.VIEW_IMAGE_OVERLAY,
    PERMISSIONS.MANAGE_IMAGE_OVERLAY,
  ],

  // User Management
  USER_MANAGEMENT: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.MANAGE_PERMISSIONS,
  ],

  // All Settings
  ALL_SETTINGS: [
    PERMISSIONS.VIEW_GENERAL_SETTINGS,
    PERMISSIONS.MANAGE_GENERAL_SETTINGS,
    PERMISSIONS.VIEW_AUTH_SETTINGS,
    PERMISSIONS.MANAGE_AUTH_SETTINGS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_EMAIL_CONFIG,
    PERMISSIONS.MANAGE_EMAIL_CONFIG,
    PERMISSIONS.VIEW_AI_USAGE,
    PERMISSIONS.MANAGE_AI_API_KEYS,
    PERMISSIONS.MANAGE_AI_PROVIDERS,
    PERMISSIONS.VIEW_STORAGE_CONFIG,
    PERMISSIONS.MANAGE_STORAGE_CONFIG,
    PERMISSIONS.MANAGE_PAYMENT_GATEWAYS,
    PERMISSIONS.VIEW_ALL_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_LOGS,
    PERMISSIONS.MANAGE_SOCIAL_CONNECTION_PROVIDERS,
    PERMISSIONS.VIEW_NOTIFICATION_SETTINGS,
    PERMISSIONS.MANAGE_NOTIFICATION_SETTINGS,
  ],
} as const
