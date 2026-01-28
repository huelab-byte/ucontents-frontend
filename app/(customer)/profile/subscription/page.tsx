"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  CheckmarkCircle01Icon,
  ArrowUp01Icon,
  DownloadIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

interface Plan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  description: string
  features: string[]
  popular?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: "Paid" | "Pending" | "Failed"
}

export default function SubscriptionPage() {
  const [isPlansModalOpen, setIsPlansModalOpen] = React.useState(false)
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const [billingInterval, setBillingInterval] = React.useState<"month" | "year">("month")

  // Demo current subscription data
  const currentPlan = {
    name: "Plus",
    status: "Active" as const,
    renewalDate: "2024-02-20",
  }

  // Demo available plans with monthly and yearly prices
  // Yearly prices are typically 2 months free (10 months worth)
  const plansData = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Perfect for getting started",
      features: [
        "5 content generations per month",
        "Basic templates",
        "Email support",
        "1 automation workflow",
      ],
    },
    {
      id: "plus",
      name: "Plus",
      monthlyPrice: 19,
      yearlyPrice: 190, // 10 months worth (2 months free)
      description: "Most popular for individuals",
      features: [
        "Unlimited content generations",
        "Premium templates",
        "Priority email support",
        "10 automation workflows",
        "Advanced analytics",
        "API access",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 49,
      yearlyPrice: 490, // 10 months worth (2 months free)
      description: "For teams and agencies",
      features: [
        "Everything in Plus",
        "Team collaboration",
        "Custom integrations",
        "Dedicated support",
        "Custom branding",
        "Advanced permissions",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: 199,
      yearlyPrice: 1990, // 10 months worth (2 months free)
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "SLA guarantee",
        "Custom development",
        "On-premise deployment",
        "Dedicated account manager",
      ],
    },
  ]

  // Calculate displayed plans based on selected interval
  const availablePlans: Plan[] = plansData.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: billingInterval === "month" ? plan.monthlyPrice : plan.yearlyPrice,
    interval: billingInterval,
    description: plan.description,
    features: plan.features,
    popular: plan.popular,
  }))

  // Demo invoice data
  const invoices: Invoice[] = [
    {
      id: "INV-2024-001",
      date: "2024-01-20",
      amount: 19.0,
      status: "Paid",
    },
    {
      id: "INV-2023-045",
      date: "2023-12-20",
      amount: 19.0,
      status: "Paid",
    },
    {
      id: "INV-2023-044",
      date: "2023-11-20",
      amount: 19.0,
      status: "Paid",
    },
    {
      id: "INV-2023-043",
      date: "2023-10-20",
      amount: 19.0,
      status: "Pending",
    },
    {
      id: "INV-2023-042",
      date: "2023-09-20",
      amount: 19.0,
      status: "Failed",
    },
  ]

  const handlePurchasePlan = async (planId: string) => {
    setIsPurchasing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsPurchasing(false)
    setIsPlansModalOpen(false)
    // In a real app, you'd handle the purchase flow here
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
      case "Paid":
        return "default"
      case "Pending":
        return "secondary"
      case "Failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "Failed":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return ""
    }
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={CreditCardIcon} className="size-8" />
            Subscription & Billing
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan, billing information, and view invoices
          </p>
        </div>

        {/* Current Subscription Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold">{currentPlan.name}</h3>
                  <Badge variant={getStatusBadgeVariant(currentPlan.status)}>
                    {currentPlan.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next billing date: {formatDate(currentPlan.renewalDate)}
                </p>
              </div>
              <Button
                onClick={() => setIsPlansModalOpen(true)}
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                Upgrade / Buy Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Invoice ID
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Date
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Amount
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Status
                      </th>
                      <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium">{invoice.id}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={getStatusColor(invoice.status)}
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => {
                              // In a real app, this would download the invoice
                            }}
                          >
                            <HugeiconsIcon icon={DownloadIcon} className="size-4" />
                            <span className="sr-only">Download invoice</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No invoices found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Modal */}
        <Sheet open={isPlansModalOpen} onOpenChange={setIsPlansModalOpen}>
          <SheetContent
            side="right"
            className="overflow-y-auto"
            style={{
              maxWidth: "600px",
              width: "min(600px, 95vw)",
              paddingLeft: "18px",
              paddingRight: "44px",
            }}
          >
            <SheetHeader>
              <SheetTitle>Choose a Plan</SheetTitle>
              <SheetDescription>
                Select the plan that best fits your needs. You can change or cancel anytime.
              </SheetDescription>
            </SheetHeader>

            {/* Billing Interval Toggle */}
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-full max-w-[320px] sm:w-auto sm:min-w-[280px]">
                  <Button
                    type="button"
                    variant={billingInterval === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setBillingInterval("month")}
                    className="flex-1 min-w-0 px-3 sm:px-4 text-sm"
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingInterval === "year" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setBillingInterval("year")}
                    className="flex-1 min-w-0 px-3 sm:px-4 text-sm"
                  >
                    Yearly
                  </Button>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium whitespace-nowrap h-6 px-2.5"
                >
                  Save 17%
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {availablePlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    plan.popular ? "border-primary ring-2 ring-primary/20" : "",
                    "mr-0 sm:mr-[26px]"
                  )}
                >
                  <CardHeader className="!px-[18px]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.popular && (
                            <Badge variant="default" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-bold">
                          {formatCurrency(plan.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{plan.interval === "month" ? "month" : "year"}
                          {plan.interval === "year" && plan.price > 0 && (
                            <div className="text-green-600 font-medium mt-0.5 text-xs">
                              {formatCurrency(Math.round((plan.price / 12) * 100) / 100)}/mo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="!px-[18px]">
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="size-4 text-primary mt-0.5 shrink-0"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePurchasePlan(plan.id)}
                      disabled={isPurchasing || plan.id === "plus"}
                    >
                      {plan.id === "plus" ? (
                        <>
                          <HugeiconsIcon icon={Tick02Icon} className="size-4 mr-2" />
                          Current Plan
                        </>
                      ) : isPurchasing ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Select ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button variant="outline" disabled={isPurchasing}>
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </CustomerDashboardLayout>
  )
}
