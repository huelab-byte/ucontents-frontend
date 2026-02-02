import { useEffect, useState } from 'react'
import { generalSettingsService, type PublicGeneralSettings } from '@/lib/api/services/general-settings.service'

/**
 * Hook to fetch and cache public general settings
 * Settings are cached to avoid repeated API calls
 */
let cachedSettings: PublicGeneralSettings | null = null
let settingsPromise: Promise<PublicGeneralSettings | null> | null = null

export function useGeneralSettings() {
  const [settings, setSettings] = useState<PublicGeneralSettings | null>(cachedSettings)
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    // If we have cached settings, use them immediately
    if (cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    // If a request is already in progress, wait for it
    if (settingsPromise) {
      settingsPromise.then((data) => {
        if (data) {
          setSettings(data)
          setLoading(false)
        }
      })
      return
    }

    // Fetch settings
    setLoading(true)
    settingsPromise = generalSettingsService
      .getPublicSettings()
      .then((response) => {
        if (response.success && response.data) {
          cachedSettings = response.data
          setSettings(response.data)
          return response.data
        }
        return null
      })
      .catch(() => {
        // Return default settings on error
        const defaults: PublicGeneralSettings = {
          branding: {
            site_name: '',
            site_description: '',
            logo: '',
            favicon: '',
            site_icon: '',
            primary_color_light: '#000000',
            primary_color_dark: '#ffffff',
          },
          meta: {
            title: '',
            description: '',
            keywords: '',
          },
          social_links: {},
          maintenance_mode: false,
          timezone: 'UTC',
        }
        cachedSettings = defaults
        setSettings(defaults)
        return defaults
      })
      .finally(() => {
        setLoading(false)
        settingsPromise = null
      })
  }, [])

  return { settings, loading }
}

/**
 * Clear cached settings (useful after updating settings)
 */
export function clearGeneralSettingsCache() {
  cachedSettings = null
  settingsPromise = null
}
