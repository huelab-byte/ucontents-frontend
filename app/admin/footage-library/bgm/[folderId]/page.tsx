"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, MusicNoteIcon } from "@hugeicons/core-free-icons"
import {
  AudioTracksTable,
  UploadSection,
  SelectionBar,
  folderData,
  type AudioTrack,
} from "@/components/bgm"
import { DetailStatisticsCards } from "@/components/audio-library/detail/statistics-cards"

export default function BGMFolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string
  const [tracks, setTracks] = React.useState<AudioTrack[]>(
    folderData[folderId]?.tracks || folderData.calm.tracks
  )
  const [selectedTracks, setSelectedTracks] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([])
  const [processingBatch, setProcessingBatch] = React.useState(false)
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const objectUrlsRef = React.useRef<Map<string, string>>(new Map())

  const folder = folderData[folderId] || folderData.calm

  // Handle audio playback
  const handlePlayPause = (track: AudioTrack) => {
    if (!track.url) return

    if (playingTrackId === track.id) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayingTrackId(null)
      }
    } else {
      // Stop current track if playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      // Play new track
      const audio = new Audio(track.url)
      audioRef.current = audio
      setPlayingTrackId(track.id)
      audio.play()
      audio.onended = () => {
        setPlayingTrackId(null)
        audioRef.current = null
      }
      audio.onerror = () => {
        setPlayingTrackId(null)
        audioRef.current = null
      }
    }
  }

  // Cleanup audio and object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      // Clean up all object URLs
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  // Pagination
  const totalPages = Math.ceil(tracks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTracks = tracks.slice(startIndex, endIndex)

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Handle track selection
  const handleToggleSelection = (trackId: string) => {
    setSelectedTracks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(trackId)) {
        newSet.delete(trackId)
      } else {
        newSet.add(trackId)
      }
      return newSet
    })
  }

  const handleSelectAll = (currentPageItems: AudioTrack[]) => {
    if (selectedTracks.size === currentPageItems.length) {
      setSelectedTracks(new Set())
    } else {
      setSelectedTracks(new Set(currentPageItems.map((t) => t.id)))
    }
  }

  const handleDeleteSelected = () => {
    // Clean up object URLs for selected tracks
    selectedTracks.forEach((id) => {
      const objectUrl = objectUrlsRef.current.get(id)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrlsRef.current.delete(id)
      }
    })
    setTracks((prev) => prev.filter((track) => !selectedTracks.has(track.id)))
    setSelectedTracks(new Set())
  }

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const newTracks: AudioTrack[] = fileArray.map((file, index) => {
      const trackId = `new-${Date.now()}-${index}`
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.set(trackId, objectUrl)
      return {
        id: trackId,
        filename: file.name,
        duration: "0:00",
        lastUpdated: "Just now",
        status: "NEW" as const,
        uploadProgress: 0,
        url: objectUrl,
      }
    })

    setTracks((prev) => [...newTracks, ...prev])

    // Simulate upload progress
    newTracks.forEach((track) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setTracks((prev) =>
            prev.map((t) =>
              t.id === track.id
                ? { ...t, uploadProgress: 100, status: "PROCESSING" as const }
                : t
            )
          )
          setTimeout(() => {
            setTracks((prev) =>
              prev.map((t) => (t.id === track.id ? { ...t, status: "READY" as const, uploadProgress: undefined } : t))
            )
          }, 2000)
        } else {
          setTracks((prev) =>
            prev.map((t) => (t.id === track.id ? { ...t, uploadProgress: progress } : t))
          )
        }
      }, 200)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDeleteTrack = (id: string) => {
    // Clean up object URL if it exists
    const objectUrl = objectUrlsRef.current.get(id)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrlsRef.current.delete(id)
    }
    setTracks((prev) => prev.filter((track) => track.id !== id))
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/footage-library/bgm")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to BGM Library</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{folder.name}</h1>
            <p className="text-muted-foreground mt-2">{folder.description}</p>
          </div>
        </div>

        {/* Statistics */}
        <DetailStatisticsCards
          totalAudio={tracks.length}
          lastUpdated={tracks[0]?.lastUpdated ?? undefined}
        />

        {/* Upload Tracks Section */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="rounded-lg border border-dashed border-border p-4"
        >
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <UploadSection onUploadClick={() => document.getElementById("audio-upload")?.click()} />
        </div>

        {/* Tracks Table */}
        <AudioTracksTable
          tracks={tracks}
          selectedTracks={selectedTracks}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          playingTrackId={playingTrackId}
          onPageChange={handlePageChange}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onPlayPause={handlePlayPause}
          onDelete={handleDeleteTrack}
        />

        {/* Selection Bar */}
        <SelectionBar
          selectedCount={selectedTracks.size}
          onSelectAll={() => handleSelectAll(currentTracks)}
          onDelete={handleDeleteSelected}
          onClear={() => setSelectedTracks(new Set())}
        />
      </div>
    </AdminDashboardLayout>
  )
}
