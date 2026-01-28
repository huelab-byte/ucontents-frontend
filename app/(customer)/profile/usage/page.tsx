"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  File01Icon,
  Video01Icon,
  MachineRobotIcon,
  CreditCardIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

interface UsageBreakdown {
  category: string
  icon: any
  used: number
  total: number
  color: string
}

export default function UsagePage() {
  // Demo credit balance data
  const creditBalance = {
    total: 1000,
    used: 342,
    remaining: 658,
  }

  const usagePercentage = (creditBalance.used / creditBalance.total) * 100

  // Demo usage breakdown
  const usageBreakdown: UsageBreakdown[] = [
    {
      category: "Content Generation",
      icon: File01Icon,
      used: 156,
      total: 500,
      color: "bg-blue-500",
    },
    {
      category: "Image Generation",
      icon: Video01Icon,
      used: 89,
      total: 300,
      color: "bg-purple-500",
    },
    {
      category: "Automation Jobs",
      icon: MachineRobotIcon,
      used: 97,
      total: 200,
      color: "bg-green-500",
    },
  ]

  const getCategoryColor = (color: string) => {
    switch (color) {
      case "bg-blue-500":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "bg-purple-500":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "bg-green-500":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted/50 text-muted-foreground"
    }
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={Analytics02Icon} className="size-8" />
              Usage & Credits
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor credit consumption, track usage across content generation, automation, and team workflows
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Buy Credits
          </Button>
        </div>

        {/* Credit Balance Card */}
        <Card className="mr-0 sm:mr-[26px]">
          <CardHeader className="!px-[18px]">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CreditCardIcon} className="size-5" />
              Current Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="!px-[18px]">
            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                  <p className="text-4xl font-bold">{creditBalance.remaining.toLocaleString()}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {creditBalance.used.toLocaleString()} used
                    </span>
                    <span className="text-muted-foreground">
                      {creditBalance.total.toLocaleString()} total
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-2xl font-semibold mt-1">{creditBalance.used.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {usagePercentage.toFixed(1)}% of total
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-semibold mt-1 text-green-600">
                    {creditBalance.remaining.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(100 - usagePercentage).toFixed(1)}% available
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reset Date</p>
                  <p className="text-2xl font-semibold mt-1">Feb 20</p>
                  <p className="text-xs text-muted-foreground mt-1">Next billing cycle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Summary Card */}
        <Card className="mr-0 sm:mr-[26px]">
          <CardHeader className="!px-[18px]">
            <CardTitle>Usage Summary</CardTitle>
          </CardHeader>
          <CardContent className="!px-[18px]">
            <div className="space-y-6">
              {usageBreakdown.map((item) => {
                const percentage = (item.used / item.total) * 100
                const Icon = item.icon
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Icon} className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {item.used} / {item.total}
                        </span>
                        <Badge variant="outline" className={getCategoryColor(item.color)}>
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerDashboardLayout>
  )
}
