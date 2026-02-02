"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { socialConnectionService, type SocialProvider } from "@/lib/api"
import { toast } from "@/lib/toast"

/**
 * Social Connection OAuth callback (connect channel: Facebook, Instagram, YouTube, TikTok).
 * This is NOT social login — it uses SocialConnection module exchange-code only.
 */

/** Map /app/{platform}/{type} path to backend provider (meta | google | tiktok) */
const PATH_TO_PROVIDER: Record<string, SocialProvider> = {
  "tiktok/profile": "tiktok",
  "youtube/channel": "google",
  "facebook/profile": "meta",
  "facebook/page": "meta",
  "instagram/profile": "meta",
}

/** Normalize origin: remove www. to match backend callback URL and avoid redirect_uri_mismatch */
function normalizeOrigin(origin: string): string {
  return origin.replace(/^(https?:\/\/)www\./i, "$1")
}

/** OAuth codes are single-use. Prevent duplicate exchange (e.g. React Strict Mode double-mount). */
const exchangedCodes = new Set<string>()
const redirectUrlByCode = new Map<string, string>()

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const pathSegments = params?.path as string[] | undefined
  const path = Array.isArray(pathSegments) ? pathSegments.join("/") : ""
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const [status, setStatus] = React.useState<"loading" | "done" | "error">("loading")
  const [message, setMessage] = React.useState<string>("")

  // Use ref to prevent double exchange in StrictMode (effect runs twice synchronously)
  const exchangeStartedRef = React.useRef(false)

  React.useEffect(() => {
    if (!code || !state) {
      setStatus("error")
      setMessage("Missing code or state from OAuth redirect")
      return
    }

    const provider = path ? PATH_TO_PROVIDER[path] : undefined
    if (!provider) {
      setStatus("error")
      setMessage("Invalid callback path")
      return
    }

    // Check both Set (cross-render) and ref (same render cycle in StrictMode)
    // If exchange is already in progress, just return - the first effect will handle redirect
    if (exchangeStartedRef.current) {
      // StrictMode second call - exchange in progress, do nothing
      return
    }
    if (exchangedCodes.has(code)) {
      // Already exchanged in a previous render - redirect if URL available
      const stored = redirectUrlByCode.get(code)
      if (stored) {
        setStatus("done")
        window.location.href = stored
      }
      // If no stored URL, the redirect already happened or is happening
      return
    }

    // Mark as started immediately (sync) to prevent StrictMode double-call
    exchangeStartedRef.current = true
    exchangedCodes.add(code)

    const origin =
      typeof window !== "undefined" ? window.location.origin : ""
    const redirectUri = origin ? normalizeOrigin(origin) + "/app/" + path : ""

    // Track if component is still mounted for state updates
    let isMounted = true

    function handleError(msg: string) {
      if (!isMounted) return
      setStatus("error")
      setMessage(msg)
      toast.error("Connection failed")
    }

    function doRedirect(url: string) {
      // Store for potential re-renders
      if (code) redirectUrlByCode.set(code, url)
      // Update state only if mounted (avoid React warning)
      if (isMounted) setStatus("done")
      // Navigate - this works even if component unmounts
      window.location.href = url
    }

    socialConnectionService
      .exchangeCode(provider, { code, state, redirect_uri: redirectUri })
      .then((res) => {
        const data = res?.data
        const redirectUrl = data?.redirect_url
        if (res?.success && redirectUrl) {
          doRedirect(redirectUrl)
          return
        }
        if (res?.success && !redirectUrl) {
          doRedirect("/connection")
          return
        }
        handleError(res?.message || "Exchange failed")
      })
      .catch((err) => {
        console.error("Social Connection exchange failed:", err)
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Connection failed. Please try again."
        handleError(typeof msg === "string" ? msg : "Connection failed. Please try again.")
      })

    return () => {
      isMounted = false
    }
  }, [path, code, state])

  return (
    <CustomerDashboardLayout>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        {status === "loading" && (
          <>
            <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Completing connection…</p>
          </>
        )}
        {status === "done" && (
          <>
            <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-sm text-destructive">{message}</p>
            <a
              href="/connection"
              className="text-sm text-primary hover:underline"
            >
              Back to Connections
            </a>
          </>
        )}
      </div>
    </CustomerDashboardLayout>
  )
}

export default function AppOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <CustomerDashboardLayout>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CustomerDashboardLayout>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}
