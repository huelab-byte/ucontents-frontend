"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  asChild?: boolean
}

function CollapsibleTrigger({ asChild, children, ...props }: CollapsibleTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <CollapsiblePrimitive.Trigger
        data-slot="collapsible-trigger"
        {...props}
        render={children}
        nativeButton={false}
      />
    )
  }
  
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props}>
      {children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  const isMountedRef = React.useRef(true)
  
  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  
  // Wrap in error boundary to catch portal cleanup errors
  try {
    return (
      <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
    )
  } catch (error: any) {
    // Suppress portal cleanup errors
    if (
      error?.message?.includes("removeChild") ||
      error?.message?.includes("Cannot read properties of null")
    ) {
      return null
    }
    throw error
  }
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
