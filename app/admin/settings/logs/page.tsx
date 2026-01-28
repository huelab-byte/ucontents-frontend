"use client"

import * as React from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DocumentCodeIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  UserWarning01Icon,
  UserIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons"

interface LogEntry {
  id: string
  timestamp: string
  actor: "User" | "System"
  actorName?: string
  category: "System" | "Automation" | "Queue" | "Storage" | "Auth"
  action: string
  status: "Success" | "Failed" | "Warning"
}

const demoLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-20T14:30:25Z",
    actor: "User",
    actorName: "john.doe@example.com",
    category: "Automation",
    action: "Created social automation workflow",
    status: "Success",
  },
  {
    id: "2",
    timestamp: "2024-01-20T14:28:15Z",
    actor: "System",
    category: "Queue",
    action: "Processed content generation job #12345",
    status: "Success",
  },
  {
    id: "3",
    timestamp: "2024-01-20T14:25:10Z",
    actor: "User",
    actorName: "jane.smith@example.com",
    category: "Storage",
    action: "Uploaded footage file (large-file.mp4)",
    status: "Success",
  },
  {
    id: "4",
    timestamp: "2024-01-20T14:20:05Z",
    actor: "System",
    category: "Queue",
    action: "Job #12344 failed after 3 retry attempts",
    status: "Failed",
  },
  {
    id: "5",
    timestamp: "2024-01-20T14:15:00Z",
    actor: "User",
    actorName: "peter.jones@example.com",
    category: "Auth",
    action: "Failed login attempt",
    status: "Warning",
  },
  {
    id: "6",
    timestamp: "2024-01-20T14:10:30Z",
    actor: "System",
    category: "System",
    action: "Storage quota warning: 85% capacity used",
    status: "Warning",
  },
  {
    id: "7",
    timestamp: "2024-01-20T14:05:20Z",
    actor: "User",
    actorName: "alice.williams@example.com",
    category: "Automation",
    action: "Updated automation schedule",
    status: "Success",
  },
  {
    id: "8",
    timestamp: "2024-01-20T14:00:15Z",
    actor: "System",
    category: "Queue",
    action: "Started processing batch of 10 jobs",
    status: "Success",
  },
  {
    id: "9",
    timestamp: "2024-01-20T13:55:00Z",
    actor: "User",
    actorName: "charlie.brown@example.com",
    category: "Storage",
    action: "Deleted footage file (old-video.mp4)",
    status: "Success",
  },
  {
    id: "10",
    timestamp: "2024-01-20T13:50:45Z",
    actor: "System",
    category: "System",
    action: "API rate limit approaching threshold",
    status: "Warning",
  },
  {
    id: "11",
    timestamp: "2024-01-20T13:45:30Z",
    actor: "User",
    actorName: "john.doe@example.com",
    category: "Auth",
    action: "API key regenerated",
    status: "Success",
  },
  {
    id: "12",
    timestamp: "2024-01-20T13:40:20Z",
    actor: "System",
    category: "Automation",
    action: "Automation workflow execution timed out",
    status: "Failed",
  },
]

const categoryColors: Record<string, string> = {
  System: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Automation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Queue: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Storage: "bg-green-500/10 text-green-600 border-green-500/20",
  Auth: "bg-pink-500/10 text-pink-600 border-pink-500/20",
}

const statusConfig = {
  Success: {
    label: "Success",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckmarkCircle01Icon,
  },
  Failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertCircleIcon,
  },
  Warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: UserWarning01Icon,
  },
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

export default function LogsPage() {
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  // Filter logs based on selected filters
  const filteredLogs = React.useMemo(() => {
    return demoLogs.filter((log) => {
      // Category filter
      if (selectedCategory !== "all" && log.category !== selectedCategory) {
        return false
      }

      // Status filter
      if (selectedStatus !== "all" && log.status !== selectedStatus) {
        return false
      }

      // Date range filter
      if (startDate) {
        const logDate = new Date(log.timestamp)
        const filterStartDate = new Date(startDate)
        if (logDate < filterStartDate) {
          return false
        }
      }

      if (endDate) {
        const logDate = new Date(log.timestamp)
        const filterEndDate = new Date(endDate)
        filterEndDate.setHours(23, 59, 59, 999) // End of day
        if (logDate > filterEndDate) {
          return false
        }
      }

      return true
    })
  }, [startDate, endDate, selectedCategory, selectedStatus])

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={DocumentCodeIcon} className="size-8" />
            Logs & Activity
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor system and user activity, track events, and troubleshoot issues
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SettingsIcon} className="size-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field>
                  <FieldLabel>
                    <Label>Start Date</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <Label>End Date</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <Label>Category</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || "all")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                        <SelectItem value="Automation">Automation</SelectItem>
                        <SelectItem value="Queue">Queue</SelectItem>
                        <SelectItem value="Storage">Storage</SelectItem>
                        <SelectItem value="Auth">Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <Label>Status</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value || "all")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Success">Success</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-background border-b border-border z-10">
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Timestamp
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Actor
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Category
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Action
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => {
                        const statusInfo = statusConfig[log.status]
                        const StatusIcon = statusInfo.icon
                        return (
                          <tr
                            key={log.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                  icon={log.actor === "User" ? UserIcon : SettingsIcon}
                                  className="size-4 text-muted-foreground"
                                />
                                <div className="text-sm">
                                  <div className="font-medium">{log.actor}</div>
                                  {log.actorName && (
                                    <div className="text-xs text-muted-foreground">
                                      {log.actorName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={categoryColors[log.category]}>
                                {log.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">{log.action}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={statusInfo.className}>
                                <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No logs found matching the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
