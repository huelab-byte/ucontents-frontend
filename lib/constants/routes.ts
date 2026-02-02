/**
 * Route constants for centralized route management
 * 
 * Use these constants throughout the frontend to avoid hardcoded route strings.
 * This improves maintainability and enables easy refactoring of routes.
 */

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  PROFILE: "/admin/profile",

  // Library
  FOOTAGE_LIBRARY: "/admin/footage-library",
  AUDIO_LIBRARY: "/admin/audio-library",
  IMAGE_LIBRARY: "/admin/image-library",

  // Overlay
  VIDEO_OVERLAY: "/admin/video-overlay",
  BGM_LIBRARY: "/admin/bgm-library",
  IMAGE_OVERLAY: "/admin/image-overlay",

  // Support
  SUPPORT: "/admin/support",
  SUPPORT_TICKET: (id: number | string) => `/admin/support/${id}`,

  // Customer Management
  CUSTOMERS: "/admin/customers",
  CUSTOMER_DETAIL: (id: number | string) => `/admin/customers/${id}`,

  // Plans
  PLANS: "/admin/plans",
  PLAN_EDIT: (id: number | string) => `/admin/plans/${id}/edit`,

  // User Management
  USERS: "/admin/users",
  USERS_LIST: "/admin/users/list",
  USERS_ROLES: "/admin/users/roles",
  USERS_PERMISSIONS: "/admin/users/permissions",

  // Settings
  SETTINGS: {
    GENERAL: "/admin/settings/general",
    SOCIAL_CONNECTION: "/admin/settings/social-connection",
    AUTH: "/admin/settings/auth",
    CLIENTS: "/admin/settings/clients",
    EMAIL: "/admin/settings/email",
    AI_INTEGRATION: "/admin/settings/ai-integration",
    PAYMENT_GATEWAY: "/admin/settings/payment-gateway",
    STORAGE: "/admin/settings/storage",
    NOTIFICATIONS: "/admin/settings/notifications",
    LOGS: "/admin/settings/logs",
  },
} as const

// Customer Routes
export const CUSTOMER_ROUTES = {
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SUBSCRIPTION: "/profile/subscription",
  USAGE: "/profile/usage",

  // Connection
  CONNECTION: "/connection",

  // Proxy Setup
  PROXY_SETUP: "/proxy-setup",

  // Automation
  BULK_POSTING: "/social-automation/bulk-posting",
  BULK_POSTING_DETAIL: (id: number | string) => `/social-automation/bulk-posting/${id}`,
  MANUAL_POSTING: "/social-automation/manual-posting",
  MANUAL_POSTING_DETAIL: (id: number | string) => `/social-automation/manual-posting/${id}`,

  // Content Generation
  MEDIA_UPLOAD: "/content-generation/media-upload",
  MEDIA_UPLOAD_DETAIL: (id: number | string) => `/content-generation/media-upload/${id}`,

  // Library
  LIBRARY: {
    FOOTAGE: "/library/footage",
    FOOTAGE_DETAIL: (id: number | string) => `/library/footage/${id}`,
    AUDIO: "/library/audio",
    AUDIO_DETAIL: (id: number | string) => `/library/audio/${id}`,
    IMAGES: "/library/images",
    IMAGE_DETAIL: (id: number | string) => `/library/images/${id}`,
    VIDEO_OVERLAYS: "/library/video-overlays",
    VIDEO_OVERLAY_DETAIL: (id: number | string) => `/library/video-overlays/${id}`,
    BGM: "/library/bgm",
    BGM_DETAIL: (id: number | string) => `/library/bgm/${id}`,
    IMAGE_OVERLAYS: "/library/image-overlays",
    IMAGE_OVERLAY_DETAIL: (id: number | string) => `/library/image-overlays/${id}`,
  },

  // Templates
  PROMPT_TEMPLATES: "/templates/prompt-templates",

  // Support
  SUPPORT_TICKETS: "/support/tickets",
  SUPPORT_TICKET_NEW: "/support/tickets/new",
  SUPPORT_TICKET_DETAIL: (id: number | string) => `/support/tickets/${id}`,
  TUTORIALS: "/support/tutorials",
  REPORT: "/support/report",
} as const

// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  SET_PASSWORD: "/set-password",
  VERIFY_EMAIL: "/verify-email",
  EMAIL_VERIFICATION_REQUIRED: "/email-verification-required",
  TWO_FA_SETUP: "/auth/2fa-setup",
  SOCIAL_CALLBACK: "/auth/social/callback",
} as const

// API Routes (for reference, not used in navigation)
export const API_ROUTES = {
  V1: {
    ADMIN: "/v1/admin",
    CUSTOMER: "/v1/customer",
    AUTH: "/v1/auth",
    PUBLIC: "/v1/public",
  },
} as const

// Helper type for route values
export type AdminRoute = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES]
export type CustomerRoute = (typeof CUSTOMER_ROUTES)[keyof typeof CUSTOMER_ROUTES]
export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES]
