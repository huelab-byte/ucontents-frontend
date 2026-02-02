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
  CaptionPreviewModal,
  UploadQueueModal,
  NewContentModal,
  PageHeader,
  type VideoFile,
  type ContentSource,
  type CaptionSettings,
  type PromptSettings,
  type ContentMetadata,
  demoSource,
  demoContentMetadata,
  demoCaptionTemplates,
  demoPromptTemplates,
  availableFonts,
  generateMetadataFromVideo,
} from "@/components/content-sources/detail"
import { toast } from "@/lib/toast"

export default function ContentSourceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sourceId = params.id as string

  const [source] = React.useState<ContentSource>(demoSource)
  const [uploadQueue, setUploadQueue] = React.useState<VideoFile[]>([])
  const [processingQueue, setProcessingQueue] = React.useState<VideoFile[]>([])
  const [completedFiles, setCompletedFiles] = React.useState<VideoFile[]>([])
  const [processingBatch, setProcessingBatch] = React.useState(false)
  const [captionSettings, setCaptionSettings] = React.useState<CaptionSettings>({
    templateId: "",
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

  // Collapsible states for sidebar sections
  const [isCaptionConfigOpen, setIsCaptionConfigOpen] = React.useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(true)
  const [isUploadSectionOpen, setIsUploadSectionOpen] = React.useState(true)
  const [isUploadQueueOpen, setIsUploadQueueOpen] = React.useState(true)

  const batchSize = 5 // Process 5 files at a time
  const objectUrlsRef = React.useRef<Map<string, string>>(new Map())
  const [contentMetadata, setContentMetadata] = React.useState<ContentMetadata[]>(demoContentMetadata)

  // Process queued files in batches
  const processBatch = React.useCallback(() => {
    if (processingBatch || uploadQueue.length === 0) return

    setProcessingBatch(true)
    const batch = uploadQueue.slice(0, batchSize)
    const remaining = uploadQueue.slice(batchSize)

    // Move batch to processing
    setUploadQueue(remaining)
    setProcessingQueue((prev) => [...prev, ...batch])

    // Simulate processing
    batch.forEach((file) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setProcessingQueue((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, uploadProgress: 100, status: "PROCESSING" as const }
                : f
            )
          )
          setTimeout(() => {
            setProcessingQueue((prev) => {
              const completed = prev.find((f) => f.id === file.id)
              if (completed) {
                setCompletedFiles((prevCompleted) => [
                  { ...completed, status: "COMPLETED" as const, uploadProgress: undefined },
                  ...prevCompleted,
                ])
                // Auto-generate metadata for completed video
                setContentMetadata((prevMetadata) => [
                  generateMetadataFromVideo({ ...completed, status: "COMPLETED" as const, uploadProgress: undefined }),
                  ...prevMetadata,
                ])
                return prev.filter((f) => f.id !== file.id)
              }
              return prev
            })
          }, 2000)
        } else {
          setProcessingQueue((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress, status: "UPLOADING" as const } : f))
          )
        }
      }, 200)
    })

    setTimeout(() => {
      setProcessingBatch(false)
    }, 100)
  }, [uploadQueue, processingBatch])

  // Auto-process queue when files are added
  React.useEffect(() => {
    if (uploadQueue.length > 0 && !processingBatch) {
      processBatch()
    }
  }, [uploadQueue, processingBatch, processBatch])

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const newFiles: VideoFile[] = fileArray.map((file, index) => {
      const fileId = `file-${Date.now()}-${index}`
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.set(fileId, objectUrl)
      return {
        id: fileId,
        filename: file.name,
        fileSize: file.size,
        status: "QUEUED" as const,
        url: objectUrl,
      }
    })

    setUploadQueue((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRemoveFromQueue = (fileId: string) => {
    // Clean up object URL
    const objectUrl = objectUrlsRef.current.get(fileId)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrlsRef.current.delete(fileId)
    }
    setUploadQueue((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleClearQueue = () => {
    uploadQueue.forEach((file) => {
      const objectUrl = objectUrlsRef.current.get(file.id)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrlsRef.current.delete(file.id)
      }
    })
    setUploadQueue([])
  }

  const handleDeleteCompleted = (fileId: string) => {
    const objectUrl = objectUrlsRef.current.get(fileId)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrlsRef.current.delete(fileId)
    }
    setCompletedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  const [editingMetadata, setEditingMetadata] = React.useState<ContentMetadata | null>(null)
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState<string | null>(null)
  const [isNewContentModalOpen, setIsNewContentModalOpen] = React.useState(false)
  const [isUploadQueueModalOpen, setIsUploadQueueModalOpen] = React.useState(false)
  const [isCaptionPreviewOpen, setIsCaptionPreviewOpen] = React.useState(false)

  const handleUpdateMetadata = (id: string, updates: Partial<ContentMetadata>) => {
    setContentMetadata(
      contentMetadata.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates }
        }
        return item
      })
    )
    setEditingMetadata(null)
  }

  const handleEditMetadata = (item: ContentMetadata) => {
    setEditingMetadata(item)
  }

  const handleDeleteMetadata = (id: string) => {
    setContentMetadata(contentMetadata.filter((item) => item.id !== id))
  }

  // Batch selection for metadata
  const [selectedMetadataIds, setSelectedMetadataIds] = React.useState<Set<string>>(new Set())

  const handleToggleMetadataSelection = (id: string) => {
    setSelectedMetadataIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAllMetadata = (currentPageItems: ContentMetadata[]) => {
    const allCurrentPageSelected = currentPageItems.every((item) => selectedMetadataIds.has(item.id))
    if (allCurrentPageSelected) {
      // Deselect all current page items
      const newSet = new Set(selectedMetadataIds)
      currentPageItems.forEach((item) => newSet.delete(item.id))
      setSelectedMetadataIds(newSet)
    } else {
      // Select all current page items
      const newSet = new Set(selectedMetadataIds)
      currentPageItems.forEach((item) => newSet.add(item.id))
      setSelectedMetadataIds(newSet)
    }
  }

  const handleBatchDeleteMetadata = () => {
    setContentMetadata(contentMetadata.filter((item) => !selectedMetadataIds.has(item.id)))
    setSelectedMetadataIds(new Set())
  }

  const totalQueued = uploadQueue.length
  const totalProcessing = processingQueue.length
  const totalCompleted = completedFiles.length

  return (
    <CustomerDashboardLayout>
      <div className="flex gap-6">
        {/* Main Content - Left Side */}
        <div className="flex-1 min-w-0 space-y-3 pr-[420px]">
          {/* Header */}
          <PageHeader
            source={source}
            onBack={() => router.push("/content-generation/media-upload")}
          />

        {/* Source Info */}
          <SourceInfoCards source={source} />

        {/* Content Metadata Table */}
          <ContentMetadataTable
            contentMetadata={contentMetadata}
            selectedMetadataIds={selectedMetadataIds}
            onToggleSelection={handleToggleMetadataSelection}
            onSelectAll={handleSelectAllMetadata}
            onEdit={handleEditMetadata}
            onDelete={handleDeleteMetadata}
            onBatchDelete={handleBatchDeleteMetadata}
            onWatchVideo={(url) => setSelectedVideoUrl(url)}
          />
        </div>
      </div>

      {/* Right Sidebar - Fixed to Viewport */}
      <div 
        className="w-[420px] shrink-0 border-l border-border bg-background shadow-lg"
        style={{
          position: 'fixed',
          top: '64px',
          bottom: '0',
          right: '0',
          zIndex: 50,
        }}
      >
        <div className="h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
            <h2 className="text-lg font-semibold">Content Sourcing</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Video Caption Editing Configuration */}
            <CaptionConfigurationSection
              isOpen={isCaptionConfigOpen}
              onOpenChange={setIsCaptionConfigOpen}
              captionSettings={captionSettings}
              onCaptionSettingsChange={setCaptionSettings}
              captionTemplates={demoCaptionTemplates}
              availableFonts={availableFonts}
              onPreviewClick={() => setIsCaptionPreviewOpen(true)}
              onSaveAsTemplate={(name) => {
                // TODO: Implement API call to save template
                toast.success(`Template "${name}" saved successfully`)
              }}
            />

            {/* Settings Section */}
            <SettingsSection
              isOpen={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              promptSettings={promptSettings}
              onPromptSettingsChange={setPromptSettings}
              promptTemplates={demoPromptTemplates}
            />

            {/* Upload Section */}
            <UploadSection
              isOpen={isUploadSectionOpen}
              onOpenChange={setIsUploadSectionOpen}
              onFileUpload={handleFileUpload}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
            />

            {/* Upload Statistics Panel */}
            <UploadStatistics
              totalQueued={totalQueued}
              totalProcessing={totalProcessing}
              totalCompleted={totalCompleted}
            />

                  {/* Upload Queue Section */}
            <UploadQueue
              isOpen={isUploadQueueOpen}
              onOpenChange={setIsUploadQueueOpen}
              uploadQueue={uploadQueue}
              processingQueue={processingQueue}
              completedFiles={completedFiles}
              onRemoveFromQueue={handleRemoveFromQueue}
              onClearQueue={handleClearQueue}
              onDeleteCompleted={handleDeleteCompleted}
            />
                          </div>
                </div>
              </div>

      {/* Modals */}
          <EditMetadataDialog
            metadata={editingMetadata}
            onUpdate={handleUpdateMetadata}
            onClose={() => setEditingMetadata(null)}
          />

      <VideoPreviewModal
        videoUrl={selectedVideoUrl}
        onClose={() => setSelectedVideoUrl(null)}
      />

      <CaptionPreviewModal
        isOpen={isCaptionPreviewOpen}
        onClose={() => setIsCaptionPreviewOpen(false)}
        captionSettings={captionSettings}
      />

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
        onCaptionSettingsChange={setCaptionSettings}
        captionTemplates={demoCaptionTemplates}
        availableFonts={availableFonts}
        onFileUpload={handleFileUpload}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
    </CustomerDashboardLayout>
  )
}
