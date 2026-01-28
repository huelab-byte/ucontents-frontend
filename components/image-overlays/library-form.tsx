"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"

interface LibraryFormProps {
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export function LibraryForm({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: LibraryFormProps) {
  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel>
          <Label>Library Name</Label>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Library Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <Label>Description</Label>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
          />
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}
