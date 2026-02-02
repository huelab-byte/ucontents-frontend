// Format date to relative time (e.g., "3 days ago")
export function formatDate(dateString: string): string {
  if (!dateString) return "N/A"
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
  } else {
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`
  }
}

// Format date in a specific timezone (e.g., "Feb 1, 2026, 8:31 PM")
export function formatDateInTimezone(dateString: string, timezone: string = 'UTC'): string {
  if (!dateString) return "N/A"
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"
  
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    // Fallback if timezone is invalid
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
}

// Format date only (no time) in a specific timezone (e.g., "Feb 1, 2026")
export function formatDateOnlyInTimezone(dateString: string, timezone: string = 'UTC'): string {
  if (!dateString) return "N/A"
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"
  
  try {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    // Fallback if timezone is invalid
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}
