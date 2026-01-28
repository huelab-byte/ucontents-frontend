"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LibraryFormProps {
  name: string
  onNameChange: (name: string) => void
}

export function LibraryForm({ name, onNameChange }: LibraryFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Folder Name</Label>
        <Input
          id="name"
          placeholder="Enter folder name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
    </div>
  )
}
