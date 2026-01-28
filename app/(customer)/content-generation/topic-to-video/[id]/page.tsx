"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import {
  PageHeader,
  TopicInfoCards,
  GeneratedVideosTable,
  GenerateVideoSection,
  TopicImportSection,
  EditVideoDialog,
  VideoPreviewModal,
  demoTopic,
  demoGeneratedVideos,
  generateVideoFromTopic,
  type TopicToVideo,
  type GeneratedVideo,
} from "@/components/topic-to-video"
import { VideoTemplateSection } from "@/components/topic-to-video/detail/video-template-section"
import { ContentGenerationSection } from "@/components/topic-to-video/detail/content-generation-section"
import { ThumbnailGenerationSection } from "@/components/topic-to-video/detail/thumbnail-generation-section"
import { BackgroundMusicSection } from "@/components/topic-to-video/detail/background-music-section"
import { SubtitleSection } from "@/components/topic-to-video/detail/subtitle-section"
import { VoiceTtsSection } from "@/components/topic-to-video/detail/voice-tts-section"
import { FootageLibrarySection } from "@/components/topic-to-video/detail/footage-library-section"
import { VideoQualitySection } from "@/components/topic-to-video/detail/video-quality-section"
import { VariedTransitionsSection } from "@/components/topic-to-video/detail/varied-transitions-section"
import { VideoOverlaySection } from "@/components/topic-to-video/detail/video-overlay-section"
import { IntroOutroSection } from "@/components/topic-to-video/detail/intro-outro-section"
import { ChannelLogoSection } from "@/components/topic-to-video/detail/channel-logo-section"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronRight, ChevronLeft } from "@hugeicons/core-free-icons"

