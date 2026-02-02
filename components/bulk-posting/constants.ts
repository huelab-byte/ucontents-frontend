import type { BulkPostingItem, ContentSourceType } from "./types"
import type { SocialChannel, SocialConnectionGroup } from "@/lib/api"

// Demo channels for development (in production, these come from the API)
export const demoChannels: SocialChannel[] = [
  {
    id: 1,
    provider: "meta",
    type: "facebook_page",
    provider_channel_id: "123456789",
    name: "Acme Business Page",
    username: "acmebusiness",
    avatar_url: null,
    is_active: true,
    group_id: 1,
  },
  {
    id: 2,
    provider: "meta",
    type: "instagram_business",
    provider_channel_id: "987654321",
    name: "Acme Instagram",
    username: "@acme_official",
    avatar_url: null,
    is_active: true,
    group_id: 1,
  },
  {
    id: 3,
    provider: "google",
    type: "youtube_channel",
    provider_channel_id: "UC123456",
    name: "Acme YouTube Channel",
    username: "AcmeOfficial",
    avatar_url: null,
    is_active: true,
    group_id: null,
  },
  {
    id: 4,
    provider: "tiktok",
    type: "tiktok_profile",
    provider_channel_id: "tiktok123",
    name: "Acme TikTok",
    username: "@acme_tiktok",
    avatar_url: null,
    is_active: true,
    group_id: 2,
  },
  {
    id: 5,
    provider: "meta",
    type: "facebook_page",
    provider_channel_id: "555555555",
    name: "Tech Brand Page",
    username: "techbrand",
    avatar_url: null,
    is_active: true,
    group_id: 2,
  },
]

// Demo groups for development (in production, these come from the API)
export const demoGroups: SocialConnectionGroup[] = [
  {
    id: 1,
    name: "Main Brand Accounts",
    user_id: 1,
  },
  {
    id: 2,
    name: "Secondary Channels",
    user_id: 1,
  },
]

export const demoBulkPosting: BulkPostingItem[] = [
  {
    id: "bp-1",
    brand: {
      name: "Acme Corporation",
      projectName: "Summer Campaign Toolkit",
    },
    connections: {
      channels: [1, 2],
      groups: [],
    },
    contentSourceType: "media_upload",
    contentSource: ["Instagram Stories"],
    totalPost: 100,
    postedAmount: 45,
    remainingContent: 55,
    startedDate: "2024-01-15",
    status: "running",
  },
  {
    id: "bp-2",
    brand: {
      name: "TechStart Inc",
      projectName: "Product Launch Kit",
    },
    connections: {
      channels: [],
      groups: [1],
    },
    contentSourceType: "csv_file",
    contentSource: [],
    totalPost: 250,
    postedAmount: 250,
    remainingContent: 0,
    startedDate: "2024-01-10",
    status: "completed",
  },
  {
    id: "bp-3",
    brand: {
      name: "Fashion Hub",
      projectName: "Spring Collection",
    },
    connections: {
      channels: [2, 4],
      groups: [],
    },
    contentSourceType: "media_upload",
    contentSource: ["Instagram Stories"],
    totalPost: 80,
    postedAmount: 0,
    remainingContent: 80,
    startedDate: "2024-01-20",
    status: "draft",
  },
  {
    id: "bp-4",
    brand: {
      name: "Foodie Delights",
      projectName: "Recipe Series",
    },
    connections: {
      channels: [1, 3],
      groups: [],
    },
    contentSourceType: "media_upload",
    contentSource: ["YouTube Shorts"],
    totalPost: 150,
    postedAmount: 120,
    remainingContent: 30,
    startedDate: "2024-01-05",
    status: "paused",
  },
  {
    id: "bp-5",
    brand: {
      name: "Fitness Plus",
      projectName: "Workout Challenge",
    },
    connections: {
      channels: [],
      groups: [2],
    },
    contentSourceType: "media_upload",
    contentSource: ["Facebook Feed"],
    totalPost: 200,
    postedAmount: 50,
    remainingContent: 150,
    startedDate: "2024-01-12",
    status: "failed",
  },
]

// Content source type options for initial selection
export const contentSourceTypeOptions: { value: ContentSourceType; label: string; description: string }[] = [
  {
    value: "csv_file",
    label: "From File",
    description: "Import content from a CSV file",
  },
  {
    value: "media_upload",
    label: "Media Upload",
    description: "Select folders from media library",
  },
]

// Demo media folders for selection (in production, these will come from the MediaUpload module API)
export const mediaFolders = [
  "Instagram Stories",
  "YouTube Shorts",
  "Facebook Feed",
  "TikTok Vertical",
  "LinkedIn Landscape",
  "Twitter Videos",
]

// Legacy exports for backward compatibility
export const mediaModules = mediaFolders
export const contentSources = mediaFolders
