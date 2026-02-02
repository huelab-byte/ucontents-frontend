"use client"

import * as React from "react"
import { Suspense } from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
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
  ArrowLeft01Icon,
  MailSend01Icon,
  FileAttachmentIcon,
  Paperclip,
  Cancel01Icon,
  Pdf01Icon,
  Image01Icon,
  Video01Icon,
  Download01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { supportService, storageManagementService, type SupportTicket, type TicketStatus, type TicketPriority } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

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

// Helper to detect file type from mime type or filename
function getFileType(mimeType?: string, filename?: string): 'image' | 'video' | 'pdf' | 'other' {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType === 'application/pdf') return 'pdf'
  }
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image'
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video'
    if (ext === 'pdf') return 'pdf'
  }
  return 'other'
}

// Accepted file types for upload
const ACCEPTED_FILE_TYPES = "image/*,video/*,application/pdf"

function TicketDetailContent() {
  const router = useRouter()
  const params = useParams()
  const ticketId = Number(params.id)
  const { user: currentUser } = useAuth()

  const [ticket, setTicket] = React.useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [replyMessage, setReplyMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  // File upload state with progress tracking
  const [fileUploads, setFileUploads] = React.useState<Array<{
    file: File
    progress: number
    status: 'uploading' | 'completed' | 'error'
    fileId?: number
    abortFn?: () => void
  }>>([])
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Derived state
  const isUploading = fileUploads.some(f => f.status === 'uploading')
  const uploadedFileIds = fileUploads.filter(f => f.status === 'completed' && f.fileId).map(f => f.fileId!)

  const fetchTicket = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await supportService.getTicket(ticketId)
      if (response.success && response.data) {
        setTicket(response.data)
      } else {
        toast.error("Failed to load ticket")
        router.push("/support/tickets")
      }
    } catch (error) {
      toast.error("Failed to load ticket")
      router.push("/support/tickets")
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
    if (ticket && (ticket.public_replies || ticket.replies)) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [ticket?.public_replies, ticket?.replies])

  // Store Pusher instance in ref to persist across renders
  const pusherRef = React.useRef<any>(null)
  const channelRef = React.useRef<any>(null)
  const userIdRef = React.useRef<number | null>(null)

  // Real-time updates via Pusher - setup when ticket user ID is available
  React.useEffect(() => {
    const userId = ticket?.user?.id
    if (!ticketId || !userId) return

    // Cleanup function
    const cleanup = () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
      userIdRef.current = null
    }

    // Don't setup if already connected to the same user's channel
    if (pusherRef.current && userIdRef.current === userId) {
      return
    }

    // Clean up existing connection if user changed
    if (pusherRef.current) {
      cleanup()
    }

    const setupPusher = async () => {
      try {
        const Pusher = (await import("pusher-js")).default
        const { notificationService } = await import("@/lib/api")
        
        // Fetch Pusher config from backend
        const configResponse = await notificationService.getPusherConfig()
        
        if (!configResponse.success || !configResponse.data?.enabled || !configResponse.data?.key || !configResponse.data?.cluster) {
          return
        }

        const { key: pusherKey, cluster: pusherCluster } = configResponse.data
        
        pusherRef.current = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authorizer: (channel: any) => ({
            authorize: async (socketId: string, callback: any) => {
              try {
                const response = await notificationService.getPusherAuth(socketId, channel.name)
                if (response.success && response.data) {
                  callback(null, response.data)
                } else {
                  callback(new Error("Pusher auth failed"), null)
                }
              } catch (error) {
                callback(error, null)
              }
            },
          }),
        })

        // Subscribe to user's private channel for ticket updates
        const channelName = `private-user.${userId}`
        channelRef.current = pusherRef.current.subscribe(channelName)
        userIdRef.current = userId
        
        channelRef.current.bind("pusher:subscription_succeeded", () => {
          // Successfully subscribed
        })
        
        channelRef.current.bind("pusher:subscription_error", () => {
          // Subscription error handled silently
        })
        
        channelRef.current.bind("support.ticket.reply", (data: any) => {
          // Compare as numbers to handle type mismatch
          if (Number(data.ticket_id) === Number(ticketId) && data.reply) {
            // Add the new reply directly to state instead of refetching
            setTicket((prevTicket) => {
              if (!prevTicket) return prevTicket
              
              // Check if reply already exists (might be our own reply we just sent)
              const existingReplies = prevTicket.public_replies || prevTicket.replies || []
              const replyExists = existingReplies.some((r: any) => r.id === data.reply.id)
              if (replyExists) {
                return prevTicket
              }
              
              // Add the new reply
              const updatedReplies = [...existingReplies, data.reply]
              return {
                ...prevTicket,
                public_replies: updatedReplies,
                replies: updatedReplies,
                last_replied_at: data.reply.created_at,
              }
            })
            // Scroll to the new message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          }
        })

        // Listen for ticket status changes
        channelRef.current.bind("ticket-status-changed", (data: any) => {
          // Compare as numbers to handle type mismatch (ticketId from URL is string, data.ticket_id is number)
          if (Number(data.ticket_id) === Number(ticketId)) {
            setTicket((prevTicket) => {
              if (!prevTicket) return prevTicket
              return {
                ...prevTicket,
                status: data.new_status,
              }
            })
          }
        })
      } catch (error) {
        // Real-time updates disabled
      }
    }

    setupPusher()

    return cleanup
  }, [ticketId, ticket?.user?.id]) // Only depend on ticketId and user ID

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Add files to state with initial uploading status
    const newUploads = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))
    
    const startIndex = fileUploads.length
    setFileUploads(prev => [...prev, ...newUploads])

    // Upload each file with progress tracking
    files.forEach((file, i) => {
      const fileIndex = startIndex + i
      const path = `support/${ticketId}/${Date.now()}-${file.name}`
      
      const { promise, abort } = storageManagementService.uploadFileWithProgress(
        file,
        path,
        (progress) => {
          setFileUploads(prev => prev.map((f, idx) => 
            idx === fileIndex ? { ...f, progress } : f
          ))
        }
      )

      // Store abort function
      setFileUploads(prev => prev.map((f, idx) => 
        idx === fileIndex ? { ...f, abortFn: abort } : f
      ))

      promise.then(response => {
        const data = response.success ? response.data : undefined
        if (data) {
          setFileUploads(prev => prev.map((f, idx) => 
            idx === fileIndex ? { ...f, status: 'completed', progress: 100, fileId: data.id } : f
          ))
        } else {
          setFileUploads(prev => prev.map((f, idx) => 
            idx === fileIndex ? { ...f, status: 'error', progress: 0 } : f
          ))
          toast.error(`Failed to upload ${file.name}`)
        }
      }).catch(() => {
        setFileUploads(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'error', progress: 0 } : f
        ))
        toast.error(`Failed to upload ${file.name}`)
      })
    })

    // Reset file input
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    const upload = fileUploads[index]
    // Abort upload if still in progress
    if (upload?.status === 'uploading' && upload.abortFn) {
      upload.abortFn()
    }
    setFileUploads(prev => prev.filter((_, i) => i !== index))
  }

  const handleReply = async () => {
    if (!replyMessage.trim() && uploadedFileIds.length === 0) {
      toast.error("Please enter a message or attach a file")
      return
    }

    // Store message and clear input immediately for instant feel
    const messageToSend = replyMessage
    const filesToSend = uploadedFileIds
    
    // Optimistically add the message to UI
    const tempId = `temp-${Date.now()}`
    const now = new Date().toISOString()
    const optimisticReply = {
      id: tempId,
      message: messageToSend,
      user: currentUser ? { id: Number(currentUser.id), name: currentUser.name, email: currentUser.email } : null,
      is_internal: false,
      attachments: [],
      created_at: now,
      updated_at: now,
    } as any
    
    setTicket((prev) => {
      if (!prev) return prev
      const existingReplies = prev.public_replies || prev.replies || []
      return {
        ...prev,
        public_replies: [...existingReplies, optimisticReply],
        replies: [...existingReplies, optimisticReply],
      }
    })
    
    // Clear input immediately
    setReplyMessage("")
    setFileUploads([])
    
    // Scroll to new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)

    // Send to server in background
    try {
      const response = await supportService.replyToTicket(ticketId, {
        message: messageToSend,
        attachments: filesToSend,
      })

      if (response.success && response.data) {
        // Update with real data from server (replaces optimistic update)
        setTicket(response.data)
      }
    } catch (error) {
      toast.error("Failed to send reply")
      // Revert optimistic update on error
      setTicket((prev) => {
        if (!prev) return prev
        const existingReplies = prev.public_replies || prev.replies || []
        return {
          ...prev,
          public_replies: existingReplies.filter((r: any) => r.id !== tempId),
          replies: existingReplies.filter((r: any) => r.id !== tempId),
        }
      })
      // Restore message so user can retry
      setReplyMessage(messageToSend)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
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
    // For customers, use public_replies if available (already filtered), otherwise filter replies
    ...(ticket.public_replies 
      ? ticket.public_replies.map((reply) => ({
          id: `reply-${reply.id}`,
          message: reply.message,
          user: reply.user,
          isInternal: false,
          attachments: reply.attachments,
          createdAt: reply.created_at,
          isInitial: false,
        }))
      : (ticket.replies || [])
          .filter((reply) => !reply.is_internal)
          .map((reply) => ({
            id: `reply-${reply.id}`,
            message: reply.message,
            user: reply.user,
            isInternal: false,
            attachments: reply.attachments,
            createdAt: reply.created_at,
            isInitial: false,
          }))
    ),
  ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/support/tickets">
              <Button variant="ghost" size="sm">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
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
            {/* Chat Messages */}
            <Card className="flex flex-col" style={{ height: "calc(100vh - 400px)", minHeight: "500px" }}>
              <CardHeader className="border-b">
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {allMessages.map((msg) => {
                  // Check if message is from the current user (sender on right)
                  const isCurrentUser = String(msg.user?.id) === String(currentUser?.id)
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isCurrentUser && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[75%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <div className={`rounded-lg px-4 py-3 ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}>
                          {msg.message && (
                            <p className={`text-sm whitespace-pre-wrap ${isCurrentUser ? "text-primary-foreground" : ""}`}>
                              {msg.message}
                            </p>
                          )}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={`space-y-2 ${msg.message ? "mt-3 border-t pt-2 border-current/20" : ""}`}>
                              {msg.attachments.map((attachment) => {
                                const fileType = getFileType(attachment.storage_file.mime_type, attachment.storage_file.original_name)
                                
                                if (fileType === 'image') {
                                  return (
                                    <div key={attachment.id} className="group relative">
                                      <div className="cursor-pointer" onClick={() => setLightboxUrl(attachment.storage_file.url)}>
                                        <img 
                                          src={attachment.storage_file.url} 
                                          alt={attachment.storage_file.original_name}
                                          className="max-w-[200px] max-h-[150px] rounded-md object-cover hover:opacity-90 transition-opacity"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className={`text-xs ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                          {attachment.storage_file.original_name}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            supportService.downloadAttachment(attachment.storage_file.id, attachment.storage_file.original_name, false)
                                          }}
                                          className={`p-1 rounded hover:bg-black/10 transition-colors ${isCurrentUser ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                          title="Download"
                                        >
                                          <HugeiconsIcon icon={Download01Icon} className="size-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                if (fileType === 'video') {
                                  return (
                                    <div key={attachment.id} className="max-w-[280px]">
                                      <video 
                                        src={attachment.storage_file.url} 
                                        controls
                                        className="rounded-md w-full"
                                        preload="metadata"
                                      />
                                      <div className="flex items-center justify-between mt-1">
                                        <span className={`text-xs ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                          {attachment.storage_file.original_name}
                                        </span>
                                        <button
                                          onClick={() => supportService.downloadAttachment(attachment.storage_file.id, attachment.storage_file.original_name, false)}
                                          className={`p-1 rounded hover:bg-black/10 transition-colors ${isCurrentUser ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                          title="Download"
                                        >
                                          <HugeiconsIcon icon={Download01Icon} className="size-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                }
                                
                                // PDF and other files
                                const icon = fileType === 'pdf' ? Pdf01Icon : FileAttachmentIcon
                                return (
                                  <div
                                    key={attachment.id}
                                    className={`flex items-center gap-2 text-xs ${
                                      isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
                                    }`}
                                  >
                                    <HugeiconsIcon icon={icon} className="size-4" />
                                    <span>{attachment.storage_file.original_name}</span>
                                    <span className="opacity-70">
                                      ({(attachment.storage_file.size / 1024).toFixed(1)} KB)
                                    </span>
                                    <button
                                      onClick={() => supportService.downloadAttachment(attachment.storage_file.id, attachment.storage_file.original_name, false)}
                                      className={`p-1 rounded hover:bg-black/10 transition-colors ${isCurrentUser ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                      title="Download"
                                    >
                                      <HugeiconsIcon icon={Download01Icon} className="size-3" />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{msg.user?.name || "Unknown"}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(msg.createdAt)}</span>
                        </div>
                      </div>
                      {isCurrentUser && (
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
            {ticket.status !== "closed" && ticket.status !== "resolved" ? (
              <Card>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (replyMessage.trim() || uploadedFileIds.length > 0) {
                            handleReply()
                          }
                        }
                      }}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="file-upload-customer"
                          multiple
                          accept={ACCEPTED_FILE_TYPES}
                          onChange={handleFileSelect}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <HugeiconsIcon icon={Paperclip} className="size-4" />
                        </Button>
                        {fileUploads.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {fileUploads.map((upload, index) => (
                              <Badge
                                key={index}
                                variant={upload.status === 'error' ? 'destructive' : 'secondary'}
                                className="flex items-center gap-2 py-1 px-2"
                              >
                                <span className="truncate max-w-[120px]">{upload.file.name}</span>
                                {upload.status === 'uploading' && (
                                  <span className="text-xs font-medium min-w-[32px] text-right">{upload.progress}%</span>
                                )}
                                {upload.status === 'completed' && (
                                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3 text-green-500" />
                                )}
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
                        disabled={isSubmitting || isUploading || (!replyMessage.trim() && uploadedFileIds.length === 0)}
                      >
                        <HugeiconsIcon icon={MailSend01Icon} className="size-4 mr-2" />
                        {isSubmitting ? "Sending..." : isUploading ? "Uploading..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="pt-0">
                  <div className="text-center text-muted-foreground py-4">
                    <p className="font-medium">This ticket has been {ticket.status}</p>
                    <p className="text-sm mt-1">You cannot send new messages to a {ticket.status} ticket.</p>
                    <p className="text-sm mt-2">If you need further assistance, please create a new ticket.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{ticket.subject}</CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={statusConfigItem.className}>
                    <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                    {statusConfigItem.label}
                  </Badge>
                  <Badge variant="outline" className={priorityConfigItem.className}>
                    {priorityConfigItem.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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
                {ticket.category && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="capitalize">{ticket.category}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Lightbox Modal */}
        {lightboxUrl && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setLightboxUrl(null)}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-8" />
            </button>
            <img 
              src={lightboxUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
  )
}

export default function CustomerTicketDetailPage() {
  return (
    <CustomerDashboardLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <TicketDetailContent />
      </Suspense>
    </CustomerDashboardLayout>
  )
}
