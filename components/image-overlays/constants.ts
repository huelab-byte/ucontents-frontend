import type { Library, ImageOverlay } from "./types"

export const demoLibraries: Library[] = [
  {
    id: "particles",
    name: "Particles",
    description: "Static dust, light specks, or abstract particle textures",
    itemCount: 134,
    lastUpdated: "2 days ago",
    isStarred: true,
  },
  {
    id: "vignette",
    name: "Vignette",
    description: "Soft edge shading to enhance focus and contrast",
    itemCount: 87,
    lastUpdated: "5 days ago",
    isStarred: false,
  },
]

export const libraryData: Record<string, { id: string; name: string; description: string; overlays: ImageOverlay[] }> = {
  particles: {
    id: "particles",
    name: "Particles",
    description: "Static dust, light specks, or abstract particle textures",
    overlays: [
      {
        id: "1",
        filename: "dust_texture_001.png",
        fileSize: "2.5 MB",
        lastUpdated: "2 days ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "light_specs_002.png",
        fileSize: "3.1 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
      {
        id: "3",
        filename: "particle_texture_003.png",
        fileSize: "2.8 MB",
        lastUpdated: "3 days ago",
        status: "READY",
      },
    ],
  },
  vignette: {
    id: "vignette",
    name: "Vignette",
    description: "Soft edge shading to enhance focus and contrast",
    overlays: [
      {
        id: "1",
        filename: "vignette_soft_001.png",
        fileSize: "1.8 MB",
        lastUpdated: "5 days ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "vignette_dark_002.png",
        fileSize: "2.2 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
    ],
  },
}
