import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { toast } from '@/lib/toast'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
  pagination?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Extend AxiosRequestConfig to include custom option for disabling toasts
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipToast?: boolean // Set to true to skip showing toast for this request
  }
}

// Configuration for showing toasts globally
let showToasts = true

export const setShowToasts = (show: boolean) => {
  showToasts = show
}

export const getShowToasts = () => showToasts

// Get API base URL - throw error if not configured in production
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production')
  }
  return apiUrl || 'http://localhost:8000/api'
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    const config = response.config
    
    // Check if toasts should be shown for this request
    const shouldShowToast = showToasts && !config.skipToast
    
    // Show success toast for successful responses (except GET requests which are usually silent)
    if (shouldShowToast && data.success && data.message) {
      const method = config.method?.toUpperCase()
      
      // Only show success toasts for non-GET requests (POST, PUT, PATCH, DELETE)
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        toast.success(data.message)
      }
    }
    
    // Return the response data directly (axios wraps it)
    return response.data
  },
  (error: AxiosError<ApiError>) => {
    const config = error.config || ({} as InternalAxiosRequestConfig)
    const shouldShowToast = showToasts && !config.skipToast
    
    let errorMessage = 'An error occurred.'
    let errorDescription: string | undefined
    
    // Handle network errors
    if (!error.response) {
      errorMessage = 'Network error. Please check your connection.'
      if (shouldShowToast) {
        toast.error(errorMessage)
      }
      return Promise.reject({
        success: false,
        message: errorMessage,
      })
    }

    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response.status === 401) {
      errorMessage = error.response.data?.message || 'Unauthorized. Please login again.'
      if (typeof window !== 'undefined') {
        // Don't redirect if we're already on an auth page (prevents redirect loops)
        const currentPath = window.location.pathname
        const isOnAuthPage = currentPath.startsWith('/auth/')
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Only redirect if not already on an auth page
        if (!isOnAuthPage) {
          window.location.href = '/auth/login'
        }
      }
      // Always show toast for 401 errors (important for user feedback)
      if (showToasts) {
        toast.error(errorMessage)
      }
      return Promise.reject({
        success: false,
        message: errorMessage,
        response: error.response,
      })
    }

    // Handle 403 Forbidden - Check if it's a 2FA setup requirement
    if (error.response.status === 403) {
      const responseData = error.response.data as any
      if (responseData?.requires_2fa_setup) {
        errorMessage = responseData.message || 'Two-factor authentication is required. Please set it up to continue.'
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const isOn2FASetupPage = currentPath === '/auth/2fa-setup'
          
          // Only redirect if not already on 2FA setup page
          if (!isOn2FASetupPage) {
            // Get user email from localStorage or user context
            const userStr = localStorage.getItem('user')
            let userEmail = ''
            if (userStr) {
              try {
                const user = JSON.parse(userStr)
                userEmail = user.email || ''
              } catch (e) {
                // Ignore parse errors
              }
            }
            
            if (userEmail) {
              window.location.href = `/auth/2fa-setup?email=${encodeURIComponent(userEmail)}`
            } else {
              window.location.href = '/auth/2fa-setup'
            }
          }
        }
        if (shouldShowToast) {
          toast.error(errorMessage)
        }
        return Promise.reject({
          success: false,
          message: errorMessage,
          requires_2fa_setup: true,
          response: error.response,
        })
      }
      
      // Regular 403 error
      errorMessage = error.response.data?.message || 'You are not authorized to perform this action.'
      if (shouldShowToast) {
        toast.error(errorMessage)
      }
      return Promise.reject({
        success: false,
        message: errorMessage,
      })
    }

    // Handle validation errors (422)
    if (error.response.status === 422) {
      errorMessage = error.response.data?.message || 'Validation failed.'
      const errors = error.response.data?.errors
      
      // Create description from validation errors
      if (errors && Object.keys(errors).length > 0) {
        const errorList = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')
        errorDescription = errorList
      }
      
      if (shouldShowToast) {
        toast.error(errorMessage, errorDescription)
      }
      return Promise.reject({
        success: false,
        message: errorMessage,
        errors,
      })
    }

    // Handle other errors
    errorMessage = error.response.data?.message || error.message || 'An error occurred.'
    if (shouldShowToast) {
      toast.error(errorMessage)
    }
    return Promise.reject({
      success: false,
      message: errorMessage,
      errors: error.response.data?.errors,
    })
  }
)

