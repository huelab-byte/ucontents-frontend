"use client"

import * as React from "react"
import { Suspense } from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Ticket01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Queue01Icon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  MailSend01Icon,
  FileAttachmentIcon,
  Paperclip,
  CheckmarkCircle02Icon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import { supportService, storageManagementService, userService, type SupportTicket, type SupportTicketReply, type TicketStatus, type TicketPriority, type User } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

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

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
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

function TicketDetailContent() {
  const router = useRouter()
  const params = useParams()
  const ticketId = Number(params.id)

  const [ticket, setTicket] = React.useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [replyMessage, setReplyMessage] = React.useState("")
  const [isInternal, setIsInternal] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [uploadedFileIds, setUploadedFileIds] = React.useState<number[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [adminUsers, setAdminUsers] = React.useState<User[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const fetchTicket = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await supportService.getTicketAdmin(ticketId)
      if (response.success && response.data) {
        setTicket(response.data)
      } else {
        toast.error("Failed to load ticket")
        router.push("/admin/support")
      }
    } catch (error) {
      toast.error("Failed to load ticket")
      router.push("/admin/support")
    } finally {
      setIsLoading(false)
    }
  }, [ticketId, router])

  React.useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId, fetchTicket])

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (ticket && ticket.replies) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [ticket?.replies])

  // Fetch admin users for assignment
  React.useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await userService.getAll({ filter: { role: "admin" } })
        if (response.success && response.data) {
          setAdminUsers(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch admin users:", error)
        toast.error("Failed to load admin users")
      }
    }
    fetchAdminUsers()
  }, [])

  const handleAssignTicket = async (userId: number | null) => {
    try {
      const response = await supportService.assignTicket(ticketId, {
        assigned_to_user_id: userId,
      })
      if (response.success && response.data) {
        setTicket(response.data)
        toast.success(userId ? "Ticket assigned successfully" : "Ticket unassigned")
      }
    } catch (error) {
      toast.error("Failed to assign ticket")
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles((prev) => [...prev, ...files])
    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `support/${ticketId}/${Date.now()}-${file.name}`
        const response = await storageManagementService.uploadFile(file, path)
        if (response.success && response.data) {
          return response.data.id
        }
        return null
      })

      const uploadedIds = (await Promise.all(uploadPromises)).filter((id): id is number => id !== null)
      setUploadedFileIds((prev) => [...prev, ...uploadedIds])
      if (uploadedIds.length < files.length) {
        toast.warning("Some files failed to upload")
      } else {
        toast.success("Files uploaded successfully")
      }
    } catch (error) {
      toast.error("Failed to upload files")
    } finally {
      setIsUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const removeFile = (index: number, fileId?: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    if (fileId) {
      setUploadedFileIds((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const handleReply = async () => {
    if (!replyMessage.trim() && uploadedFileIds.length === 0) {
      toast.error("Please enter a message or attach a file")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await supportService.replyToTicketAdmin(ticketId, {
        message: replyMessage,
        attachments: uploadedFileIds,
        is_internal: isInternal,
      })

      if (response.success && response.data) {
        setTicket(response.data)
        setReplyMessage("")
        setIsInternal(false)
        setSelectedFiles([])
        setUploadedFileIds([])
        toast.success(isInternal ? "Internal note added" : "Reply sent successfully")
        // Scroll to bottom after reply
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (error) {
      toast.error("Failed to send reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const response = await supportService.updateTicketStatus(ticketId, { status: newStatus })
      if (response.success && response.data) {
        setTicket(response.data)
        toast.success("Ticket status updated")
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      const response = await supportService.updateTicketPriority(ticketId, { priority: newPriority })
      if (response.success && response.data) {
        setTicket(response.data)
        toast.success("Ticket priority updated")
      }
    } catch (error) {
      toast.error("Failed to update priority")
    }
  }

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (!ticket) {
    return null
  }

  const statusConfigItem = statusConfig[ticket.status]
  const priorityConfigItem = priorityConfig[ticket.priority]
  const StatusIcon = statusConfigItem.icon

  // Combine initial description with replies for chat view
  const allMessages: Array<{
    id: string
    message: string
    user: { id: number; name: string; email: string } | undefined
    isInternal: boolean
    attachments?: Array<{ id: number; storage_file: any }>
    createdAt: string
    isInitial: boolean
  }> = [
    {
      id: `initial-${ticket.id}`,
      message: ticket.description,
      user: ticket.user,
      isInternal: false,
      attachments: ticket.attachments,
      createdAt: ticket.created_at,
      isInitial: true,
    },
    ...(ticket.replies || []).map((reply) => ({
      id: `reply-${reply.id}`,
      message: reply.message,
      user: reply.user,
      isInternal: reply.is_internal,
      attachments: reply.attachments,
      createdAt: reply.created_at,
      isInitial: false,
    })),
  ]

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/support">
              <Button variant="ghost" size="sm">
                <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 mr-2" />
                Back to Tickets
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <HugeiconsIcon icon={Ticket01Icon} className="size-8" />
                {ticket.ticket_number}
              </h1>
              <p className="text-muted-foreground mt-1">{ticket.subject}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ticket Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{ticket.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusConfigItem.className}>
                      <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                      {statusConfigItem.label}
                    </Badge>
                    <Badge variant="outline" className={priorityConfigItem.className}>
                      {priorityConfigItem.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{ticket.user?.name}</span>
                    <span className="text-muted-foreground">({ticket.user?.email})</span>
                  </div>
                  {ticket.assigned_to && (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{ticket.assigned_to.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                  {ticket.last_replied_at && (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last reply:</span>
                      <span>{formatRelativeTime(ticket.last_replied_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="flex flex-col" style={{ height: "calc(100vh - 400px)", minHeight: "500px" }}>
              <CardHeader className="border-b">
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {allMessages.map((msg, index) => {
                  // Check if message is from admin (not the ticket creator)
                  const isAdmin = msg.user?.id !== ticket.user?.id
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      {!isAdmin && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[75%] ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className={`rounded-lg px-4 py-3 ${
                          msg.isInternal
                            ? "bg-amber-500/10 border border-amber-500/20"
                            : isAdmin
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}>
                          {msg.isInternal && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-amber-600 dark:text-amber-400">
                              <HugeiconsIcon icon={LockIcon} className="size-3" />
                              <span>Internal Note</span>
                            </div>
                          )}
                          <p className={`text-sm whitespace-pre-wrap ${isAdmin && !msg.isInternal ? "text-primary-foreground" : ""}`}>
                            {msg.message}
                          </p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-2 border-t pt-2 border-current/20">
                              {msg.attachments.map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={attachment.storage_file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 text-xs hover:opacity-80 transition-opacity ${
                                    isAdmin && !msg.isInternal ? "text-primary-foreground/80" : "text-muted-foreground"
                                  }`}
                                >
                                  <HugeiconsIcon icon={FileAttachmentIcon} className="size-4" />
                                  <span className="underline">{attachment.storage_file.original_name}</span>
                                  <span className="text-xs opacity-70">
                                    ({(attachment.storage_file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${isAdmin ? "text-muted-foreground" : "text-muted-foreground"}`}>
                          <span className="font-medium">{msg.user?.name || "Unknown"}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(msg.createdAt)}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Reply Form */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal-note"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="internal-note" className="text-sm flex items-center gap-2 cursor-pointer">
                      <HugeiconsIcon icon={LockIcon} className="size-4" />
                      Internal note (not visible to user)
                    </label>
                  </div>
                  <Textarea
                    placeholder={isInternal ? "Add an internal note..." : "Type your reply..."}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          className="cursor-pointer"
                        >
                          <HugeiconsIcon icon={Paperclip} className="size-4 mr-2" />
                          {isUploading ? "Uploading..." : "Attach Files"}
                        </Button>
                      </label>
                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((file, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {file.name}
                              <button
                                onClick={() => removeFile(index)}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleReply}
                      disabled={isSubmitting || (!replyMessage.trim() && uploadedFileIds.length === 0)}
                    >
                      <HugeiconsIcon icon={MailSend01Icon} className="size-4 mr-2" />
                      {isSubmitting ? "Sending..." : isInternal ? "Add Note" : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                {ticket.category && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm capitalize">
                      {ticket.category}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-2 block">Assign To</label>
                  <select
                    value={ticket.assigned_to?.id || ""}
                    onChange={(e) => handleAssignTicket(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-medium">{ticket.user?.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-medium">{ticket.user?.email}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}

export default function AdminTicketDetailPage() {
  return (
    <AdminDashboardLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <TicketDetailContent />
      </Suspense>
    </AdminDashboardLayout>
  )
}
