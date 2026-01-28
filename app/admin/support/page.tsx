"use client"

import * as React from "react"
import { Suspense } from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Ticket01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Queue01Icon,
  SearchIcon,
  UserIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons"
import { supportService, type SupportTicket, type TicketStatus } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePermission } from "@/lib/hooks/use-permission"

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

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(dateString)
}

function TicketsListContent() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  // Permission check
  if (!hasPermission("view_all_tickets") && !hasPermission("manage_tickets")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    )
  }
  const [totalItems, setTotalItems] = React.useState(0)

  const fetchTickets = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        per_page: 20,
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter
      }

      const response = await supportService.getAllTickets(params)
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
  }, [currentPage, searchQuery, statusFilter, priorityFilter])

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
            Manage and respond to customer support tickets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Tickets</CardTitle>
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
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
                        User
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                        Priority
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">
                        Assigned To
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        Last Reply
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const statusConfigItem = statusConfig[ticket.status]
                      const priorityConfigItem = priorityConfig[ticket.priority]
                      const StatusIcon = statusConfigItem.icon
                      return (
                        <tr
                          key={ticket.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/support/${ticket.id}`)}
                        >
                          <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                            {ticket.ticket_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium">{ticket.subject}</div>
                            {ticket.category && (
                              <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                                {ticket.category}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" />
                              <div className="text-sm">
                                <div className="font-medium">{ticket.user?.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{ticket.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={statusConfigItem.className}>
                              <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                              {statusConfigItem.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <Badge variant="outline" className={priorityConfigItem.className}>
                              {priorityConfigItem.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {ticket.assigned_to ? (
                              <div className="text-sm">{ticket.assigned_to.name}</div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                            {ticket.last_replied_at ? (
                              <div className="flex items-center gap-1">
                                <HugeiconsIcon icon={ClockIcon} className="size-3" />
                                {formatRelativeTime(ticket.last_replied_at)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No replies</span>
                            )}
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
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalItems)} of {totalItems} tickets
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
              <CardTitle className="mb-2">No tickets found</CardTitle>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No support tickets have been created yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminSupportTicketsPage() {
  return (
    <AdminDashboardLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <TicketsListContent />
      </Suspense>
    </AdminDashboardLayout>
  )
}
