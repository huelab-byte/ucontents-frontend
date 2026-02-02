import type { PromptTemplate, CaptionTemplate, ContentMetadata, ContentSource, VideoFile } from "./types"

// Demo prompt templates
export const demoPromptTemplates: PromptTemplate[] = [
  {
    id: "prompt-1",
    name: "Default Content Generation",
    prompt: "Generate engaging social media content based on the video frames provided. Include a compelling headline, descriptive caption, and relevant hashtags.",
  },
  {
    id: "prompt-2",
    name: "YouTube Shorts Style",
    prompt: "Create YouTube Shorts content with attention-grabbing hooks, clear value propositions, and trending hashtags. Make it viral-worthy.",
  },
  {
    id: "prompt-3",
    name: "Instagram Reels Format",
    prompt: "Generate Instagram Reels content with trendy captions, emoji-rich descriptions, and hashtag strategies optimized for maximum engagement.",
  },
  {
    id: "prompt-4",
    name: "Educational Content",
    prompt: "Create educational content that teaches viewers key concepts from the video. Include clear explanations and learning-focused hashtags.",
  },
]

// Demo caption templates
export const demoCaptionTemplates: CaptionTemplate[] = [
  {
    id: "template-1",
    name: "Default Instagram Style",
    font: "TitanOne",
    fontSize: 40,
    fontColor: "#FFFFFF",
    outlineColor: "#000000",
    outlineSize: 3,
    position: "bottom",
    positionOffset: 30,
    wordsPerCaption: 3,
    wordHighlighting: true,
    highlightColor: "#FFFF00",
    highlightStyle: "text",
    backgroundOpacity: 50,
  },
  {
    id: "template-2",
    name: "Minimal Style",
    font: "Arial",
    fontSize: 32,
    fontColor: "#FFFFFF",
    outlineColor: "#000000",
    outlineSize: 2,
    position: "bottom",
    positionOffset: 30,
    wordsPerCaption: 4,
    wordHighlighting: false,
    highlightColor: "#FFFF00",
    highlightStyle: "background",
    backgroundOpacity: 30,
  },
  {
    id: "template-3",
    name: "Bold Style",
    font: "Impact",
    fontSize: 48,
    fontColor: "#FFFFFF",
    outlineColor: "#000000",
    outlineSize: 5,
    position: "center",
    positionOffset: 30,
    wordsPerCaption: 2,
    wordHighlighting: true,
    highlightColor: "#FF0000",
    highlightStyle: "text",
    backgroundOpacity: 70,
  },
]

// Available fonts
export const availableFonts = [
  "TitanOne",
  "Arial",
  "Helvetica",
  "Impact",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Times New Roman",
  "Verdana",
]

