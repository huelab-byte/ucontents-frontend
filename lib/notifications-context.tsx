"use client"

import * as React from "react"
import {
  notificationService,
  type NotificationRecipient,
} from "@/lib/api"

interface NotificationsContextValue {
  notifications: NotificationRecipient[]
  unreadCount: number
  isLoading: boolean
  refresh: () => Promise<void>
  markAsRead: (recipientId: number) => Promise<void>
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null)

export function useNotifications() {
  const context = React.useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}

interface NotificationsProviderProps {
  children: React.ReactNode
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = React.useState<NotificationRecipient[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getNotifications({ page: 1, per_page: 20 }),
        notificationService.getUnreadCount(),
      ])

      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data)
      }
      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.unread_count)
      }
    } catch (error) {
      console.error("Failed to refresh notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = React.useCallback(async (recipientId: number) => {
    try {
      const res = await notificationService.markAsRead(recipientId)
      if (res.success && res.data) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === recipientId ? res.data! : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }, [])

  // Track if initial load has run (prevents double execution in StrictMode)
  const hasInitialLoadRef = React.useRef(false)

  // Initial load
  React.useEffect(() => {
    if (hasInitialLoadRef.current) return
    hasInitialLoadRef.current = true
    refresh()
  }, [refresh])

  // Poll for updates every 60 seconds (fallback if Pusher not configured)
  React.useEffect(() => {
    const interval = setInterval(() => {
      notificationService.getUnreadCount().then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unread_count)
        }
      }).catch((error) => {
        console.error("Failed to fetch unread count:", error)
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refresh,
      markAsRead,
    }),
    [notifications, unreadCount, isLoading, refresh, markAsRead]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}
