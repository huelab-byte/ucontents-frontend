"use client"

import * as React from "react"
import type { ManualPostingItem } from "./types"

interface BrandDisplayProps {
  brand: ManualPostingItem["brand"]
}

export function BrandDisplay({ brand }: BrandDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      {brand.logo ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="size-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary">
            {brand.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <div className="font-medium truncate">{brand.name}</div>
        <div className="text-xs text-muted-foreground truncate">{brand.projectName}</div>
      </div>
    </div>
  )
}
