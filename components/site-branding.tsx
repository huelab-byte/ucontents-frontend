"use client"

import { useGeneralSettings } from '@/lib/hooks/use-general-settings'
import { HugeiconsIcon } from '@hugeicons/react'
import { DashboardSpeed01Icon, ImageIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

interface SiteBrandingProps {
  showText?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
}

/**
 * Component that displays site icon and name from general settings
 * Uses site_icon (not logo) for sidebar branding
 */
export function SiteBranding({ 
  showText = true, 
  className,
  iconClassName,
  textClassName 
}: SiteBrandingProps) {
  const { settings, loading } = useGeneralSettings()

  const siteName = settings?.branding?.site_name || 'uContents'
  const siteIcon = settings?.branding?.site_icon

  // Helper to convert relative path to absolute URL
  const getImageUrl = (path: string | undefined): string | null => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    const normalizedPath = path.startsWith('/') ? path : '/' + path
    return `${apiBase}${normalizedPath}`
  }

  if (loading) {
    const loadingIconSize = showText ? "h-8 w-8" : "h-10 w-10"
    return (
      <div className={cn("flex items-center", showText ? "gap-2" : "justify-center w-full", className)}>
        <div className={cn("flex", loadingIconSize, "items-center justify-center rounded-lg bg-primary text-primary-foreground", iconClassName)}>
          <HugeiconsIcon icon={DashboardSpeed01Icon} strokeWidth={1.5} className={showText ? "size-3.5" : "size-4"} />
        </div>
        {showText && (
          <span className={cn("font-semibold text-lg", textClassName)}>uContents</span>
        )}
      </div>
    )
  }

  // Use site_icon only (not logo) for sidebar branding
  const iconUrl = siteIcon ? getImageUrl(siteIcon) : null
  
  // Use larger icon size when sidebar is collapsed (showText=false)
  const iconSize = showText ? "h-8 w-8" : "h-10 w-10"

  return (
    <div className={cn("flex items-center", showText ? "gap-2" : "justify-center w-full", className)}>
      {iconUrl ? (
        <img 
          src={iconUrl} 
          alt={siteName}
          className={cn(iconSize, "object-contain shrink-0", iconClassName)}
          onError={(e) => {
            // If image fails to load, try constructing from stored path
            const target = e.target as HTMLImageElement
            if (siteIcon && !siteIcon.startsWith('http')) {
              const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
              const normalizedPath = siteIcon.startsWith('/') ? siteIcon : '/' + siteIcon
              const newUrl = `${apiBase}${normalizedPath}`
              if (target.src !== newUrl) {
                target.src = newUrl
              }
            }
          }}
        />
      ) : (
        <div className={cn(iconSize, "flex items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0", iconClassName)}>
          <HugeiconsIcon icon={DashboardSpeed01Icon} strokeWidth={1.5} className={showText ? "size-3.5" : "size-4"} />
        </div>
      )}
      {showText && (
        <span className={cn("font-semibold text-lg truncate", textClassName)}>
          {siteName}
        </span>
      )}
    </div>
  )
}
