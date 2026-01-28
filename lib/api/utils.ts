/**
 * Get the API base URL without the /api suffix
 * Useful for constructing URLs for static assets, storage files, etc.
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production')
  }
  // Remove trailing /api if present to get base server URL
  const baseUrl = apiUrl || 'http://localhost:8000/api'
  return baseUrl.replace(/\/api\/?$/, '')
}

/**
 * Get the full API URL (with /api suffix)
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production')
  }
  return apiUrl || 'http://localhost:8000/api'
}

/**
 * Construct a storage URL for files stored on the backend
 */
export const getStorageUrl = (path: string): string => {
  if (!path) return ''
  // If path is already a full URL, return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Otherwise, prepend the base URL
  const baseUrl = getApiBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
