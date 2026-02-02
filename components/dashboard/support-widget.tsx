"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Ticket01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import type { SupportTicket } from "@/lib/api"

interface SupportWidgetProps {
  openTicketsCount: number
  recentTickets?: SupportTicket[]
  isLoading?: boolean
}

export function SupportWidget({
  openTicketsCount,
  recentTickets = [],
  isLoading = false,
}: SupportWidgetProps) {
  if (isLoading) {
    return (
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Ticket01Icon} className="size-4" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-16 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Ticket01Icon} className="size-4" />
          Open Tickets
        </CardTitle>
        <span className="text-2xl font-bold">{openTicketsCount}</span>
      </CardHeader>
      <CardContent>
        {recentTickets.length > 0 && (
          <ul className="space-y-2 mb-4">
            {recentTickets.slice(0, 2).map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/support/tickets/${ticket.id}`}
                  className="text-sm hover:underline block truncate"
                >
                  {ticket.ticket_number}: {ticket.subject}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {openTicketsCount === 0 && (
          <p className="text-sm text-muted-foreground mb-4">No open tickets.</p>
        )}
        <div className="flex gap-2">
          <Link 
            href="/support/tickets"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 flex-1 border border-border bg-background hover:bg-muted hover:text-foreground"
          >
            View tickets
          </Link>
          <Link 
            href="/support/tickets/new"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2 shrink-0" />
            New ticket
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
