"use client"

import * as React from "react"
import { Suspense } from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  Ticket01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Queue01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { supportService, type SupportTicket, type TicketStatus } from "@/lib/api"
import { toast } from "@/lib/toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

const statusConfig: Record<TicketStatus, { label: string; className: string; icon: any }> = {
  open: {
    label: "Open",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Ticket01Icon,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Queue01Icon,
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckmarkCircle01Icon,
  },
  closed: {
    label: "Closed",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: AlertCircleIcon,
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function TicketsListContent() {
  const router = useRouter()
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)

  const fetchTickets = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        per_page: 15,
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await supportService.getTickets(params)
      if (response.success && response.data) {
        setTickets(response.data)
        if (response.pagination) {
          setTotalPages(response.pagination.last_page)
          setTotalItems(response.pagination.total)
        }
      }
    } catch (error) {
      toast.error("Failed to load tickets")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  React.useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      if (searchQuery && currentPage !== 1) {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, currentPage])

  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      return
    }
    fetchTickets()
  }, [debouncedSearchQuery, fetchTickets])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={Ticket01Icon} className="size-8" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage support tickets, track your requests, and get help from our team
          </p>
        </div>
        <Link href="/support/tickets/new">
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            New Ticket
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Your Tickets</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Ticket #
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Subject
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        Priority
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const config = statusConfig[ticket.status]
                      const Icon = config.icon
                      return (
                        <tr
                          key={ticket.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/support/tickets/${ticket.id}`)}
                        >
                          <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.ticket_number}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium">{ticket.subject}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 md:hidden">
                              {formatDate(ticket.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={config.className}>
                              <HugeiconsIcon icon={Icon} className="size-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell capitalize">
                            {ticket.priority}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                            {formatDate(ticket.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 15) + 1} to {Math.min(currentPage * 15, totalItems)} of {totalItems} tickets
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <HugeiconsIcon
                icon={Ticket01Icon}
                className="size-12 mx-auto text-muted-foreground mb-4"
              />
              <CardTitle className="mb-2">No tickets yet</CardTitle>
              <p className="text-muted-foreground mb-4">
                Create your first support ticket to get started.
              </p>
              <Link href="/support/tickets/new">
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
                  New Ticket
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TicketsPage() {
  return (
    <CustomerDashboardLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <TicketsListContent />
      </Suspense>
    </CustomerDashboardLayout>
  )
}
