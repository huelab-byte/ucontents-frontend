"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { socialConnectionService, type SocialProvider } from "@/lib/api"
import { toast } from "@/lib/toast"

/** Map /app/{platform}/{type} path to backend provider (meta | google | tiktok) */
const PATH_TO_PROVIDER: Record<string, SocialProvider> = {
  "tiktok/profile": "tiktok",
  "youtube/channel": "google",
  "facebook/profile": "meta",
  "facebook/page": "meta",
  "instagram/profile": "meta",
}

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const pathSegments = params?.path as string[] | undefined
  const path = Array.isArray(pathSegments) ? pathSegments.join("/") : ""
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const [status, setStatus] = React.useState<"loading" | "done" | "error">("loading")
  const [message, setMessage] = React.useState<string>("")

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

    const redirectUri =
      typeof window !== "undefined"
        ? window.location.origin + "/app/" + path
        : ""

    let cancelled = false

    socialConnectionService
      .exchangeCode(provider, { code, state, redirect_uri: redirectUri })
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data?.redirect_url) {
          setStatus("done")
          window.location.href = res.data.redirect_url
          return
        }
        setStatus("error")
        setMessage(res.message || "Exchange failed")
      })
      .catch((err) => {
        if (cancelled) return
        console.error("OAuth exchange failed:", err)
        setStatus("error")
        setMessage("Connection failed. Please try again.")
        toast.error("Connection failed")
      })

    return () => {
      cancelled = true
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