export default function TopicToVideoDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.id as string

  const [topic] = React.useState<TopicToVideo>(demoTopic)
  const [generatedVideos, setGeneratedVideos] = React.useState<GeneratedVideo[]>(demoGeneratedVideos)
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  // Collapsible states for sidebar sections
  const [isVideoTemplateOpen, setIsVideoTemplateOpen] = React.useState(true)
  const [isTopicImportOpen, setIsTopicImportOpen] = React.useState(true)
  const [isContentGenerationOpen, setIsContentGenerationOpen] = React.useState(true)
  const [isThumbnailGenerationOpen, setIsThumbnailGenerationOpen] = React.useState(true)
  const [isBackgroundMusicOpen, setIsBackgroundMusicOpen] = React.useState(true)
  const [isSubtitleOpen, setIsSubtitleOpen] = React.useState(true)
  const [isVoiceTtsOpen, setIsVoiceTtsOpen] = React.useState(true)
  const [isFootageLibraryOpen, setIsFootageLibraryOpen] = React.useState(true)
  const [isVideoQualityOpen, setIsVideoQualityOpen] = React.useState(true)
  const [isVariedTransitionsOpen, setIsVariedTransitionsOpen] = React.useState(true)
  const [isVideoOverlayOpen, setIsVideoOverlayOpen] = React.useState(true)
  const [isIntroOutroOpen, setIsIntroOutroOpen] = React.useState(true)
  const [isChannelLogoOpen, setIsChannelLogoOpen] = React.useState(true)
  const [isGenerateVideoOpen, setIsGenerateVideoOpen] = React.useState(true)

  const [editingVideo, setEditingVideo] = React.useState<GeneratedVideo | null>(null)
  const [selectedVideoUrl, setSelectedVideoUrl] = React.useState<string | null>(null)
  const [selectedVideoTitle, setSelectedVideoTitle] = React.useState<string | null>(null)

  // Batch selection for videos
  const [selectedVideoIds, setSelectedVideoIds] = React.useState<Set<string>>(new Set())

  const handleToggleVideoSelection = (id: string) => {
    setSelectedVideoIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAllVideos = (currentPageItems: GeneratedVideo[]) => {
    const allCurrentPageSelected = currentPageItems.every((item) => selectedVideoIds.has(item.id))
    if (allCurrentPageSelected) {
      // Deselect all current page items
      const newSet = new Set(selectedVideoIds)
      currentPageItems.forEach((item) => newSet.delete(item.id))
      setSelectedVideoIds(newSet)
    } else {
      // Select all current page items
      const newSet = new Set(selectedVideoIds)
      currentPageItems.forEach((item) => newSet.add(item.id))
      setSelectedVideoIds(newSet)
    }
  }

  const handleBatchDeleteVideos = () => {
    setGeneratedVideos(generatedVideos.filter((item) => !selectedVideoIds.has(item.id)))
    setSelectedVideoIds(new Set())
  }

  const handleUpdateVideo = (id: string, updates: Partial<GeneratedVideo>) => {
    setGeneratedVideos(
      generatedVideos.map((video) => {
        if (video.id === id) {
          return { ...video, ...updates }
        }
        return video
      })
    )
    setEditingVideo(null)
  }

  const handleEditVideo = (video: GeneratedVideo) => {
    setEditingVideo(video)
  }

  const handleDeleteVideo = (id: string) => {
    setGeneratedVideos(generatedVideos.filter((video) => video.id !== id))
  }

  const handleGenerateVideo = async () => {
    setIsGenerating(true)
    // Simulate video generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const newVideo = generateVideoFromTopic(topic)
    setGeneratedVideos([newVideo, ...generatedVideos])
    setIsGenerating(false)
  }

  const handleImportTopics = (importedTopics: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">[]) => {
    // Convert imported topics to generated videos
    const newVideos: GeneratedVideo[] = importedTopics.map((importedTopic, index) => {
      const timestamp = Date.now() + index // Ensure unique IDs
      return {
        id: `video-${timestamp}`,
        title: importedTopic.name,
        description: importedTopic.topic,
        hashtags: `#${importedTopic.name.replace(/\s+/g, "")}`,
        createdAt: new Date().toISOString().split("T")[0],
        status: "draft" as const,
      }
    })
    
    // Add all imported videos to the generated videos table
    setGeneratedVideos([...newVideos, ...generatedVideos])
  }

  return (
    <CustomerDashboardLayout>
      <div className="flex gap-6 overflow-x-hidden">
        {/* Main Content - Left Side */}
        <div className="flex-1 min-w-0 space-y-3 overflow-x-hidden">
          {/* Header with Sidebar Toggle */}
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              topic={topic}
              onBack={() => router.push("/content-generation/topic-to-video")}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="shrink-0"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <HugeiconsIcon
                icon={isSidebarOpen ? ChevronRight : ChevronLeft}
                className="size-4"
              />
            </Button>
          </div>

          {/* Topic Info */}
          <TopicInfoCards topic={topic} videos={generatedVideos} />

          {/* Generated Videos Table */}
          <GeneratedVideosTable
            videos={generatedVideos}
            selectedVideoIds={selectedVideoIds}
            onToggleSelection={handleToggleVideoSelection}
            onSelectAll={handleSelectAllVideos}
            onEdit={handleEditVideo}
            onDelete={handleDeleteVideo}
            onBatchDelete={handleBatchDeleteVideos}
            onWatchVideo={(url, title) => {
              setSelectedVideoUrl(url)
              setSelectedVideoTitle(title || null)
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Fixed to Viewport */}
      {isSidebarOpen && (
        <div
          className="w-[550px] shrink-0 border-l border-border bg-background shadow-lg"
          style={{
            position: "fixed",
            top: "64px",
            bottom: "0",
            right: "0",
            zIndex: 50,
          }}
        >
        <div className="h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Video Generation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="shrink-0 h-8 w-8"
              aria-label="Hide sidebar"
            >
              <HugeiconsIcon
                icon={ChevronRight}
                className="size-4"
              />
            </Button>
          </div>
          <div className="p-6 space-y-6">
            {/* Video Template Section - Step 1 */}
            <VideoTemplateSection
              isOpen={isVideoTemplateOpen}
              onOpenChange={setIsVideoTemplateOpen}
              stepNumber={1}
              isLastStep={false}
              videos={generatedVideos}
            />

            {/* Topic Import Section - Step 2 */}
            <TopicImportSection
              isOpen={isTopicImportOpen}
              onOpenChange={setIsTopicImportOpen}
              onImport={handleImportTopics}
              stepNumber={2}
              isLastStep={false}
            />

            {/* Content Generation Section - Step 3 */}
            <ContentGenerationSection
              isOpen={isContentGenerationOpen}
              onOpenChange={setIsContentGenerationOpen}
              topic={topic.topic}
              stepNumber={3}
              isLastStep={false}
            />

            {/* Thumbnail Generation Section - Step 4 */}
            <ThumbnailGenerationSection
              isOpen={isThumbnailGenerationOpen}
              onOpenChange={setIsThumbnailGenerationOpen}
              stepNumber={4}
              isLastStep={false}
              aspectRatio={topic.aspectRatio}
            />

            {/* Background Music Section - Step 5 */}
            <BackgroundMusicSection
              isOpen={isBackgroundMusicOpen}
              onOpenChange={setIsBackgroundMusicOpen}
              stepNumber={5}
              isLastStep={false}
            />

            {/* Subtitle Section - Step 6 */}
            <SubtitleSection
              isOpen={isSubtitleOpen}
              onOpenChange={setIsSubtitleOpen}
              stepNumber={6}
              isLastStep={false}
              aspectRatio={topic.aspectRatio}
            />

            {/* Voice & TTS Section - Step 7 */}
            <VoiceTtsSection
              isOpen={isVoiceTtsOpen}
              onOpenChange={setIsVoiceTtsOpen}
              stepNumber={7}
              isLastStep={false}
            />

            {/* Footage Library Section - Step 8 */}
            <FootageLibrarySection
              isOpen={isFootageLibraryOpen}
              onOpenChange={setIsFootageLibraryOpen}
              stepNumber={8}
              isLastStep={false}
            />

            {/* Video Quality Section */}
            <VideoQualitySection
              isOpen={isVideoQualityOpen}
              onOpenChange={setIsVideoQualityOpen}
            />

            {/* Varied Transitions Section */}
            <VariedTransitionsSection
              isOpen={isVariedTransitionsOpen}
              onOpenChange={setIsVariedTransitionsOpen}
            />

            {/* Video Overlay Section */}
            <VideoOverlaySection
              isOpen={isVideoOverlayOpen}
              onOpenChange={setIsVideoOverlayOpen}
            />

            {/* Intro and Outro Section */}
            <IntroOutroSection
              isOpen={isIntroOutroOpen}
              onOpenChange={setIsIntroOutroOpen}
            />

            {/* Channel Logo Section */}
            <ChannelLogoSection
              isOpen={isChannelLogoOpen}
              onOpenChange={setIsChannelLogoOpen}
            />

            {/* Generate Video Section - Step 9 */}
            <GenerateVideoSection
              isOpen={isGenerateVideoOpen}
              onOpenChange={setIsGenerateVideoOpen}
              onGenerate={handleGenerateVideo}
              isGenerating={isGenerating}
              stepNumber={9}
              isLastStep={true}
            />
          </div>
        </div>
      </div>
      )}

      {/* Modals */}
      <EditVideoDialog
        video={editingVideo}
        onUpdate={handleUpdateVideo}
        onClose={() => setEditingVideo(null)}
      />

      <VideoPreviewModal
        videoUrl={selectedVideoUrl}
        videoTitle={selectedVideoTitle || undefined}
        onClose={() => {
          setSelectedVideoUrl(null)
          setSelectedVideoTitle(null)
        }}
      />
    </CustomerDashboardLayout>
  )
}
