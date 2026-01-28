import type { ManualPostingItem } from "./types"

export const demoManualPosting: ManualPostingItem[] = [
  {
    id: "mp-1",
    brand: {
      name: "Acme Corporation",
      projectName: "Summer Campaign Toolkit",
    },
    connectedTo: {
      facebook: true,
      instagram: true,
      tiktok: false,
      youtube: true,
    },
    contentSource: ["Instagram Stories Source"],
    totalPost: 100,
    postedAmount: 45,
    remainingContent: 55,
    startedDate: "2024-01-15",
    status: "running",
  },
  {
    id: "mp-2",
    brand: {
      name: "TechStart Inc",
      projectName: "Product Launch Kit",
    },
    connectedTo: {
      facebook: true,
      instagram: true,
      tiktok: true,
      youtube: true,
    },
    contentSource: ["TikTok Vertical Source"],
    totalPost: 250,
    postedAmount: 250,
    remainingContent: 0,
    startedDate: "2024-01-10",
    status: "completed",
  },
  {
    id: "mp-3",
    brand: {
      name: "Fashion Hub",
      projectName: "Spring Collection",
    },
    connectedTo: {
      facebook: false,
      instagram: true,
      tiktok: true,
      youtube: false,
    },
    contentSource: ["Instagram Stories Source"],
    totalPost: 80,
    postedAmount: 0,
    remainingContent: 80,
    startedDate: "2024-01-20",
    status: "draft",
  },
  {
    id: "mp-4",
    brand: {
      name: "Foodie Delights",
      projectName: "Recipe Series",
    },
    connectedTo: {
      facebook: true,
      instagram: true,
      tiktok: false,
      youtube: true,
    },
    contentSource: ["YouTube Shorts Source"],
    totalPost: 150,
    postedAmount: 120,
    remainingContent: 30,
    startedDate: "2024-01-05",
    status: "paused",
  },
  {
    id: "mp-5",
    brand: {
      name: "Fitness Plus",
      projectName: "Workout Challenge",
    },
    connectedTo: {
      facebook: true,
      instagram: false,
      tiktok: true,
      youtube: true,
    },
    contentSource: ["Facebook Feed Source"],
    totalPost: 200,
    postedAmount: 50,
    remainingContent: 150,
    startedDate: "2024-01-12",
    status: "failed",
  },
]

export const contentSources = [
  "Instagram Stories Source",
  "YouTube Shorts Source",
  "Facebook Feed Source",
  "TikTok Vertical Source",
  "LinkedIn Landscape Source",
  "Twitter Video Source",
]
