"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SearchIcon,
  UserIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  ClockIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { customerService } from "@/lib/api"
import type { User } from "@/lib/api"
import { usePermission } from "@/lib/hooks/use-permission"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/users/pagination"

const statusColors: Record<string, { className: string; icon: typeof CheckmarkCircle01Icon }> = {
  active: {
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckmarkCircle01Icon,
  },
  suspended: {
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertCircleIcon,
  },
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function CustomersListPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission } = usePermission()

  const [customers, setCustomers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const itemsPerPage = 10

  if (!hasPermission("view_customers") && !hasPermission("manage_customers")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  const currentPage = React.useMemo(() => {
    const pageParam = searchParams.get("page")
    const page = pageParam ? parseInt(pageParam, 10) : 1
    return isNaN(page) || page < 1 ? 1 : page
  }, [searchParams])

  const setCurrentPage = React.useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete("page")
      } else {
        params.set("page", String(page))
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      if (searchQuery && currentPage !== 1) {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, currentPage, setCurrentPage])

  const fetchCustomers = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        per_page: itemsPerPage,
      }
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery
      }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await customerService.list(params)

      if (response.success && response.data) {
        setCustomers(response.data)
        if (response.pagination) {
          setTotalPages(response.pagination.last_page)
          setTotalItems(response.pagination.total)
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load customers:", err)
      setError(err instanceof Error ? err.message : "Failed to load customers")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearchQuery, statusFilter])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + customers.length

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage customer accounts, payments, and plans
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Customers</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value ?? "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  className="size-12 mx-auto text-destructive mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">Error loading customers</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchCustomers} disabled={isLoading}>
                  Retry
                </Button>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-12 text-center">
                <HugeiconsIcon icon={UserIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No customer accounts yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Customer
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Last Login
                        </th>
                        <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => {
                        const statusConfig =
                          statusColors[customer.status] ?? statusColors.active
                        return (
                          <tr
                            key={customer.id}
                            className="border-b border-border last:border-0 hover:bg-muted/50"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                  statusConfig.className
                                )}
                              >
                                <HugeiconsIcon
                                  icon={statusConfig.icon}
                                  className="size-3.5"
                                  strokeWidth={2}
                                />
                                {customer.status === "active" ? "Active" : "Suspended"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {formatDate(customer.last_login_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link 
                                href={`/admin/customers/${customer.id}`}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 hover:bg-muted hover:text-foreground"
                              >
                                <HugeiconsIcon icon={ViewIcon} className="size-4 mr-1" />
                                View profile
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    startIndex={startIndex + 1}
                    endIndex={Math.min(endIndex, totalItems)}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}

export default function CustomersPage() {
  return (
    <React.Suspense
      fallback={
        <AdminDashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <p className="text-muted-foreground mt-2">
                View and manage customer accounts, payments, and plans
              </p>
            </div>
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminDashboardLayout>
      }
    >
      <CustomersListPageContent />
    </React.Suspense>
  )
}
