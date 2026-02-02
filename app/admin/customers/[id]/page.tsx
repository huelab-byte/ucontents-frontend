"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button, buttonVariants } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  UserIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  CreditCardIcon,
  File01Icon,
  Receipt,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import {
  customerService,
  paymentGatewayService,
  planService,
  type CustomerProfile,
  type Invoice,
  type Payment,
  type Subscription,
  type Plan,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"
import { cn } from "@/lib/utils"

type TabId = "overview" | "payments" | "invoices" | "subscriptions" | "plans"

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}

function CustomerProfilePageContent() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const { hasPermission } = usePermission()

  const [profile, setProfile] = React.useState<CustomerProfile | null>(null)
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)
  const [isLoadingTab, setIsLoadingTab] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<TabId>("overview")
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("")
  const [isAssigning, setIsAssigning] = React.useState(false)

  const canView = hasPermission("view_customers") || hasPermission("manage_customers")
  const canManagePlans = hasPermission("manage_plans")

  React.useEffect(() => {
    if (!canView || isNaN(id)) return
    let cancelled = false
    setIsLoadingProfile(true)
    setError(null)
    customerService
      .getProfile(id)
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) {
          setProfile(res.data)
        } else {
          setError("Failed to load customer profile")
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error("Failed to load customer profile:", err)
        setError(err instanceof Error ? err.message : "Failed to load customer profile")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, canView])

  const loadTabData = React.useCallback(
    async (tab: TabId) => {
      if (isNaN(id)) return
      setIsLoadingTab(true)
      try {
        if (tab === "invoices") {
          const res = await paymentGatewayService.getInvoices({ user_id: id, per_page: 50 })
          if (res.success && res.data) setInvoices(res.data)
        } else if (tab === "payments") {
          const res = await paymentGatewayService.getPayments({ user_id: id, per_page: 50 })
          if (res.success && res.data) setPayments(res.data)
        } else if (tab === "subscriptions") {
          const res = await paymentGatewayService.getSubscriptions({ user_id: id, per_page: 50 })
          if (res.success && res.data) setSubscriptions(res.data)
        } else if (tab === "plans") {
          const res = await planService.list({ is_active: true, per_page: 100 })
          if (res.success && res.data) setPlans(res.data)
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : String(err)
        console.error("Failed to load tab data:", msg || "Unknown error")
      } finally {
        setIsLoadingTab(false)
      }
    },
    [id]
  )

  React.useEffect(() => {
    if (activeTab !== "overview" && profile) {
      loadTabData(activeTab)
    }
  }, [activeTab, profile, loadTabData])

  const handleAssignPlan = async () => {
    const planId = selectedPlanId ? Number(selectedPlanId) : 0
    if (!planId || isNaN(id)) return
    setIsAssigning(true)
    try {
      const res = await planService.assignPlan(planId, id)
      if (res.success) {
        toast.success("Plan assigned successfully")
        setSelectedPlanId("")
        const profileRes = await customerService.getProfile(id)
        if (profileRes.success && profileRes.data) setProfile(profileRes.data)
        if (activeTab === "subscriptions") loadTabData("subscriptions")
      } else {
        toast.error(res.message || "Failed to assign plan")
      }
    } catch (err) {
      console.error("Failed to assign plan:", err)
      toast.error("Failed to assign plan")
    } finally {
      setIsAssigning(false)
    }
  }

  if (!canView) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (isNaN(id)) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Invalid customer ID.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (isLoadingProfile && !profile) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Link href="/admin/customers" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
            Back to customers
          </Link>
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (error && !profile) {
    return (
      <AdminDashboardLayout>
        <div className="space-y-6">
          <Link href="/admin/customers" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
            Back to customers
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-12 mx-auto text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => router.push("/admin/customers")}>
                Back to list
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    )
  }

  const user = profile!.user
  const statusConfig =
    user.status === "active"
      ? { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckmarkCircle01Icon }
      : { className: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertCircleIcon }

  const tabs: { id: TabId; label: string; icon: typeof UserIcon }[] = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "payments", label: "Payments", icon: Receipt },
    { id: "invoices", label: "Invoices", icon: File01Icon },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCardIcon },
    { id: "plans", label: "Assign plan", icon: PlusSignIcon },
  ]

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/customers" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge className={cn("border", statusConfig.className)}>
            <HugeiconsIcon icon={statusConfig.icon} className="size-3.5 mr-1" />
            {user.status === "active" ? "Active" : "Suspended"}
          </Badge>
        </div>

        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={tab.icon} className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatDate(user.last_login_at)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile!.invoices_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile!.payments_count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Support tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{profile!.support_tickets_count}</p>
                {profile!.support_tickets_count > 0 && (
                  <Link href={`/admin/support?user=${id}`} className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto")}>
                    View tickets
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingTab ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : payments.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No payments yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{formatCurrency(p.amount, p.currency)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{p.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(p.paid_at ?? p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        )}

        {activeTab === "invoices" && (
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingTab ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : invoices.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No invoices yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.invoice_number}</TableCell>
                          <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{inv.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(inv.due_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        )}

        {activeTab === "subscriptions" && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingTab ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : subscriptions.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No subscriptions yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((s) => {
                        const sub = s as Subscription & { name?: string; amount?: number; currency?: string }
                        return (
                          <TableRow key={s.id}>
                            <TableCell>{sub.name ?? `Subscription #${s.id}`}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{s.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(sub.amount ?? 0, sub.currency ?? "USD")}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        )}

        {activeTab === "plans" && canManagePlans && (
          <Card>
            <CardHeader>
              <CardTitle>Assign plan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assign a plan to this customer. A subscription or invoice will be created.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Plan</label>
                <Select
                  value={selectedPlanId}
                  onValueChange={(v) => setSelectedPlanId(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.name} — {formatCurrency(plan.price, plan.currency)} / {plan.subscription_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssignPlan}
                disabled={!selectedPlanId || isAssigning}
              >
                {isAssigning ? "Assigning..." : "Assign plan"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "plans" && !canManagePlans && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You do not have permission to assign plans.
            </CardContent>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  )
}

export default function CustomerProfilePage() {
  return <CustomerProfilePageContent />
}
