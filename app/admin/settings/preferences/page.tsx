"use client"

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SettingsIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  UserWarning01Icon,
  Queue01Icon,
  MachineRobotIcon,
  Database02Icon,
  CodeIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons"

interface SystemStatus {
  id: string
  name: string
  status: string
  icon: any
  description?: string
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const getStatusConfig = (status: string) => {
  const statusConfigs: Record<
    string,
    { label: string; className: string; icon: any }
  > = {
    Running: {
      label: "Running",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckmarkCircle01Icon,
    },
    Degraded: {
      label: "Degraded",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: UserWarning01Icon,
    },
    Down: {
      label: "Down",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertCircleIcon,
    },
    Active: {
      label: "Active",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckmarkCircle01Icon,
    },
    Paused: {
      label: "Paused",
      className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      icon: AlertCircleIcon,
    },
    Error: {
      label: "Error",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertCircleIcon,
    },
    Online: {
      label: "Online",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckmarkCircle01Icon,
    },
    Offline: {
      label: "Offline",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertCircleIcon,
    },
    Connected: {
      label: "Connected",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckmarkCircle01Icon,
    },
    "Not Connected": {
      label: "Not Connected",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertCircleIcon,
    },
  }

  return (
    statusConfigs[status] || {
      label: status,
      className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      icon: AlertCircleIcon,
    }
  )
}

// Demo data
const applicationStatus = "Running"
const queueStatus = "Active"
const workerStatus = "Online"
const storageStatus = "Connected"
const apiServicesStatus = "Connected"
const lastHealthCheckTime = new Date().toISOString()

const systemComponents: SystemStatus[] = [
  {
    id: "application",
    name: "Application Status",
    status: applicationStatus,
    icon: SettingsIcon,
    description: "Main application server status",
  },
  {
    id: "queue",
    name: "Queue Status",
    status: queueStatus,
    icon: Queue01Icon,
    description: "Job queue processing status",
  },
  {
    id: "worker",
    name: "Worker Status",
    status: workerStatus,
    icon: MachineRobotIcon,
    description: "Background worker processes",
  },
  {
    id: "storage",
    name: "Storage Status",
    status: storageStatus,
    icon: Database02Icon,
    description: "Storage connection status",
  },
  {
    id: "api",
    name: "API Services Status",
    status: apiServicesStatus,
    icon: CodeIcon,
    description: "External API connections",
  },
]

export default function PreferencesPage() {
  const overallStatus = applicationStatus === "Running" ? "Healthy" : "Degraded"

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={SettingsIcon} className="size-8" />
            System Preferences
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor system health status and component availability
          </p>
        </div>

        {/* System Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5" />
              System Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{overallStatus}</div>
                <div className="text-sm text-muted-foreground">
                  All systems operational
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  overallStatus === "Healthy"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }
              >
                <HugeiconsIcon
                  icon={
                    overallStatus === "Healthy"
                      ? CheckmarkCircle01Icon
                      : UserWarning01Icon
                  }
                  className="size-3 mr-1"
                />
                {overallStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Components */}
        <Card>
          <CardHeader>
            <CardTitle>System Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemComponents.map((component, index) => {
                const statusConfig = getStatusConfig(component.status)
                const StatusIcon = statusConfig.icon
                const ComponentIcon = component.icon

                return (
                  <div key={component.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <HugeiconsIcon
                            icon={ComponentIcon}
                            className="size-5 text-muted-foreground"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          {component.description && (
                            <div className="text-sm text-muted-foreground">
                              {component.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusConfig.className}>
                        <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    {index < systemComponents.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Last Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ClockIcon} className="size-5" />
              Last Health Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatTimestamp(lastHealthCheckTime)}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
