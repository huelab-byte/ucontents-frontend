import type { Library, AudioTrack } from "./types"

export const demoLibraries: Library[] = [
  {
    id: "calm",
    name: "Calm",
    description: "Soft, minimal, relaxing tracks for narration, nature, or slow visuals",
    trackCount: 142,
    lastUpdated: "2 days ago",
    isStarred: true,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Epic, atmospheric music for dramatic or storytelling videos",
    trackCount: 198,
    lastUpdated: "1 week ago",
    isStarred: false,
  },
  {
    id: "upbeat",
    name: "Upbeat",
    description: "Energetic and positive tracks for fast-paced or social content",
    trackCount: 167,
    lastUpdated: "3 days ago",
    isStarred: true,
  },
  {
    id: "suspense",
    name: "Suspense",
    description: "Tension-building music for mystery, thrill, or reveal moments",
    trackCount: 89,
    lastUpdated: "5 days ago",
    isStarred: false,
  },
]

export const folderData: Record<string, { id: string; name: string; description: string; tracks: AudioTrack[] }> = {
  calm: {
    id: "calm",
    name: "Calm",
    description: "Soft, minimal, relaxing tracks for narration, nature, or slow visuals",
    tracks: [
      {
        id: "1",
        filename: "ElevenLabs_2025-11-17T15_56_27_Brian_pre_sp98_s69_sb42_v3.mp3",
        duration: "2:45",
        lastUpdated: "2 days ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/ig-temp/ElevenLabs_2025-11-17T15_56_27_Brian_pre_sp98_s69_sb42_v3.mp3",
      },
      {
        id: "2",
        filename: "ElevenLabs_2025-11-17T15_55_01_Brian_pre_sp98_s69_sb42_v3.mp3",
        duration: "3:12",
        lastUpdated: "1 week ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/ig-temp/ElevenLabs_2025-11-17T15_55_01_Brian_pre_sp98_s69_sb42_v3.mp3",
      },
      {
        id: "3",
        filename: "ElevenLabs_2025-11-17T15_58_31_Brian_pre_sp98_s69_sb42_v3.mp3",
        duration: "4:05",
        lastUpdated: "3 days ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/ig-temp/ElevenLabs_2025-11-17T15_58_31_Brian_pre_sp98_s69_sb42_v3.mp3",
      },
      {
        id: "4",
        filename: "ElevenLabs_2025-11-17T16_01_15_Brian_pre_sp98_s69_sb42_v3.mp3",
        duration: "3:30",
        lastUpdated: "1 day ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/ig-temp/ElevenLabs_2025-11-17T16_01_15_Brian_pre_sp98_s69_sb42_v3.mp3",
      },
    ],
  },
  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    description: "Epic, atmospheric music for dramatic or storytelling videos",
    tracks: [
      {
        id: "1",
        filename: "epic_orchestra_001.mp3",
        duration: "3:45",
        lastUpdated: "1 week ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "dramatic_score_002.mp3",
        duration: "4:20",
        lastUpdated: "2 days ago",
        status: "READY",
      },
    ],
  },
  upbeat: {
    id: "upbeat",
    name: "Upbeat",
    description: "Energetic and positive tracks for fast-paced or social content",
    tracks: [
      {
        id: "1",
        filename: "energetic_pop_001.mp3",
        duration: "2:50",
        lastUpdated: "3 days ago",
        status: "READY",
      },
    ],
  },
  suspense: {
    id: "suspense",
    name: "Suspense",
    description: "Tension-building music for mystery, thrill, or reveal moments",
    tracks: [
      {
        id: "1",
        filename: "tension_build_001.mp3",
        duration: "3:00",
        lastUpdated: "5 days ago",
        status: "READY",
      },
    ],
  },
}
