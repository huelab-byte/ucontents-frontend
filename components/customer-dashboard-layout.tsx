"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/customer-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  NotificationIcon,
  Alert01Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/lib/notifications-context"
import type { NotificationSeverity, NotificationRecipient } from "@/lib/api"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const notificationVariants: Record<NotificationSeverity | 'default', {
  bg: string
  border: string
  text: string
  icon: typeof Alert01Icon
}> = {
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive",
    text: "text-destructive",
    icon: Alert01Icon,
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
    icon: AlertCircleIcon,
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    icon: InformationCircleIcon,
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500",
    text: "text-green-600 dark:text-green-400",
    icon: CheckmarkCircle01Icon,
  },
  default: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
    icon: InformationCircleIcon,
  },
}

/**
 * Get the appropriate notification URL based on user role.
 * Customer users use /support/tickets/{id}, admins use /admin/support/{id}.
 */
function getNotificationUrl(recipient: NotificationRecipient, isAdmin: boolean): string | null {
  const url = recipient.notification.url
  if (!url) return null

  // Transform support ticket URLs for admin users
  if (isAdmin && url.startsWith('/support/tickets/')) {
    const ticketId = url.split('/').pop()
    return `/admin/support/${ticketId}`
  }

  return url
}

function HeaderContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, refresh, isLoading } = useNotifications()
  const [showNotifications, setShowNotifications] = React.useState(false)

  // Close dropdown on navigation to prevent portal cleanup errors
  React.useEffect(() => {
    setShowNotifications(false)
  }, [pathname])

  const handleMarkAsRead = React.useCallback(async (recipientId: number) => {
    await markAsRead(recipientId)
  }, [markAsRead])

  const handleMarkAllAsRead = React.useCallback(async () => {
    await markAllAsRead()
  }, [markAllAsRead])

  const handleClearAll = React.useCallback(async () => {
    await clearAll()
  }, [clearAll])

  const handleNotificationClick = React.useCallback((recipient: NotificationRecipient) => {
    const url = getNotificationUrl(recipient, false) // Customer dashboard - not admin
    
    // Mark as read if unread
    if (!recipient.read_at) {
      markAsRead(recipient.id)
    }
    
    // Navigate if URL exists
    if (url) {
      setShowNotifications(false)
      router.push(url)
    }
  }, [markAsRead, router])
  
  const handleNotificationsOpenChange = React.useCallback((open: boolean) => {
    setShowNotifications(open)
    // Refresh notifications when dropdown opens to get latest data
    if (open) {
      refresh()
    }
  }, [refresh])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 px-4">
        <Button
          variant="default"
          size="sm"
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90 font-medium gap-2",
            (pathname === "/compose" || pathname?.startsWith("/social-automation")) && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
          onClick={() => router.push("/compose")}
        >
          <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="size-4" />
          Compose
        </Button>
        <ThemeToggle />
        <DropdownMenu open={showNotifications} onOpenChange={handleNotificationsOpenChange}>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-9 relative" />}>
            <HugeiconsIcon icon={NotificationIcon} strokeWidth={1.5} className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications ({unreadCount} unread)</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto p-0"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-3.5 mr-1" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={handleClearAll}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="size-3.5 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((recipient) => {
                  const notification = recipient.notification
                  const severity = notification.severity || 'default'
                  const variant = notificationVariants[severity] || notificationVariants.default
                  const Icon = variant.icon
                  const isUnread = !recipient.read_at
                  const hasUrl = !!getNotificationUrl(recipient, false)

                  return (
                    <div
                      key={recipient.id}
                      className={cn(
                        "mb-2 last:mb-0 rounded-lg border p-3 shadow-sm transition-colors",
                        isUnread ? variant.bg : "bg-muted/30",
                        isUnread ? variant.border : "border-border",
                        "hover:bg-muted/50",
                        hasUrl ? "cursor-pointer" : "cursor-default"
                      )}
                      onClick={() => handleNotificationClick(recipient)}
                    >
                      <div className="flex items-start gap-3">
                        <HugeiconsIcon
                          icon={Icon}
                          strokeWidth={2}
                          className={cn("size-5 mt-0.5 shrink-0", isUnread ? variant.text : "text-muted-foreground")}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={cn("font-semibold text-sm", isUnread ? variant.text : "text-foreground")}>
                            {notification.title}
                          </div>
                          {notification.body && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.body}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1.5">
                            {new Date(notification.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(recipient.id)
                            }}
                            className={cn(
                              "hover:bg-background/50 rounded-md p-1 transition-colors shrink-0",
                              variant.text
                            )}
                            aria-label="Mark as read"
                            title="Mark as read"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function CustomerDashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <CustomerSidebar />
      <SidebarInset>
        <HeaderContent />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
