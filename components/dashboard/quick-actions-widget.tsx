"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Queue01Icon,
  Link01Icon,
  Ticket01Icon,
  Analytics02Icon,
  File01Icon,
} from "@hugeicons/core-free-icons"

const actions = [
  { label: "New Campaign", href: "/social-automation/bulk-posting", icon: Queue01Icon },
  { label: "Connect Channel", href: "/connection", icon: Link01Icon },
  { label: "Create Support Ticket", href: "/support/tickets/new", icon: Ticket01Icon },
  { label: "View Usage", href: "/profile/usage", icon: Analytics02Icon },
  { label: "Media Upload", href: "/content-generation/media-upload", icon: File01Icon },
]

export function QuickActionsWidget() {
  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.label} variant="outline" size="sm" className="justify-start h-auto py-3" asChild>
                <Link href={action.href}>
                  <HugeiconsIcon icon={Icon} className="size-4 mr-2 shrink-0" />
                  {action.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
