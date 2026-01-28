"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type NotificationType = "error" | "warning" | "info" | "success"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

interface NotificationsBarProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  position?: "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center"
}

const notificationVariants = {
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive",
    text: "text-destructive",
    icon: Alert01Icon,
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500",
    text: "text-yellow-600",
    icon: Alert01Icon,
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    text: "text-blue-600",
    icon: Alert01Icon,
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500",
    text: "text-green-600",
    icon: Alert01Icon,
  },
}

const positionClasses = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
}

function NotificationsBar({
  notifications,
  onDismiss,
  position = "top-right",
}: NotificationsBarProps) {
  if (notifications.length === 0) return null

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 max-w-md w-full",
        positionClasses[position]
      )}
    >
      {notifications.map((notification) => {
        const variant = notificationVariants[notification.type]
        const Icon = variant.icon

        return (
          <Alert
            key={notification.id}
            className={cn(
              "shadow-lg border-2 animate-in slide-in-from-top-5",
              variant.bg,
              variant.border
            )}
          >
            <div className="flex items-start gap-3">
              <HugeiconsIcon
                icon={Icon}
                strokeWidth={2}
                className={cn("size-5 mt-0.5 shrink-0", variant.text)}
              />
              <div className="flex-1 min-w-0">
                <AlertTitle className={cn("font-semibold", variant.text)}>
                  {notification.title}
                </AlertTitle>
                {notification.message && (
                  <AlertDescription className="text-sm mt-1">
                    {notification.message}
                  </AlertDescription>
                )}
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className={cn(
                  "hover:bg-background/50 rounded-md p-1 transition-colors",
                  variant.text
                )}
                aria-label="Dismiss notification"
              >
                <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} className="size-4" />
              </button>
            </div>
          </Alert>
        )
      })}
    </div>
  )
}

export { NotificationsBar }