/**
 * Download a file from a URL.
 * Handles both API-served files (uses auth) and external storage URLs.
 * @param url - The URL to download from (can be relative API path or full external URL)
 * @param filename - The filename for the downloaded file
 * @param useAuth - Whether to include auth headers (default: auto-detect based on URL)
 */
export async function downloadFile(url: string, filename: string, useAuth?: boolean): Promise<void> {
  const isExternalUrl = url.startsWith('http://') || url.startsWith('https://')
  const shouldUseAuth = useAuth ?? !isExternalUrl
  
  try {
    if (shouldUseAuth && !isExternalUrl) {
      // Use apiClient for API-served files
      // Note: When using responseType: 'blob', axios returns the blob in response.data
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }
      
      const fullUrl = `${getApiBaseUrl()}${url}`
      
      try {
        const response = await axios.get(fullUrl, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          validateStatus: (status) => status < 500, // Don't throw on 4xx, we'll handle it
        })
        
        // Check if response status indicates success
        if (response.status >= 200 && response.status < 300) {
          // Check content type to see if it's actually a file or an error
          const contentType = response.headers['content-type'] || ''
          
          // If it's JSON or HTML, it's likely an error response
          if (contentType.includes('application/json') || contentType.includes('text/html')) {
            // Read the blob as text to check if it's an error
            const text = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsText(response.data)
            })
            
            if (text.trim().startsWith('{')) {
              // Try to parse as JSON error
              try {
                const errorData = JSON.parse(text)
                throw new Error(errorData.message || 'Download failed')
              } catch {
                throw new Error('Server returned an error')
              }
            } else if (text.includes('<!DOCTYPE') || text.includes('<html')) {
              throw new Error('Server returned an error page')
            }
          }
          
          // It's a valid file, trigger download
          triggerDownload(response.data, filename)
        } else {
          // 4xx error - try to read error message
          const contentType = response.headers['content-type'] || ''
          if (contentType.includes('application/json')) {
            const text = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsText(response.data)
            })
            try {
              const errorData = JSON.parse(text)
              throw new Error(errorData.message || `Download failed (${response.status})`)
            } catch {
              throw new Error(`Download failed (${response.status})`)
            }
          }
          throw new Error(`Download failed (${response.status})`)
        }
      } catch (axiosError: any) {
        // Re-throw if it's already our custom error
        if (axiosError.message && !axiosError.isAxiosError) {
          throw axiosError
        }
        
        // If axios error with response, try to extract error message
        if (axiosError.response) {
          const contentType = axiosError.response.headers['content-type'] || ''
          if (contentType.includes('application/json') && axiosError.response.data) {
            try {
              const text = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsText(axiosError.response.data)
              })
              const errorData = JSON.parse(text)
              throw new Error(errorData.message || 'Download failed')
            } catch {
              // If parsing fails, use default error
            }
          }
        }
        throw new Error(axiosError.message || 'Download failed')
      }
    } else if (isExternalUrl) {
      // For external URLs with useAuth, try with credentials
      if (shouldUseAuth) {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Download failed')
        }
        const blob = await response.blob()
        triggerDownload(blob, filename)
      } else {
        // For external URLs without auth, fetch directly
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) {
          throw new Error('Download failed')
        }
        const blob = await response.blob()
        triggerDownload(blob, filename)
      }
    }
  } catch (error) {
    console.error('Blob download failed, falling back to direct link:', error)
    // Fallback: open URL in new tab for the user to download manually
    if (isExternalUrl) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // For API URLs, open with auth token in query (not recommended but fallback)
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Cannot download: No authentication token available')
        alert('Unable to download file: Please log in again.')
        return
      }
      const fullUrl = `${getApiBaseUrl()}${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
    }
  }
}

/**
 * Helper to trigger browser download from a blob
 */
function triggerDownload(blob: Blob, filename: string): void {
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}

export default apiClient
