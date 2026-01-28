"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon, LogoutIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(true)

  React.useEffect(() => {
    const logoutTimer = setTimeout(() => {
      setIsLoggingOut(false)
    }, 1000)

    const redirectTimer = setTimeout(async () => {
      await logout()
    }, 2500)

    return () => {
      clearTimeout(logoutTimer)
      clearTimeout(redirectTimer)
    }
  }, [logout])

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
            {isLoggingOut ? (
              <>
                <div className="relative">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={LogoutIcon}
                      className="size-8 text-primary animate-pulse"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Logging out...</h1>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we securely log you out
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center transition-all duration-300 opacity-100 scale-100">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="size-8 text-emerald-600"
                    />
                  </div>
                </div>
                <div className="space-y-2 transition-all duration-500 opacity-100">
                  <h1 className="text-2xl font-bold text-emerald-600">
                    Successfully logged out
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    You have been securely logged out. Redirecting to login page...
                  </p>
                </div>
                <div className="pt-4">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
