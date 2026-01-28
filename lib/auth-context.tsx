"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api"
import type { LoginResponse, PublicAuthFeatures } from "@/lib/api"
import { apiClient } from "@/lib/api/client"

export type UserRole = "customer" | "admin" | "super_admin"

export interface Permission {
  id: number
  slug: string
  name: string
  description?: string
}

export interface Role {
  id: number
  slug: string
  name: string
  permissions?: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  roles?: Role[]
  permissions?: string[] // Flattened list of permission slugs for easy checking
  email_verified_at?: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  getAuthFeatures: () => Promise<PublicAuthFeatures | null>
  checkRole: (role: UserRole | UserRole[]) => boolean
  isAdmin: () => boolean
  isCustomer: () => boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  
  // Cache for auth features with TTL (5 minutes)
  const authFeaturesCacheRef = React.useRef<{
    data: PublicAuthFeatures | null
    timestamp: number
  }>({ data: null, timestamp: 0 })
  const AUTH_FEATURES_TTL = 5 * 60 * 1000 // 5 minutes

  // Initialize auth state from localStorage
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user and token are stored in localStorage
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("token")
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Helper function to normalize email_verified_at format
  const normalizeEmailVerifiedAt = (value: any): string | null => {
    if (!value) return null
    if (value === '' || value === 'null' || value === null) return null
    // If it's already a string (ISO date), return it
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
    // If it's a Date object, convert to ISO string
    if (value instanceof Date) {
      return value.toISOString()
    }
    return null
  }

  // Helper function to check if email is verified
  const isEmailVerified = (emailVerifiedAt: string | null | undefined): boolean => {
    const normalized = normalizeEmailVerifiedAt(emailVerifiedAt)
    return normalized !== null && normalized !== '' && normalized !== 'null'
  }

  /**
   * Get auth features with caching (5 minute TTL)
   * This prevents duplicate API calls from RouteGuard and login flow
   */
  const getAuthFeatures = React.useCallback(async (): Promise<PublicAuthFeatures | null> => {
    const now = Date.now()
    const cache = authFeaturesCacheRef.current
    
    // Return cached data if still valid
    if (cache.data && (now - cache.timestamp) < AUTH_FEATURES_TTL) {
      return cache.data
    }
    
    // Fetch fresh data
    try {
      const response = await authService.getAuthFeatures()
      if (response.success && response.data) {
        authFeaturesCacheRef.current = {
          data: response.data,
          timestamp: now,
        }
        return response.data
      }
    } catch (error) {
      // Return cached data even if expired, as fallback
      return cache.data
    }
    
    return null
  }, [])

  // Helper function to map backend user to frontend user format
  const mapBackendUserToFrontend = (backendUser: LoginResponse['user']): User => {
    // Extract role from roles array or use default
    let role: UserRole = "customer"
    const backendRoles = backendUser.roles || []
    const roleSlugs = backendRoles.map((r) => r.slug.toLowerCase())
    
    if (roleSlugs.includes("super_admin")) {
      role = "super_admin"
    } else if (roleSlugs.includes("admin")) {
      role = "admin"
    } else {
      role = "customer"
    }

    // Extract all permissions from roles
    const allPermissions = new Set<string>()
    backendRoles.forEach((r: any) => {
      if (r.permissions && Array.isArray(r.permissions)) {
        r.permissions.forEach((p: any) => {
          if (typeof p === 'string') {
            allPermissions.add(p)
          } else if (p?.slug) {
            allPermissions.add(p.slug)
          }
        })
      }
    })

    // Map roles with their permissions
    const mappedRoles: Role[] = backendRoles.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      permissions: r.permissions?.map((p: any) => ({
        id: p.id,
        slug: typeof p === 'string' ? p : p.slug,
        name: typeof p === 'string' ? p : p.name,
        description: p.description,
      })) || [],
    }))

    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      role,
      roles: mappedRoles,
      permissions: Array.from(allPermissions),
      email_verified_at: normalizeEmailVerifiedAt(backendUser.email_verified_at),
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      
      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed")
      }

      const loginData = response.data as any
      const { user: backendUser, token } = loginData

      // Check if 2FA setup is required
      if (loginData.requires_2fa_setup) {
        // Store user email and password temporarily for 2FA setup
        localStorage.setItem("pending_2fa_setup_email", email)
        localStorage.setItem("pending_2fa_setup_password", password)
        
        // Store temporary token if provided (allows access to 2FA setup endpoints)
        if (loginData.token) {
          localStorage.setItem("token", loginData.token)
          // Also store user data temporarily
          const frontendUser = mapBackendUserToFrontend(backendUser)
          localStorage.setItem("user", JSON.stringify(frontendUser))
          setUser(frontendUser)
        }
        
        router.push(`/auth/2fa-setup?email=${encodeURIComponent(email)}`)
        return
      }

      // Check if 2FA verification is required
      if (loginData.requires_2fa_verification) {
        // Store user email for OTP verification
        router.push(`/auth/otp?email=${encodeURIComponent(email)}`)
        return
      }

      // If no token, login is incomplete
      if (!token) {
        throw new Error("Login incomplete. Please try again.")
      }

      // Map backend user to frontend format
      const frontendUser = mapBackendUserToFrontend(backendUser)

      // Store token and user
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(frontendUser))
      // Clear auth_method flag for regular login (2FA may be required)
      localStorage.removeItem("auth_method")

      setUser(frontendUser)
      
      // Check if email verification is required and user is not verified
      const checkEmailVerification = async () => {
        try {
          const features = await getAuthFeatures()
          const emailVerificationEnabled = features?.email_verification?.enabled ?? false
          
          // Check if user is verified using normalized check
          const isVerified = isEmailVerified(frontendUser.email_verified_at)
          
          // If email verification is enabled and user is not verified, redirect to verification page
          if (emailVerificationEnabled && !isVerified) {
            router.push('/auth/email-verification-required')
            return
          }
          
          // User is verified or verification is not required - redirect based on role
          if (frontendUser.role === "admin" || frontendUser.role === "super_admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/dashboard")
          }
        } catch (error) {
          // On error, proceed with normal redirect
          if (frontendUser.role === "admin" || frontendUser.role === "super_admin") {
            router.push("/admin/dashboard")
          } else {
            router.push("/dashboard")
          }
        }
      }
      
      checkEmailVerification()
    } catch (error: any) {
      // Extract error message - API client interceptor returns { success: false, message: string }
      // Handle both Error objects and plain error objects from API client
      let errorMessage = "Login failed. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Refresh user data from backend (useful after email verification)
   */
  const refreshUser = async (): Promise<void> => {
    try {
      // Use profileService to get current user data
      const { profileService } = await import('@/lib/api')
      const response = await profileService.getProfile()
      
      if (response.success && response.data) {
        const backendUser = response.data
        const frontendUser = mapBackendUserToFrontend(backendUser)
        
        // Update localStorage and state
        localStorage.setItem("user", JSON.stringify(frontendUser))
        setUser(frontendUser)
      }
    } catch (error) {
    }
  }

  const logout = async () => {
    try {
      // Call logout API
      await authService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear local state regardless of API call result
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      localStorage.removeItem("auth_method") // Clear auth method flag
      router.push("/auth/login")
    }
  }

  const checkRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const rolesToCheck = Array.isArray(role) ? role : [role]
    return rolesToCheck.includes(user.role)
  }

  const isAdmin = (): boolean => {
    return user?.role === "admin" || user?.role === "super_admin" || false
  }

  const isCustomer = (): boolean => {
    return user?.role === "customer" || false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    getAuthFeatures,
    checkRole,
    isAdmin,
    isCustomer,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
