"use client"

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useGeneralSettings } from '@/lib/hooks/use-general-settings'

/**
 * Convert hex color to RGB (0-255)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert sRGB to linear RGB (gamma expansion)
 */
function srgbToLinear(c: number): number {
  c = c / 255
  if (c <= 0.04045) {
    return c / 12.92
  } else {
    return Math.pow((c + 0.055) / 1.055, 2.4)
  }
}

/**
 * Convert hex to oklch format using OKLab conversion matrices
 * Based on the OKLab color space specification
 */
function hexToOklch(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'oklch(0.65 0.18 132)' // Default fallback

  // Convert to linear RGB
  const rLin = srgbToLinear(rgb.r)
  const gLin = srgbToLinear(rgb.g)
  const bLin = srgbToLinear(rgb.b)

  // M1 matrix: linear RGB to LMS
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin

  // Cube root
  const lRoot = Math.cbrt(l)
  const mRoot = Math.cbrt(m)
  const sRoot = Math.cbrt(s)

  // M2 matrix: LMS to OKLab
  const L = 0.2104542553 * lRoot + 0.7936177850 * mRoot + -0.0040720468 * sRoot
  const a = 1.9779984951 * lRoot + -2.4285922050 * mRoot + 0.4505937099 * sRoot
  const b = 0.0259040371 * lRoot + 0.7827717662 * mRoot + -0.8086757660 * sRoot

  // Convert to OKLCH
  const C = Math.sqrt(a * a + b * b)
  let hRad = Math.atan2(b, a)
  let hDeg = (hRad * 180) / Math.PI
  if (hDeg < 0) hDeg += 360

  // Clamp values to reasonable ranges
  const clampedL = Math.max(0, Math.min(1, L))
  const clampedC = Math.max(0, Math.min(0.4, C)) // Chroma typically 0-0.4 for sRGB
  const clampedH = hDeg

  return `oklch(${clampedL.toFixed(3)} ${clampedC.toFixed(3)} ${clampedH.toFixed(1)})`
}

/**
 * Component that applies general settings to the site
 * - Updates document title and meta tags
 * - Sets favicon
 * - Applies primary theme colors for light and dark modes
 */
/**
 * Get page title based on pathname
 */
function getPageTitle(pathname: string): string | null {
  // Map of paths to page titles (ordered from most specific to least specific)
  const pageTitles: Record<string, string> = {
    // Admin pages
    '/admin/dashboard': 'Admin Dashboard',
    '/admin/users': 'Users',
    '/admin/footage-library/bgm': 'BGM Library',
    '/admin/footage-library/audio-library': 'Audio Library',
    '/admin/footage-library/video-overlays': 'Video Overlays',
    '/admin/footage-library/image-overlays': 'Image Overlays',
    '/admin/footage-library': 'Footage Library',
    '/admin/analytics': 'Analytics',
    '/admin/settings/general': 'General Settings',
    '/admin/settings/system': 'System Settings',
    '/admin/settings/auth': 'Auth Settings',
    '/admin/settings/clients': 'Client Settings',
    '/admin/settings/email': 'Email Configuration',
    '/admin/settings/storage': 'Storage Management',
    '/admin/settings/logs': 'Logs & Activity',
    '/admin/settings/team': 'Team Management',
    '/admin/settings/api-keys': 'API Keys',
    '/admin/profile': 'Profile',
    // Customer pages
    '/dashboard': 'Dashboard',
    '/social-automation/manual-posting': 'Manual Posting',
    '/social-automation/bulk-posting': 'Bulk Posting',
    '/social-automation': 'Social Automation',
    '/content-generation/topic-to-video': 'Topic to Video',
    '/content-generation/audio-to-video': 'Audio to Video',
    '/content-generation/image-contents': 'Image Contents',
    '/content-generation/text-contents': 'Text Contents',
    '/content-generation/playground': 'Content Playground',
    '/content-generation/content-sources': 'Content Sources',
    '/content-generation': 'Content Generation',
    '/templates/prompt-templates': 'Prompt Templates',
    '/templates': 'Templates',
    '/profile/subscription': 'Subscription',
    '/profile/usage': 'Usage',
    '/profile': 'Profile',
    '/support/tutorials': 'Tutorials',
    '/support/changelog': 'Changelog',
    '/support/report': 'Report Issue',
    '/support': 'Support',
  }

  // Check exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  // Check for partial matches (nested routes) - check longer paths first
  const sortedPaths = Object.entries(pageTitles).sort((a, b) => b[0].length - a[0].length)
  for (const [path, title] of sortedPaths) {
    if (pathname.startsWith(path + '/') || pathname === path) {
      return title
    }
  }

  return null
}

/**
 * Safely remove an element from the DOM
 */
function safeRemoveElement(element: Element | null): void {
  if (!element) return
  
  const parent = element.parentNode
  if (parent) {
    try {
      parent.removeChild(element)
    } catch (e) {
      // Element might have been removed already, ignore error
    }
  }
}

