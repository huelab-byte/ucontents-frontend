"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function CallbackContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get("provider")
  const status = searchParams.get("status")
  const error = searchParams.get("error")
  const channelsUpserted = searchParams.get("channels_upserted")

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Social connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Connected {provider || "provider"} successfully.
                </p>
                {channelsUpserted && (
                  <p className="text-xs text-muted-foreground">
                    Channels updated: {channelsUpserted}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-destructive">Connection failed.</p>
                {error && <p className="text-xs text-muted-foreground">{error}</p>}
              </div>
            )}

            <Link href="/profile/social-connection">
              <Button>Back to Social Connection</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </CustomerDashboardLayout>
  )
}

export default function SocialConnectionCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <CustomerDashboardLayout>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CustomerDashboardLayout>
      }
    >
      <CallbackContent />
    </React.Suspense>
  )
}

