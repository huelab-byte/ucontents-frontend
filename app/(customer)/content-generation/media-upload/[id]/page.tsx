"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import {
  SourceInfoCards,
  ContentMetadataTable,
  CaptionConfigurationSection,
  SettingsSection,
  UploadSection,
  UploadStatistics,
  UploadQueue,
  EditMetadataDialog,
  VideoPreviewModal,
  ViewMetadataModal,
  CaptionPreviewModal,
  UploadQueueModal,
  NewContentModal,
  PageHeader,
  type VideoFile,
  type ContentSource,
  type CaptionSettings,
  type PromptSettings,
  type ContentMetadata,
  availableFonts,
} from "@/components/content-sources/detail"
import {
  mediaUploadService,
  aiIntegrationService,
  type MediaUploadFolder,
  type MediaUploadContentSettings,
  type MediaUpload,
  type CaptionTemplate as ApiCaptionTemplate,
  type MediaUploadQueueStatus,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

function mapFolderToSource(f: MediaUploadFolder): ContentSource {
  return {
    id: String(f.id),
    name: f.name,
    aspectRatio: "9:16",
    orientation: "vertical",
    schedulerEnabled: false,
    totalVideos: f.media_uploads_count ?? 0,
    createdAt: f.created_at ?? "",
  }
}

function ensureHashtagPrefix(tag: string): string {
  const t = tag.trim()
  return t && !t.startsWith("#") ? `#${t}` : t
}

function mapMediaUploadToMetadata(m: MediaUpload): ContentMetadata {
  const tags = Array.isArray(m.hashtags) ? m.hashtags : []
  const normalizedTags = tags.map((t) => ensureHashtagPrefix(String(t))).filter(Boolean)
  return {
    id: String(m.id),
    youtubeHeadline: m.youtube_heading ?? m.title ?? "",
    postCaption: m.social_caption ?? "",
    hashtags: normalizedTags.join(" "),
    videoUrl: m.storage_file?.url ?? undefined,
    createdAt: m.processed_at ?? m.created_at ?? "",
    status: m.status === "ready" ? "draft" : "draft",
  }
}

function mapApiCaptionToUi(t: ApiCaptionTemplate) {
  return {
    id: String(t.id),
    name: t.name,
    font: t.font,
    fontSize: t.font_size,
    fontWeight: (t.font_weight as "regular" | "bold" | "italic" | "bold_italic" | "black") ?? "regular",
    fontColor: t.font_color,
    outlineColor: t.outline_color,
    outlineSize: t.outline_size,
    position: (t.position === "instagram" ? "bottom" : (t.position || "bottom")) as "top" | "center" | "bottom",
    positionOffset: t.position_offset ?? 30,
    wordsPerCaption: t.words_per_caption,
    wordHighlighting: t.word_highlighting,
    highlightColor: t.highlight_color ?? "#FFFF00",
    highlightStyle: t.highlight_style,
    backgroundOpacity: t.background_opacity,
    enableAlternatingLoop: t.enable_alternating_loop ?? false,
    loopCount: t.loop_count ?? 1,
  }
}

function mapContentSettingsToPromptSettings(s: MediaUploadContentSettings | null): PromptSettings {
  if (!s) {
    return {
      templateId: null,
      customPrompt: "",
      contentFromFrameExtract: false,
      contentSourceType: null,
      headingLength: 10,
      headingEmoji: false,
      postCaptionLength: 30,
      hashtagsCount: 3,
    }
  }
  const contentSourceType =
    s.content_source_type === "prompt"
      ? "prompt"
      : s.content_source_type === "frames"
        ? "frame_extract"
        : s.content_source_type === "title"
          ? "video_title"
          : null
  return {
    templateId: s.ai_prompt_template_id ? String(s.ai_prompt_template_id) : null,
    customPrompt: s.custom_prompt ?? "",
    contentFromFrameExtract: s.content_source_type === "frames",
    contentSourceType,
    headingLength: (() => {
      const v = s.heading_length
      if (v == null || v === "") return 10
      if (typeof v === "number") return v
      if (v === "short") return 40
      if (v === "medium") return 60
      if (v === "long") return 90
      return 10
    })(),
    postCaptionLength: (() => {
      const v = s.caption_length
      if (v == null || v === "") return 30
      if (typeof v === "number") return v
      if (v === "short") return 125
      if (v === "medium") return 250
      if (v === "long") return 450
      return 30
    })(),
    hashtagsCount: s.hashtag_count ?? 3,
    headingEmoji: s.heading_emoji ?? false,
  }
}

function mapPromptSettingsToApi(p: PromptSettings) {
  const content_source_type =
    p.contentSourceType === "prompt"
      ? "prompt"
      : p.contentSourceType === "frame_extract"
        ? "frames"
        : p.contentSourceType === "video_title"
          ? "title"
          : "title"
  return {
    content_source_type,
    ai_prompt_template_id: p.templateId && p.templateId !== "custom" ? parseInt(p.templateId, 10) : null,
    custom_prompt: p.customPrompt || null,
    heading_length: p.headingLength,
    heading_emoji: p.headingEmoji,
    caption_length: p.postCaptionLength,
    hashtag_count: p.hashtagsCount,
  }
}

export default function MediaUploadFolderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = params.id as string
  const folderId = parseInt(rawId, 10)

  const [folder, setFolder] = React.useState<MediaUploadFolder | null>(null)
  const [contentSettings, setContentSettings] = React.useState<MediaUploadContentSettings | null>(null)
  const [captionTemplates, setCaptionTemplates] = React.useState<ApiCaptionTemplate[]>([])
  const [promptTemplates, setPromptTemplates] = React.useState<{ id: string; name: string; prompt: string }[]>([])
  const [contentMetadata, setContentMetadata] = React.useState<ContentMetadata[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [uploadQueue, setUploadQueue] = React.useState<VideoFile[]>([])
  const [processingQueue, setProcessingQueue] = React.useState<VideoFile[]>([])
  const [completedFiles, setCompletedFiles] = React.useState<VideoFile[]>([])
  const [queueItemMap, setQueueItemMap] = React.useState<Map<string, number>>(new Map())
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const [captionSettings, setCaptionSettings] = React.useState<CaptionSettings>({
    templateId: "",
    enableVideoCaption: false,
    font: "Arial",
    fontSize: 32,
    fontWeight: "regular",
    fontColor: "#FFFFFF",
    outlineEnabled: false,
    outlineColor: "#000000",
    outlineSize: 3,
    position: "bottom",
    positionOffset: 30,
    wordsPerCaption: 3,
    wordHighlighting: false,
    highlightColor: "#FFFF00",
    highlightStyle: "text",
    backgroundOpacity: 70,
    enableAlternatingLoop: false,
    loopCount: 1,
  })
  const [promptSettings, setPromptSettings] = React.useState<PromptSettings>({
    templateId: null,
    customPrompt: "",
    contentFromFrameExtract: false,
    contentSourceType: null,
    headingLength: 10,
    headingEmoji: false,
    postCaptionLength: 30,
    hashtagsCount: 3,
  })

  const [isCaptionConfigOpen, setIsCaptionConfigOpen] = React.useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(true)
  const [isUploadSectionOpen, setIsUploadSectionOpen] = React.useState(true)
  const [isUploadQueueOpen, setIsUploadQueueOpen] = React.useState(true)
  const [currentStep, setCurrentStep] = React.useState(1)
  const [editingMetadata, setEditingMetadata] = React.useState<ContentMetadata | null>(null)
  const [viewingMetadata, setViewingMetadata] = React.useState<ContentMetadata | null>(null)
  const [deletingMetadata, setDeletingMetadata] = React.useState<ContentMetadata | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState<string | null>(null)
  const [isCaptionPreviewOpen, setIsCaptionPreviewOpen] = React.useState(false)
  const [isUploadQueueModalOpen, setIsUploadQueueModalOpen] = React.useState(false)
  const [isNewContentModalOpen, setIsNewContentModalOpen] = React.useState(false)
  const [selectedMetadataIds, setSelectedMetadataIds] = React.useState<Set<string>>(new Set())
  const objectUrlsRef = React.useRef<Map<string, string>>(new Map())
  const lastCaptionTemplateIdRef = React.useRef<string | null>(null)

  const source: ContentSource = folder
    ? mapFolderToSource(folder)
    : { id: "", name: "", aspectRatio: "9:16", orientation: "vertical", schedulerEnabled: false, totalVideos: 0, createdAt: "" }

  const loadData = React.useCallback(async () => {
    if (Number.isNaN(folderId)) {
      router.replace("/content-generation/media-upload")
      return
    }
    setIsLoading(true)
    try {
      const [folderRes, settingsRes, captionsRes, uploadsRes, promptsRes] = await Promise.all([
        mediaUploadService.getFolder(folderId),
        mediaUploadService.getContentSettings(folderId),
        mediaUploadService.listCaptionTemplates(),
        mediaUploadService.listUploads({ folder_id: folderId }),
        aiIntegrationService.getCustomerPromptTemplates().catch(() => ({ success: false, data: [] })),
      ])
      if (folderRes.success && folderRes.data) setFolder(folderRes.data)
      if (settingsRes.success) {
        setContentSettings(settingsRes.data ?? null)
        setPromptSettings(mapContentSettingsToPromptSettings(settingsRes.data ?? null))
      }
      if (captionsRes.success && captionsRes.data) {
        setCaptionTemplates(captionsRes.data)
        const s = settingsRes.success && settingsRes.data ? settingsRes.data : null
        if (s?.default_caption_template_id) {
          const tpl = (captionsRes.data ?? []).find((t: { id: number }) => t.id === s.default_caption_template_id)
          if (tpl) {
            const outlineSize = tpl.outline_size ?? 3
            lastCaptionTemplateIdRef.current = String(tpl.id)
            setCaptionSettings((prev) => ({
              ...prev,
              templateId: String(tpl.id),
              font: tpl.font ?? prev.font,
              fontSize: tpl.font_size ?? prev.fontSize,
              fontWeight: ((tpl as { font_weight?: string }).font_weight ?? prev.fontWeight) as CaptionSettings["fontWeight"],
              fontColor: tpl.font_color ?? prev.fontColor,
              outlineEnabled: outlineSize > 0,
              outlineColor: tpl.outline_color ?? prev.outlineColor,
              outlineSize,
              position: ((tpl.position === "instagram" ? "bottom" : tpl.position) ?? prev.position) as CaptionSettings["position"],
              positionOffset: (tpl as { position_offset?: number }).position_offset ?? prev.positionOffset ?? 30,
              wordsPerCaption: tpl.words_per_caption ?? prev.wordsPerCaption,
              wordHighlighting: tpl.word_highlighting ?? prev.wordHighlighting,
              highlightColor: tpl.highlight_color ?? prev.highlightColor,
              highlightStyle: tpl.highlight_style ?? prev.highlightStyle,
              backgroundOpacity: tpl.background_opacity ?? prev.backgroundOpacity,
              enableAlternatingLoop: (tpl as { enable_alternating_loop?: boolean }).enable_alternating_loop ?? prev.enableAlternatingLoop,
              loopCount: (tpl as { loop_count?: number }).loop_count ?? prev.loopCount,
            }))
          }
        }
      }
      if (uploadsRes.success && uploadsRes.data) {
        const data = Array.isArray(uploadsRes.data) ? uploadsRes.data : (uploadsRes.data as { data?: MediaUpload[] })?.data ?? []
        const mapped = data.map(mapMediaUploadToMetadata)
        const seen = new Set<string>()
        setContentMetadata(mapped.filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        }))
      }
      if (promptsRes.success && promptsRes.data) {
        setPromptTemplates(
          (promptsRes.data ?? []).map((t: { id: number; name: string; user_prompt_template?: string }) => ({
            id: String(t.id),
            name: t.name,
            prompt: t.user_prompt_template ?? "",
          }))
        )
      }
    } catch (err) {
      console.error("Load failed:", err)
      toast.error("Failed to load folder")
      router.replace("/content-generation/media-upload")
    } finally {
      setIsLoading(false)
    }
  }, [folderId, router])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const saveContentSettings = React.useCallback(
    async (updates: Partial<PromptSettings>) => {
      const next = { ...promptSettings, ...updates }
      setPromptSettings(next)
      if (Number.isNaN(folderId)) return
      try {
        await mediaUploadService.updateContentSettings(folderId, mapPromptSettingsToApi(next))
        setContentSettings((prev) => (prev ? { ...prev, ...mapPromptSettingsToApi(next) } : null))
      } catch (err) {
        console.error("Save content settings failed:", err)
        toast.error("Failed to save settings")
      }
    },
    [folderId, promptSettings]
  )

  const handleCaptionSettingsChange = React.useCallback(
    (updates: CaptionSettings) => {
      setCaptionSettings(updates)
      if (Number.isNaN(folderId)) return
      const templateId = updates.templateId ?? null
      if (lastCaptionTemplateIdRef.current === templateId) return
      lastCaptionTemplateIdRef.current = templateId
      const id = templateId ? parseInt(templateId, 10) : null
      mediaUploadService
        .updateContentSettings(folderId, {
          default_caption_template_id: templateId && !Number.isNaN(id ?? 0) ? id : null,
        })
        .then((res) => {
          if (res.success && res.data) setContentSettings((prev) => (prev ? { ...prev, default_caption_template_id: res.data!.default_caption_template_id ?? null } : null))
        })
        .catch(() => {
          lastCaptionTemplateIdRef.current = null
          toast.error("Failed to save caption template")
        })
    },
    [folderId]
  )

  const pollQueueStatus = React.useCallback(async () => {
    const ids = Array.from(queueItemMap.values())
    if (ids.length === 0) return
    let anyActive = false
    for (const qid of ids) {
      try {
        const res = await mediaUploadService.getQueueStatus(qid)
        if (res.success && res.data) {
          const q = res.data
          const fileKey = Array.from(queueItemMap.entries()).find(([, v]) => v === qid)?.[0]
          if (fileKey) {
            if (q.status === "completed" && q.media_upload_id) {
              setQueueItemMap((prev) => {
                const next = new Map(prev)
                next.delete(fileKey)
                return next
              })
              setProcessingQueue((prev) => prev.filter((f) => f.id !== fileKey))
              mediaUploadService
                .getUpload(q.media_upload_id)
                .then((r) => {
                  if (r.success && r.data) {
                    const mapped = mapMediaUploadToMetadata(r.data!)
                    setContentMetadata((prev) =>
                      prev.some((item) => item.id === mapped.id) ? prev : [mapped, ...prev]
                    )
                    setFolder((prev) =>
                      prev ? { ...prev, media_uploads_count: (prev.media_uploads_count ?? 0) + 1 } : null
                    )
                  }
                })
                .catch(() => {})
            } else if (q.status === "failed") {
              setProcessingQueue((prev) =>
                prev.map((f) =>
                  f.id === fileKey ? { ...f, status: "FAILED" as const, error: q.error_message ?? "Failed" } : f
                )
              )
            } else {
              anyActive = true
              setProcessingQueue((prev) =>
                prev.map((f) =>
                  f.id === fileKey
                    ? { ...f, status: "UPLOADING" as const, uploadProgress: q.progress ?? 0 }
                    : f
                )
              )
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }, [queueItemMap])

  React.useEffect(() => {
    if (queueItemMap.size > 0) {
      pollRef.current = setInterval(pollQueueStatus, 2000)
      return () => {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } else if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [queueItemMap.size, pollQueueStatus])

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    const newFiles: VideoFile[] = fileArray.map((file, index) => {
      const fileId = `file-${Date.now()}-${index}`
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.set(fileId, objectUrl)
      return { id: fileId, filename: file.name, fileSize: file.size, status: "QUEUED" as const, url: objectUrl }
    })
    setUploadQueue((prev) => [...prev, ...newFiles])
  }

  const handleStartUpload = async () => {
    if (uploadQueue.length === 0 || Number.isNaN(folderId)) return
    const realFiles = await Promise.all(
      uploadQueue.map(async (f) => {
        if (!f.url) return null
        // Local blob URL → File for upload (not an API call; object URL from createObjectURL)
        const res = await fetch(f.url)
        const blob = await res.blob()
        return new File([blob], f.filename, { type: blob.type || "video/mp4" })
      })
    )
    const validFiles = realFiles.filter((x): x is File => x !== null)
    if (validFiles.length === 0) return
    const captionConfig = {
      enable_video_caption: captionSettings.enableVideoCaption,
      font: captionSettings.font,
      font_size: captionSettings.fontSize,
      font_weight: captionSettings.fontWeight,
      font_color: captionSettings.fontColor,
      outline_color: captionSettings.outlineColor,
      outline_size: captionSettings.outlineEnabled ? captionSettings.outlineSize : 0,
      position: captionSettings.position,
      position_offset: captionSettings.positionOffset,
      words_per_caption: captionSettings.wordsPerCaption,
      loop_count: captionSettings.loopCount,
      enable_reverse: captionSettings.enableAlternatingLoop,
    }
    try {
      const res = await mediaUploadService.bulkUpload(validFiles, folderId, captionConfig)
      if (res.success && res.data?.queued_items) {
        const items = res.data.queued_items as MediaUploadQueueStatus[]
        const map = new Map<string, number>()
        uploadQueue.forEach((uf, i) => {
          if (items[i]) map.set(uf.id, items[i].id)
        })
        setQueueItemMap(map)
        setUploadQueue([])
        setProcessingQueue(
          uploadQueue.map((f) => ({
            ...f,
            status: "UPLOADING" as const,
            uploadProgress: 0,
          }))
        )
        toast.success(`${items.length} video(s) queued for processing`)
      }
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Upload failed")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRemoveFromQueue = (fileId: string) => {
    const url = objectUrlsRef.current.get(fileId)
    if (url) {
      URL.revokeObjectURL(url)
      objectUrlsRef.current.delete(fileId)
    }
    setUploadQueue((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleClearQueue = () => {
    uploadQueue.forEach((f) => {
      const url = objectUrlsRef.current.get(f.id)
      if (url) {
        URL.revokeObjectURL(url)
        objectUrlsRef.current.delete(f.id)
      }
    })
    setUploadQueue([])
  }

  const handleDeleteCompleted = (fileId: string) => {
    const url = objectUrlsRef.current.get(fileId)
    if (url) {
      URL.revokeObjectURL(url)
      objectUrlsRef.current.delete(fileId)
    }
    setProcessingQueue((prev) => prev.filter((f) => f.id !== fileId))
  }

  React.useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current.clear()
    }
  }, [])

  const handleUpdateMetadata = async (id: string, updates: Partial<ContentMetadata>) => {
    const numId = parseInt(id, 10)
    if (Number.isNaN(numId)) return
    try {
      await mediaUploadService.updateUpload(numId, {
        youtube_heading: updates.youtubeHeadline ?? undefined,
        social_caption: updates.postCaption ?? undefined,
        hashtags: updates.hashtags
          ? updates.hashtags
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((t) => ensureHashtagPrefix(t))
          : undefined,
      })
      setContentMetadata((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
      setEditingMetadata(null)
      toast.success("Updated")
    } catch (err) {
      toast.error("Failed to update")
    }
  }

  const handleEditMetadata = (item: ContentMetadata) => setEditingMetadata(item)
  const handleViewMetadata = (item: ContentMetadata) => setViewingMetadata(item)

  const handleDeleteMetadata = (id: string) => {
    const item = contentMetadata.find((m) => m.id === id)
    if (item) {
      setDeletingMetadata(item)
    }
  }

  const confirmDeleteMetadata = async () => {
    if (!deletingMetadata) return
    const numId = parseInt(deletingMetadata.id, 10)
    if (Number.isNaN(numId)) return
    try {
      await mediaUploadService.deleteUpload(numId)
      setContentMetadata((prev) => prev.filter((item) => item.id !== deletingMetadata.id))
      setSelectedMetadataIds((prev) => {
        const next = new Set(prev)
        next.delete(deletingMetadata.id)
        return next
      })
      toast.success("Video deleted")
    } catch (err) {
      toast.error("Failed to delete video")
    }
  }

  const handleToggleMetadataSelection = (id: string) => {
    setSelectedMetadataIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAllMetadata = (currentPageItems: ContentMetadata[]) => {
    const allSelected = currentPageItems.every((item) => selectedMetadataIds.has(item.id))
    setSelectedMetadataIds((prev) => {
      const next = new Set(prev)
      if (allSelected) currentPageItems.forEach((item) => next.delete(item.id))
      else currentPageItems.forEach((item) => next.add(item.id))
      return next
    })
  }

  const handleBatchDeleteMetadata = () => {
    if (selectedMetadataIds.size > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmBatchDeleteMetadata = async () => {
    const ids = Array.from(selectedMetadataIds)
    let successCount = 0
    for (const id of ids) {
      try {
        await mediaUploadService.deleteUpload(parseInt(id, 10), true)
        successCount++
      } catch {
        // continue
      }
    }
    setContentMetadata((prev) => prev.filter((item) => !selectedMetadataIds.has(item.id)))
    setSelectedMetadataIds(new Set())
    if (successCount > 0) {
      toast.success(
        successCount === 1 ? "1 video deleted successfully" : `${successCount} videos deleted successfully`
      )
    }
  }

  const totalQueued = uploadQueue.length
  const totalProcessing = processingQueue.length
  const totalCompleted = completedFiles.length

  if (isLoading || !folder) {
    return (
      <CustomerDashboardLayout>
        <div className="flex items-center justify-center py-24">Loading...</div>
      </CustomerDashboardLayout>
    )
  }

  return (
    <CustomerDashboardLayout>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-3 pr-[420px]">
          <PageHeader source={source} onBack={() => router.push("/content-generation/media-upload")} />
          <SourceInfoCards source={source} />
          <ContentMetadataTable
            contentMetadata={contentMetadata}
            selectedMetadataIds={selectedMetadataIds}
            onToggleSelection={handleToggleMetadataSelection}
            onSelectAll={handleSelectAllMetadata}
            onView={handleViewMetadata}
            onEdit={handleEditMetadata}
            onDelete={handleDeleteMetadata}
            onBatchDelete={handleBatchDeleteMetadata}
            onWatchVideo={(url) => setSelectedVideoUrl(url)}
          />
        </div>

        <div
          className="w-[420px] shrink-0 border-l border-border bg-background shadow-lg"
          style={{ position: "fixed", top: "64px", bottom: 0, right: 0, zIndex: 50 }}
        >
          <div className="h-full overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
              <h2 className="text-lg font-semibold mb-3">Content Sourcing</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span className={`flex items-center justify-center size-5 rounded-full text-xs ${currentStep === 1 ? "bg-primary-foreground text-primary" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                    1
                  </span>
                  Configuration
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span className={`flex items-center justify-center size-5 rounded-full text-xs ${currentStep === 2 ? "bg-primary-foreground text-primary" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                    2
                  </span>
                  Upload
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {currentStep === 1 ? (
                <>
                  <CaptionConfigurationSection
                    isOpen={isCaptionConfigOpen}
                    onOpenChange={setIsCaptionConfigOpen}
                    captionSettings={captionSettings}
                    onCaptionSettingsChange={handleCaptionSettingsChange}
                    captionTemplates={captionTemplates.map(mapApiCaptionToUi)}
                    availableFonts={availableFonts}
                    onPreviewClick={() => setIsCaptionPreviewOpen(true)}
                    onSaveAsTemplate={async (name) => {
                      try {
        await mediaUploadService.createCaptionTemplate({
          name,
          font: captionSettings.font,
          font_size: captionSettings.fontSize,
          font_weight: captionSettings.fontWeight,
          font_color: captionSettings.fontColor,
                          outline_color: captionSettings.outlineColor,
                          outline_size: captionSettings.outlineEnabled ? captionSettings.outlineSize : 0,
                          position: captionSettings.position,
                          position_offset: captionSettings.positionOffset,
                          words_per_caption: captionSettings.wordsPerCaption,
                          word_highlighting: captionSettings.wordHighlighting,
                          highlight_color: captionSettings.highlightColor,
                          highlight_style: captionSettings.highlightStyle,
                          background_opacity: captionSettings.backgroundOpacity,
                          enable_alternating_loop: captionSettings.enableAlternatingLoop,
                          loop_count: captionSettings.loopCount,
                        })
                        toast.success(`Template "${name}" saved`)
                        const res = await mediaUploadService.listCaptionTemplates()
                        if (res.success && res.data) setCaptionTemplates(res.data)
                      } catch {
                        toast.error("Failed to save template")
                      }
                    }}
                    onDeleteTemplate={async (templateId) => {
                      const numId = parseInt(templateId, 10)
                      if (Number.isNaN(numId)) return
                      try {
                        await mediaUploadService.deleteCaptionTemplate(numId)
                        setCaptionTemplates((prev) => prev.filter((t) => t.id !== numId))
                        if (captionSettings.templateId === templateId) {
                          setCaptionSettings((prev) => ({ ...prev, templateId: null }))
                          lastCaptionTemplateIdRef.current = null
                          if (!Number.isNaN(folderId)) {
                            mediaUploadService
                              .updateContentSettings(folderId, { default_caption_template_id: null })
                              .then((res) => {
                                if (res.success && res.data)
                                  setContentSettings((prev) =>
                                    prev ? { ...prev, default_caption_template_id: null } : null
                                  )
                              })
                              .catch(() => {})
                          }
                        }
                      } catch {
                        // ignore
                      }
                    }}
                  />
                  <SettingsSection
                    isOpen={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                    promptSettings={promptSettings}
                    onPromptSettingsChange={saveContentSettings}
                    promptTemplates={promptTemplates}
                  />
                  <div className="pt-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Continue to Upload
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <UploadSection
                    isOpen={isUploadSectionOpen}
                    onOpenChange={setIsUploadSectionOpen}
                    onFileUpload={handleFileUpload}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  />
                  <UploadStatistics
                    totalQueued={totalQueued}
                    totalProcessing={totalProcessing}
                    totalCompleted={totalCompleted}
                  />
                  <UploadQueue
                    isOpen={isUploadQueueOpen}
                    onOpenChange={setIsUploadQueueOpen}
                    uploadQueue={uploadQueue}
                    processingQueue={processingQueue}
                    completedFiles={completedFiles}
                    onRemoveFromQueue={handleRemoveFromQueue}
                    onClearQueue={handleClearQueue}
                    onDeleteCompleted={handleDeleteCompleted}
                    onStartUpload={handleStartUpload}
                  />
                  <div className="pt-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Back to Configuration
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditMetadataDialog metadata={editingMetadata} onUpdate={handleUpdateMetadata} onClose={() => setEditingMetadata(null)} />
      <ViewMetadataModal metadata={viewingMetadata} onClose={() => setViewingMetadata(null)} />
      <VideoPreviewModal videoUrl={selectedVideoUrl} onClose={() => setSelectedVideoUrl(null)} />
      <DeleteConfirmDialog
        open={!!deletingMetadata}
        onOpenChange={(open) => !open && setDeletingMetadata(null)}
        title="Delete Video"
        description={`Are you sure you want to delete "${deletingMetadata?.youtubeHeadline || 'this video'}"? This action cannot be undone.`}
        onConfirm={confirmDeleteMetadata}
      />
      <DeleteConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Selected Videos"
        description={`Are you sure you want to delete ${selectedMetadataIds.size} selected video${selectedMetadataIds.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmBatchDeleteMetadata}
      />
      <CaptionPreviewModal isOpen={isCaptionPreviewOpen} onClose={() => setIsCaptionPreviewOpen(false)} captionSettings={captionSettings} />
      <UploadQueueModal
        isOpen={isUploadQueueModalOpen}
        onClose={() => setIsUploadQueueModalOpen(false)}
        uploadQueue={uploadQueue}
        processingQueue={processingQueue}
        completedFiles={completedFiles}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        onDeleteCompleted={handleDeleteCompleted}
      />
      <NewContentModal
        isOpen={isNewContentModalOpen}
        onClose={() => setIsNewContentModalOpen(false)}
        captionSettings={captionSettings}
        onCaptionSettingsChange={handleCaptionSettingsChange}
        captionTemplates={captionTemplates.map(mapApiCaptionToUi)}
        availableFonts={availableFonts}
        onFileUpload={handleFileUpload}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
    </CustomerDashboardLayout>
  )
}
