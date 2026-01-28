"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  PlusSignIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  FileAttachmentIcon,
  Queue01Icon,
  Image01Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"

interface BugReport {
  id: string
  title: string
  status: "open" | "in-progress" | "resolved" | "closed"
  category: string
  date: string
}

const demoBugReports: BugReport[] = [
  {
    id: "1",
    title: "Content generation fails with special characters",
    status: "open",
    category: "Bug",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Social automation not posting scheduled content",
    status: "in-progress",
    category: "Bug",
    date: "2024-01-14",
  },
  {
    id: "3",
    title: "Video upload times out for large files",
    status: "resolved",
    category: "Bug",
    date: "2024-01-12",
  },
  {
    id: "4",
    title: "UI inconsistency in dashboard analytics",
    status: "open",
    category: "UI/UX",
    date: "2024-01-10",
  },
  {
    id: "5",
    title: "API rate limit error not displayed clearly",
    status: "closed",
    category: "Enhancement",
    date: "2024-01-08",
  },
  {
    id: "6",
    title: "Template library search returns no results",
    status: "in-progress",
    category: "Bug",
    date: "2024-01-07",
  },
]

const statusConfig = {
  open: {
    label: "Open",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: AlertCircleIcon,
  },
  "in-progress": {
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

const categoryConfig: Record<string, string> = {
  Bug: "bg-red-500/10 text-red-600 border-red-500/20",
  "UI/UX": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Enhancement: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Performance: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

function NewBugReportDialog() {
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    // Reset form and close dialog
    setSubject("")
    setCategory("")
    setDescription("")
    setFile(null)
    setOpen(false)
  }

  const handleCancel = () => {
    setSubject("")
    setCategory("")
    setDescription("")
    setFile(null)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            New Bug Report
          </Button>
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
        New Bug Report
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Report a Bug or Issue</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Subject</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Brief description of the bug or issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Category</Label>
              </FieldLabel>
              <FieldContent>
                <Select value={category} onValueChange={(value) => setCategory(value || "")} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="Enhancement">Enhancement</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Description</Label>
              </FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder="Describe the bug or issue in detail. Include steps to reproduce if possible..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label className="text-muted-foreground font-normal">
                  Screenshot/Attachment (Optional)
                </Label>
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                  <Input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer w-full sm:flex-1 file:mr-2 sm:file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:whitespace-nowrap overflow-hidden"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                      <HugeiconsIcon
                        icon={file.type.startsWith("image/") ? Image01Icon : FileAttachmentIcon}
                        className="size-3 sm:size-4"
                      />
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                    </div>
                  )}
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Submit Report</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function ReportIssuePage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={Alert01Icon} className="size-8" />
              Report Issue
            </h1>
            <p className="text-muted-foreground mt-2">
              Report bugs, issues, or provide feedback to help improve automation, content
              generation, and platform features
            </p>
          </div>
          <NewBugReportDialog />
        </div>

        {demoBugReports.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Title
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Category
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {demoBugReports.map((report) => {
                    const status = statusConfig[report.status]
                    const StatusIcon = status.icon
                    const categoryStyle = categoryConfig[report.category] || categoryConfig.Other
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={status.className}>
                            <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{report.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 md:hidden">
                            {formatDate(report.date)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={categoryStyle}>
                            {report.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {formatDate(report.date)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <HugeiconsIcon
                icon={Alert01Icon}
                className="size-12 mx-auto text-muted-foreground mb-4"
              />
              <CardTitle className="mb-2">No bug reports yet</CardTitle>
              <p className="text-muted-foreground mb-4">
                Report your first bug or issue to get started.
              </p>
              <NewBugReportDialog />
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerDashboardLayout>
  )
}
