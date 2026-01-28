"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"

export interface PasswordRequirements {
  min_length: number
  require_uppercase: boolean
  require_number: boolean
  require_special: boolean
}

interface PasswordComplexityIndicatorProps {
  password: string
  requirements: PasswordRequirements
  className?: string
}

interface RequirementCheck {
  label: string
  met: boolean
  required: boolean
}

export function PasswordComplexityIndicator({
  password,
  requirements,
  className,
}: PasswordComplexityIndicatorProps) {
  const checks = React.useMemo<RequirementCheck[]>(() => {
    const checks: RequirementCheck[] = []

    // Minimum length check
    checks.push({
      label: `At least ${requirements.min_length} characters`,
      met: password.length >= requirements.min_length,
      required: true,
    })

    // Uppercase check
    if (requirements.require_uppercase) {
      checks.push({
        label: "One uppercase letter",
        met: /[A-Z]/.test(password),
        required: true,
      })
    }

    // Number check
    if (requirements.require_number) {
      checks.push({
        label: "One number",
        met: /[0-9]/.test(password),
        required: true,
      })
    }

    // Special character check
    if (requirements.require_special) {
      checks.push({
        label: "One special character",
        met: /[^a-zA-Z0-9]/.test(password),
        required: true,
      })
    }

    return checks
  }, [password, requirements])

  const allMet = checks.every((check) => check.met)
  const hasPassword = password.length > 0

  if (!hasPassword) {
    return null
  }

  return (
    <div className={cn("space-y-2 mt-2", className)}>
      <div className="space-y-1.5">
        {checks.map((check, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              check.met
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {check.met ? (
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-4 shrink-0"
              />
            ) : (
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-4 shrink-0"
              />
            )}
            <span className={cn(check.met && "font-medium")}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
      {allMet && (
        <div className="pt-1.5 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="size-4"
            />
            Password meets all requirements
          </p>
        </div>
      )}
    </div>
  )
}