// Demo content metadata
export const demoContentMetadata: ContentMetadata[] = [
  {
    id: "meta-1",
    youtubeHeadline: "10 Tips for Better Video Editing",
    postCaption:
      "Learn the top 10 tips that professional video editors use to create stunning content. From color grading to audio mixing, we cover it all!",
    hashtags: "#VideoEditing #ContentCreation #Tips #Tutorial #EditingTips",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-20",
    status: "published",
  },
  {
    id: "meta-2",
    youtubeHeadline: "How to Create Engaging Social Media Videos",
    postCaption:
      "Discover the secrets behind viral social media videos. We'll show you how to grab attention in the first 3 seconds!",
    hashtags: "#SocialMedia #Viral #ContentStrategy #Marketing #VideoMarketing",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-19",
    status: "scheduled",
  },
  {
    id: "meta-3",
    youtubeHeadline: "Mastering Color Grading in 2024",
    postCaption:
      "Color grading can make or break your video. Learn the latest techniques and tools that professionals use to create cinematic looks.",
    hashtags: "#ColorGrading #Cinematic #VideoProduction #Filmmaking #PostProduction",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-18",
    status: "draft",
  },
  {
    id: "meta-4",
    youtubeHeadline: "Quick Editing Hacks for Beginners",
    postCaption:
      "Starting your video editing journey? These quick hacks will save you hours of work and help you create professional-looking content faster!",
    hashtags: "#Beginners #EditingHacks #QuickTips #VideoEditing #LearnEditing",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-17",
    status: "published",
  },
  {
    id: "meta-5",
    youtubeHeadline: "The Future of Automated Video Editing",
    postCaption:
      "AI is revolutionizing video editing. Explore how automated tools are changing the industry and what it means for creators.",
    hashtags: "#AI #Automation #VideoEditing #Technology #FutureOfEditing",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-16",
    status: "published",
  },
  {
    id: "meta-6",
    youtubeHeadline: "Advanced Motion Graphics Techniques",
    postCaption: "Take your videos to the next level with advanced motion graphics and animation techniques.",
    hashtags: "#MotionGraphics #Animation #VideoEffects #Design",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-15",
    status: "published",
  },
  {
    id: "meta-7",
    youtubeHeadline: "Sound Design for Video Production",
    postCaption: "Learn how professional sound design can transform your video content and engage viewers.",
    hashtags: "#SoundDesign #Audio #VideoProduction #Music",
    createdAt: "2024-01-14",
    status: "scheduled",
  },
  {
    id: "meta-8",
    youtubeHeadline: "YouTube SEO Best Practices",
    postCaption: "Optimize your videos for maximum visibility with these proven YouTube SEO strategies.",
    hashtags: "#YouTubeSEO #Optimization #ContentStrategy #Marketing",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-13",
    status: "published",
  },
  {
    id: "meta-9",
    youtubeHeadline: "Creating Engaging Thumbnails",
    postCaption: "Your thumbnail is the first impression. Learn how to create thumbnails that drive clicks.",
    hashtags: "#Thumbnails #Design #YouTubeTips #ContentCreation",
    createdAt: "2024-01-12",
    status: "draft",
  },
  {
    id: "meta-10",
    youtubeHeadline: "Video Compression Made Easy",
    postCaption: "Save storage and improve load times with proper video compression techniques.",
    hashtags: "#VideoCompression #Optimization #Technical #Editing",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-11",
    status: "published",
  },
  {
    id: "meta-11",
    youtubeHeadline: "Building Your Video Brand",
    postCaption: "Establish a consistent brand identity across all your video content.",
    hashtags: "#Branding #ContentStrategy #Marketing #BrandIdentity",
    createdAt: "2024-01-10",
    status: "published",
  },
  {
    id: "meta-12",
    youtubeHeadline: "Multi-Camera Editing Workflow",
    postCaption: "Streamline your multi-camera editing process with these professional workflows.",
    hashtags: "#MultiCamera #Editing #Workflow #Professional",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-09",
    status: "scheduled",
  },
  {
    id: "meta-13",
    youtubeHeadline: "Green Screen Techniques",
    postCaption: "Master green screen compositing and create professional-looking videos on any budget.",
    hashtags: "#GreenScreen #Compositing #Effects #Editing",
    createdAt: "2024-01-08",
    status: "draft",
  },
  {
    id: "meta-14",
    youtubeHeadline: "Timelapse Video Creation",
    postCaption: "Capture time in a unique way with professional timelapse video techniques.",
    hashtags: "#Timelapse #Video #Photography #TimeLapse",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-07",
    status: "published",
  },
  {
    id: "meta-15",
    youtubeHeadline: "Drone Videography Tips",
    postCaption: "Take stunning aerial shots with these essential drone videography techniques.",
    hashtags: "#Drone #Videography #Aerial #Cinematography",
    createdAt: "2024-01-06",
    status: "published",
  },
  {
    id: "meta-16",
    youtubeHeadline: "Video Storytelling Essentials",
    postCaption: "Learn the art of video storytelling and create narratives that captivate your audience.",
    hashtags: "#Storytelling #Video #Narrative #Content",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-05",
    status: "scheduled",
  },
  {
    id: "meta-17",
    youtubeHeadline: "Live Streaming Setup Guide",
    postCaption: "Set up a professional live streaming studio with this comprehensive guide.",
    hashtags: "#LiveStreaming #Streaming #Setup #Guide",
    createdAt: "2024-01-04",
    status: "draft",
  },
  {
    id: "meta-18",
    youtubeHeadline: "Video Analytics and Metrics",
    postCaption: "Understand your video performance with these essential analytics and metrics.",
    hashtags: "#Analytics #Metrics #YouTubeAnalytics #Data",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ffb7pdx8b6327h39cf2a3b3c59d82537b826bgen30l6.mp4",
    createdAt: "2024-01-03",
    status: "published",
  },
  {
    id: "meta-19",
    youtubeHeadline: "Collaborative Video Editing",
    postCaption: "Work seamlessly with your team using collaborative video editing tools and workflows.",
    hashtags: "#Collaboration #Teamwork #VideoEditing #Workflow",
    createdAt: "2024-01-02",
    status: "published",
  },
  {
    id: "meta-20",
    youtubeHeadline: "Mobile Video Editing Tips",
    postCaption: "Create professional videos on the go with these mobile editing tips and tricks.",
    hashtags: "#MobileEditing #Smartphone #Video #Tips",
    videoUrl: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/impact_nine/in_queue/ff4t1y18b626daeh5e6a3b3df36279cgaa5ffhdgyld3.mp4",
    createdAt: "2024-01-01",
    status: "published",
  },
  {
    id: "meta-21",
    youtubeHeadline: "Video Marketing Strategy",
    postCaption: "Develop a comprehensive video marketing strategy that drives results.",
    hashtags: "#VideoMarketing #Strategy #Marketing #Business",
    createdAt: "2023-12-31",
    status: "scheduled",
  },
]

// Demo source data
export const demoSource: ContentSource = {
  id: "source-1",
  name: "Instagram Stories Source",
  aspectRatio: "9:16",
  orientation: "vertical",
  schedulerEnabled: true,
  totalVideos: 1247,
  createdAt: "2024-01-15",
}

// Helper function to generate metadata from video file
export function generateMetadataFromVideo(file: VideoFile): ContentMetadata {
  const filename = file.filename.replace(/\.[^/.]+$/, "") // Remove extension
  const words = filename.split(/[-_\s]+/).filter(Boolean)
  const title = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
  
  const headline = title || "Untitled Video"
  const caption = `Check out this amazing video: ${headline}. Don't forget to like and subscribe for more content!`
  const hashtags = words
    .slice(0, 5)
    .map((word) => `#${word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}`)
    .join(" ") || "#Video #Content #Upload"

  return {
    id: `meta-${file.id}`,
    youtubeHeadline: headline,
    postCaption: caption,
    hashtags,
    videoUrl: file.url,
    createdAt: new Date().toISOString().split("T")[0],
    status: "draft",
  }
}
