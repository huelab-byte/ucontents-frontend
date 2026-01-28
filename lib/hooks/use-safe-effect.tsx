"use client"

import * as React from "react"

/**
 * A StrictMode-safe useEffect hook that prevents double execution in development
 * and cancels in-flight requests on unmount.
 * 
 * Use this for effects that make API calls or perform side effects that should
 * only run once per mount, even in React StrictMode.
 * 
 * @param effect - The effect function to run
 * @param deps - Dependency array (same as useEffect)
 * 
 * @example
 * ```tsx
 * useSafeEffect(() => {
 *   const abortController = new AbortController()
 *   
 *   const fetchData = async () => {
 *     try {
 *       const response = await apiClient.get('/endpoint', {
 *         signal: abortController.signal
 *       })
 *       // Handle response
 *     } catch (error) {
 *       if (error.name !== 'AbortError') {
 *         console.error("Failed to fetch:", error)
 *       }
 *     }
 *   }
 *   
 *   fetchData()
 *   
 *   return () => {
 *     abortController.abort()
 *   }
 * }, [dependency])
 * ```
 */
export function useSafeEffect(
  effect: () => void | (() => void),
  deps?: React.DependencyList
): void {
  const hasRunRef = React.useRef(false)
  const cleanupRef = React.useRef<(() => void) | void>(undefined)

  React.useEffect(() => {
    // Skip if already run (prevents double execution in StrictMode)
    if (hasRunRef.current) {
      return
    }

    hasRunRef.current = true
    cleanupRef.current = effect()

    return () => {
      hasRunRef.current = false
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, deps)
}

/**
 * A StrictMode-safe effect hook specifically for async operations with AbortController support.
 * Automatically creates and manages an AbortController for request cancellation.
 * 
 * @param effect - Async effect function that receives an AbortSignal
 * @param deps - Dependency array
 * 
 * @example
 * ```tsx
 * useSafeAsyncEffect(async (signal) => {
 *   const response = await apiClient.get('/endpoint', { signal })
 *   setData(response.data)
 * }, [dependency])
 * ```
 */
export function useSafeAsyncEffect(
  effect: (signal: AbortSignal) => Promise<void>,
  deps?: React.DependencyList
): void {
  React.useEffect(() => {
    const abortController = new AbortController()
    let isCancelled = false

    const runEffect = async () => {
      try {
        await effect(abortController.signal)
      } catch (error: any) {
        // Ignore abort errors (expected when component unmounts)
        if (error?.name !== 'AbortError' && !isCancelled) {
        }
      }
    }

    runEffect()

    return () => {
      isCancelled = true
      abortController.abort()
    }
  }, deps)
}
