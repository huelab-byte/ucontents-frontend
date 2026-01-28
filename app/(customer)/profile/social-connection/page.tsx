"use client"

import * as React from "react"
import Link from "next/link"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { socialConnectionService, type SocialProvider, type SocialChannel } from "@/lib/api"

const PROVIDER_LABELS: Record<SocialProvider, string> = {
  meta: "Meta (Facebook/Instagram)",
  google: "Google (YouTube)",
  tiktok: "TikTok",
}

export default function SocialConnectionPage() {
  const [enabledProviders, setEnabledProviders] = React.useState<SocialProvider[]>([])
  const [channels, setChannels] = React.useState<SocialChannel[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [provRes, chanRes] = await Promise.all([
        socialConnectionService.getEnabledProviders(),
        socialConnectionService.getChannels({ page: 1, per_page: 50 }),
      ])

      if (provRes.success && provRes.data) {
        setEnabledProviders(provRes.data.map((p) => p.provider))
      }
      if (chanRes.success && chanRes.data) {
        setChannels(chanRes.data)
      }
    } catch (e: any) {
      setError(e.message || "Failed to load social connections")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const connect = async (provider: SocialProvider) => {
    try {
      const res = await socialConnectionService.getRedirectUrl(provider)
      if (res.success && res.data?.redirect_url) {
        window.location.href = res.data.redirect_url
      }
    } catch (e) {
    }
  }

  const disconnect = async (id: number) => {
    try {
      const res = await socialConnectionService.disconnectChannel(id)
      if (res.success && res.data) {
        const updatedChannel = res.data
        setChannels((prev) => prev.map((c) => (c.id === id ? updatedChannel : c)))
      }
    } catch (e) {
      console.error("Failed to disconnect channel:", e)
    }
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Social Connection</h1>
            <p className="text-muted-foreground mt-2">
              Connect your social channels to publish content later.
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline">Back to Profile</Button>
          </Link>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={load}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Connect a provider</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {enabledProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No providers are enabled right now.</p>
                ) : (
                  enabledProviders.map((p) => (
                    <Button key={p} onClick={() => connect(p)} className="justify-start" variant="outline">
                      Connect {PROVIDER_LABELS[p]}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected channels</CardTitle>
              </CardHeader>
              <CardContent>
                {channels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No channels connected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {channels.map((ch) => (
                      <div key={ch.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{ch.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {PROVIDER_LABELS[ch.provider]} • {ch.type}
                            </span>
                          </div>
                          {!ch.is_active && (
                            <p className="text-xs text-muted-foreground mt-1">Disconnected</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          disabled={!ch.is_active}
                          onClick={() => disconnect(ch.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </CustomerDashboardLayout>
  )
}