export function SiteSettingsProvider() {
  const { settings, loading } = useGeneralSettings()
  const { theme, resolvedTheme } = useTheme()
  const pathname = usePathname()
  const mountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (loading || !settings) return

    // Safety check: ensure document and document.head exist
    if (typeof document === 'undefined' || !document.head) return

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Defer DOM operations to next frame to avoid conflicts during navigation
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      if (typeof document === 'undefined' || !document.head) return

      try {
        const siteName = settings.branding?.site_name || settings.meta?.title || 'uContents'
        
        // Get page-specific title
        const pageTitle = getPageTitle(pathname)
        
        // Update document title
        if (pageTitle) {
          // Use format: "Page Title | Site Name"
          document.title = `${pageTitle} | ${siteName}`
        } else {
          // For pages without specific titles, use site name or meta title
          document.title = siteName
        }

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription && metaDescription.parentNode === document.head) {
          const description = settings.meta?.description || settings.branding?.site_description || ''
          if (description) {
            metaDescription.setAttribute('content', description)
          }
        } else if (settings.meta?.description || settings.branding?.site_description) {
          // Create meta description if it doesn't exist
          const meta = document.createElement('meta')
          meta.name = 'description'
          meta.content = settings.meta?.description || settings.branding?.site_description || ''
          if (document.head) {
            document.head.appendChild(meta)
          }
        }

        // Update meta keywords
        if (settings.meta?.keywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]')
          if (metaKeywords && metaKeywords.parentNode === document.head) {
            metaKeywords.setAttribute('content', settings.meta.keywords)
          } else {
            const meta = document.createElement('meta')
            meta.name = 'keywords'
            meta.content = settings.meta.keywords
            if (document.head) {
              document.head.appendChild(meta)
            }
          }
        }

        // Update favicon
        if (settings.branding?.favicon && document.head && mountedRef.current) {
          const faviconUrl = settings.branding.favicon
          
          // Only remove favicons we've added ourselves (marked with data attribute)
          // This prevents conflicts with Next.js's own favicon management
          const ourFavicons = Array.from(
            document.querySelectorAll('link[rel*="icon"][data-site-settings="true"]')
          )
          ourFavicons.forEach((link) => {
            safeRemoveElement(link)
          })

          // Check if favicon already exists with the correct href
          const existingFavicon = document.querySelector(`link[rel="icon"][href="${faviconUrl}"]`)
          if (!existingFavicon) {
            // Add new favicon only if it doesn't already exist
            const link = document.createElement('link')
            link.rel = 'icon'
            link.type = 'image/x-icon'
            link.href = faviconUrl
            link.setAttribute('data-site-settings', 'true')
            
            // Insert at the beginning of head so it takes precedence
            if (document.head.firstChild) {
              document.head.insertBefore(link, document.head.firstChild)
            } else {
              document.head.appendChild(link)
            }
          } else {
            // Mark existing favicon as ours if it matches
            existingFavicon.setAttribute('data-site-settings', 'true')
          }

          // Handle apple-touch-icon similarly
          const existingAppleIcon = document.querySelector(`link[rel="apple-touch-icon"][href="${faviconUrl}"]`)
          if (!existingAppleIcon) {
            const appleLink = document.createElement('link')
            appleLink.rel = 'apple-touch-icon'
            appleLink.href = faviconUrl
            appleLink.setAttribute('data-site-settings', 'true')
            
            if (document.head.firstChild) {
              document.head.insertBefore(appleLink, document.head.firstChild)
            } else {
              document.head.appendChild(appleLink)
            }
          } else {
            existingAppleIcon.setAttribute('data-site-settings', 'true')
          }
        }

        // Apply primary theme colors for both light and dark modes
        const lightColor = settings.branding?.primary_color_light
        const darkColor = settings.branding?.primary_color_dark

        if (lightColor || darkColor) {
          // Update theme-color meta tag (use light color for meta tag as it's for mobile browsers)
          const metaColor = lightColor || darkColor || '#000000'
          let themeColor = document.querySelector('meta[name="theme-color"]')
          if (themeColor && themeColor.parentNode === document.head) {
            themeColor.setAttribute('content', metaColor)
          } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = metaColor
            if (document.head && mountedRef.current) {
              document.head.appendChild(meta)
            }
          }

          // Inject CSS to override primary colors for both themes
          let styleElement = document.getElementById('site-theme-colors')
          if (!styleElement) {
            styleElement = document.createElement('style')
            styleElement.id = 'site-theme-colors'
            if (document.head && mountedRef.current) {
              document.head.appendChild(styleElement)
            }
          }

          // Build CSS with both light and dark mode overrides
          if (styleElement && mountedRef.current) {
            let css = ''
            
            if (lightColor) {
              const lightOklch = hexToOklch(lightColor)
              css += `:root { --primary: ${lightOklch}; }\n`
            }
            
            if (darkColor) {
              const darkOklch = hexToOklch(darkColor)
              css += `.dark { --primary: ${darkOklch}; }\n`
            }

            styleElement.textContent = css
          }
        }
      } catch (error) {
        // Silently handle DOM manipulation errors during navigation
      }
    }, 0)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [settings, loading, theme, resolvedTheme, pathname])

  return null
}
