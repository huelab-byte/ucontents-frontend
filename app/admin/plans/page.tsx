"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  PlusSignIcon,
  EditIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { planService, type Plan, type PlanListParams, type PlanSubscriptionType } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const subscriptionTypeLabels: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export default function AdminPlansPage() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isActiveFilter, setIsActiveFilter] = React.useState<string>("all")
  const [subscriptionTypeFilter, setSubscriptionTypeFilter] = React.useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = React.useState<string>("all")
  const [isFreePlanFilter, setIsFreePlanFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const perPage = 10

  const canManage = hasPermission("manage_plans")
  const canView = hasPermission("view_plans") || canManage

  const fetchPlans = React.useCallback(async () => {
    if (!canView) return
    setIsLoading(true)
    try {
      const params: PlanListParams = { page: currentPage, per_page: perPage }
      if (isActiveFilter === "true") params.is_active = true
      if (isActiveFilter === "false") params.is_active = false
      if (subscriptionTypeFilter !== "all") params.subscription_type = subscriptionTypeFilter as PlanSubscriptionType
      if (featuredFilter === "true") params.featured = true
      if (featuredFilter === "false") params.featured = false
      if (isFreePlanFilter === "true") params.is_free_plan = true
      if (isFreePlanFilter === "false") params.is_free_plan = false

      const response = await planService.list(params)
      if (response.success && response.data) {
        setPlans(response.data)
        if (response.pagination) {
          setTotalPages(response.pagination.last_page)
          setTotalItems(response.pagination.total)
        }
      }
    } catch (error) {
      console.error("Failed to load plans:", error)
      toast.error("Failed to load plans")
    } finally {
      setIsLoading(false)
    }
  }, [canView, currentPage, isActiveFilter, subscriptionTypeFilter, featuredFilter, isFreePlanFilter])

  React.useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  if (!canView) {
    return (
      <AdminDashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={CreditCardIcon} className="size-8" />
              Plans
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage subscription plans and their limits
            </p>
          </div>
          {canManage && (
            <Button onClick={() => router.push("/admin/plans/new")}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
              Add Plan
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>All Plans</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={isActiveFilter}
                  onValueChange={(v) => {
                    setIsActiveFilter(v || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={subscriptionTypeFilter}
                  onValueChange={(v) => {
                    setSubscriptionTypeFilter(v || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(subscriptionTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={featuredFilter}
                  onValueChange={(v) => {
                    setFeaturedFilter(v || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Featured</SelectItem>
                    <SelectItem value="false">Not featured</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={isFreePlanFilter}
                  onValueChange={(v) => {
                    setIsFreePlanFilter(v || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Free plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Free plan</SelectItem>
                    <SelectItem value="false">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No plans found.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead className="w-[80px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2 flex-wrap">
                            {plan.name}
                            {plan.featured && (
                              <Badge variant="default" className="text-xs">Featured</Badge>
                            )}
                            {plan.is_free_plan && (
                              <Badge variant="outline" className="text-xs">Free</Badge>
                            )}
                            {plan.trial_days != null && plan.trial_days > 0 && (
                              <Badge variant="secondary" className="text-xs">{plan.trial_days}d trial</Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{plan.slug}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {subscriptionTypeLabels[plan.subscription_type] ?? plan.subscription_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan.price === 0
                            ? "Free"
                            : `${plan.currency} ${Number(plan.price).toFixed(2)}`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="block">Storage: {formatBytes(plan.total_storage_bytes)}</span>
                          <span className="block">Connections: {plan.max_connections}</span>
                          {plan.monthly_post_limit != null && (
                            <span className="block">Posts/mo: {plan.monthly_post_limit}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {plan.is_active ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <HugeiconsIcon icon={AlertCircleIcon} className="size-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/admin/plans/${plan.id}/edit`)}
                              aria-label="Edit plan"
                            >
                              <HugeiconsIcon icon={EditIcon} className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing page {currentPage} of {totalPages} ({totalItems} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
