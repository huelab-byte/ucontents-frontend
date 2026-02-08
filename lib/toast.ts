import { toast as sonnerToast } from 'sonner'

/** Duration that keeps the toast visible until the user dismisses it (no auto-hide). */
const PERSISTENT_DURATION = Number.POSITIVE_INFINITY

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    })
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    })
  },
  /**
   * Show an error toast that does not auto-hide, so the user can read it and go fix the issue
   * (e.g. configure API key in Configuration → AI Settings).
   */
  errorPersistent: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: PERSISTENT_DURATION,
    })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    })
  },
}
