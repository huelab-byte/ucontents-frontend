"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"

interface LibraryFormProps {
  name: string
  onNameChange: (value: string) => void
}

export function LibraryForm({
  name,
  onNameChange,
}: LibraryFormProps) {
  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel>
          <Label>Folder Name</Label>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Folder Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}
