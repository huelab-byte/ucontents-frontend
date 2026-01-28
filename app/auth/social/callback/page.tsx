"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api/client"

/**
 * OAuth Social Authentication Callback Page
 * 
 * This page handles the OAuth callback from the backend.
 * The backend redirects here after processing the OAuth code exchange.
 * 
 * Flow:
 * 1. User clicks social login → Backend redirects to OAuth provider
 * 2. OAuth provider redirects to backend API callback
 * 3. Backend processes and redirects here with token
 * 4. This page sets up authentication and redirects to dashboard
 */
function SocialAuthCallbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL (set by backend after OAuth processing)
        const token = searchParams.get("token")
        const errorParam = searchParams.get("error")

        // Handle errors from backend
        if (errorParam) {
          setError(decodeURIComponent(errorParam))
          setTimeout(() => {
            router.replace("/auth/login?error=" + encodeURIComponent(errorParam))
          }, 2000)
          return
        }

        if (!token) {
          setError("No authentication token received")
          setTimeout(() => {
            router.replace("/auth/login?error=" + encodeURIComponent("Authentication failed"))
          }, 2000)
          return
        }

        // Set auth_method flag (skip 2FA for social auth)
        localStorage.setItem("auth_method", "social_auth")

        // Store token
        localStorage.setItem("token", token)

        // Set auth header for future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Refresh user data to get role and user info
        await refreshUser()

        // Get user from localStorage to determine redirect
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            const redirectUrl = user.role === "admin" || user.role === "super_admin"
              ? "/admin/dashboard"
              : "/dashboard"
            
            // Redirect to appropriate dashboard
            router.replace(redirectUrl)
          } catch (parseError) {
            // If parsing fails, redirect to customer dashboard
            router.replace("/dashboard")
          }
        } else {
          // If no user data, redirect to customer dashboard
          router.replace("/dashboard")
        }
      } catch (err: any) {
        setError(err.message || "Failed to complete authentication")
        setTimeout(() => {
          router.replace("/auth/login?error=" + encodeURIComponent(err.message || "Authentication failed"))
        }, 2000)
      }
    }

    handleCallback()
  }, [searchParams, router, refreshUser])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Authentication Error</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function SocialAuthCallbackPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SocialAuthCallbackPageContent />
    </React.Suspense>
  )
}
