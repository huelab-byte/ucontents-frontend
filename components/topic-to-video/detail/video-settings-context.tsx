"use client"

import * as React from "react"

export interface VideoSettings {
  template?: string
  videoType?: string
  transitionEffects?: Array<{ type: string; duration?: number }>
  enableVariedTransitions?: boolean
  backgroundMusic?: {
    enabled: boolean
    folders?: string[]
    volume?: number
  }
  subtitles?: {
    enabled: boolean
    preset?: string
    font?: string
  }
  voiceTts?: {
    enabled: boolean
    voice?: string
  }
  footageLibrary?: {
    folders?: string[]
  }
  thumbnail?: {
    enabled: boolean
    style?: string
  }
}

interface VideoSettingsContextType {
  settings: VideoSettings
  updateSettings: (updates: Partial<VideoSettings>) => void
}

const VideoSettingsContext = React.createContext<VideoSettingsContextType | undefined>(undefined)

export function VideoSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<VideoSettings>({})

  const updateSettings = React.useCallback((updates: Partial<VideoSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <VideoSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </VideoSettingsContext.Provider>
  )
}

export function useVideoSettings() {
  const context = React.useContext(VideoSettingsContext)
  if (!context) {
    throw new Error("useVideoSettings must be used within VideoSettingsProvider")
  }
  return context
}
