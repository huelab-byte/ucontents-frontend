import type { Library } from "./types"

export function formatLibraryPath(library: Library): string {
  return library.path || library.name
}
