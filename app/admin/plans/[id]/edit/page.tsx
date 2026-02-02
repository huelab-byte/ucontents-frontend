"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { CreditCardIcon, ArrowLeftIcon } from "@hugeicons/core-free-icons"
import { planService, type UpdatePlanRequest, type PlanSubscriptionType } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

const BYTES_PER_GB = 1073741824

function bytesToGB(bytes: number): string {
  if (bytes === 0) return "0"
  const gb = bytes / BYTES_PER_GB
  return gb % 1 === 0 ? String(gb) : gb.toFixed(2)
}

function gbToBytes(gb: string): number {
  const n = parseFloat(gb)
  if (isNaN(n) || n < 0) return 0
  return Math.round(n * BYTES_PER_GB)
}

const SUBSCRIPTION_TYPES: { value: PlanSubscriptionType; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "lifetime", label: "Lifetime" },
]

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const planId = Number(params?.id)
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [subscriptionType, setSubscriptionType] = React.useState<PlanSubscriptionType>("monthly")
  const [price, setPrice] = React.useState("0")
  const [currency, setCurrency] = React.useState("USD")
  const [aiUsageLimit, setAiUsageLimit] = React.useState<string>("")
  const [maxFileUpload, setMaxFileUpload] = React.useState("10")
  const [storageGB, setStorageGB] = React.useState("1")
  const [featuresText, setFeaturesText] = React.useState("")
  const [maxConnections, setMaxConnections] = React.useState("5")
  const [monthlyPostLimit, setMonthlyPostLimit] = React.useState<string>("")
  const [isActive, setIsActive] = React.useState(true)
  const [sortOrder, setSortOrder] = React.useState("0")
  const [featured, setFeatured] = React.useState(false)
  const [isFreePlan, setIsFreePlan] = React.useState(false)
  const [trialDays, setTrialDays] = React.useState<string>("")

  const canManage = hasPermission("manage_plans")

  React.useEffect(() => {
    if (!canManage || !planId || isNaN(planId)) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const response = await planService.getById(planId)
        if (cancelled) return
        if (response.success && response.data) {
          const p = response.data
          setName(p.name)
          setSlug(p.slug)
          setDescription(p.description ?? "")
          setSubscriptionType(p.subscription_type)
          setPrice(String(p.price))
          setCurrency(p.currency ?? "USD")
          setAiUsageLimit(p.ai_usage_limit != null ? String(p.ai_usage_limit) : "")
          setMaxFileUpload(String(p.max_file_upload))
          setStorageGB(bytesToGB(p.total_storage_bytes))
          setMaxConnections(String(p.max_connections))
          setMonthlyPostLimit(p.monthly_post_limit != null ? String(p.monthly_post_limit) : "")
          setIsActive(p.is_active)
          setSortOrder(String(p.sort_order))
          setFeatured(p.featured ?? false)
          setIsFreePlan(p.is_free_plan ?? false)
          setTrialDays(p.trial_days != null ? String(p.trial_days) : "")
          setFeaturesText(Array.isArray(p.features) ? p.features.join("\n") : "")
        } else {
          toast.error("Plan not found")
          router.push("/admin/plans")
        }
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load plan")
          router.push("/admin/plans")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [canManage, planId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage || !planId || isNaN(planId)) return

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Price must be a non-negative number")
      return
    }

    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Slug is required")
      return
    }

    setSaving(true)
    try {
      const payload: UpdatePlanRequest = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        subscription_type: subscriptionType,
        price: parsedPrice,
        currency: currency.trim() || "USD",
        is_active: isActive,
        sort_order: parseInt(sortOrder, 10) || 0,
        featured,
        is_free_plan: isFreePlan,
        trial_days: trialDays !== "" ? parseInt(trialDays, 10) : null,
        max_file_upload: parseInt(maxFileUpload, 10) || 0,
        total_storage_bytes: gbToBytes(storageGB),
        max_connections: parseInt(maxConnections, 10) || 0,
      }
      if (aiUsageLimit !== "") {
        const v = parseInt(aiUsageLimit, 10)
        if (!isNaN(v) && v >= 0) payload.ai_usage_limit = v
      }
      if (monthlyPostLimit !== "") {
        const v = parseInt(monthlyPostLimit, 10)
        if (!isNaN(v) && v >= 0) payload.monthly_post_limit = v
      }
      const features = featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      payload.features = features.length ? features : null

      const response = await planService.update(planId, payload)
      if (response.success) {
        toast.success(response.message || "Plan updated successfully")
        router.push("/admin/plans")
      } else {
        toast.error(response.message || "Failed to update plan")
      }
    } catch (err: unknown) {
      console.error("Update plan error:", err)
      toast.error("Failed to update plan")
    } finally {
      setSaving(false)
    }
  }

  if (!canManage) {
    return (
      <AdminDashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <p className="text-muted-foreground">You do not have permission to edit plans.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={CreditCardIcon} className="size-8" />
              Edit Plan
            </h1>
            <p className="text-muted-foreground mt-2">
              Update subscription plan details
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/plans")}>
            <HugeiconsIcon icon={ArrowLeftIcon} className="size-4 mr-2" />
            Back to Plans
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Plan details</CardTitle>
              <CardDescription>
                Set name, slug, billing type, price, and limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Name *</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Pro Monthly"
                      required
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Slug *</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. pro-monthly"
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field orientation="vertical">
                <FieldLabel>
                  <Label>Description</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional plan description"
                    rows={2}
                  />
                </FieldContent>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Subscription type *</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={subscriptionType}
                      onValueChange={(v) => setSubscriptionType(v as PlanSubscriptionType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSCRIPTION_TYPES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Price *</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field orientation="vertical">
                <FieldLabel>
                  <Label>Currency</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    maxLength={3}
                    className="w-24"
                  />
                </FieldContent>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field orientation="vertical">
                  <div className="flex items-center gap-2">
                    <Switch checked={featured} onCheckedChange={setFeatured} />
                    <Label>Featured</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Highlight on pricing page</p>
                </Field>
                <Field orientation="vertical">
                  <div className="flex items-center gap-2">
                    <Switch checked={isFreePlan} onCheckedChange={setIsFreePlan} />
                    <Label>Free plan</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">No payment, can be default for new users</p>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Trial days</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                      placeholder="0 = no trial"
                    />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Max file upload</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      value={maxFileUpload}
                      onChange={(e) => setMaxFileUpload(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Storage (GB)</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={storageGB}
                      onChange={(e) => setStorageGB(e.target.value)}
                      placeholder="e.g. 1 or 2.5"
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Max connections</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      value={maxConnections}
                      onChange={(e) => setMaxConnections(e.target.value)}
                    />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>AI usage limit</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      value={aiUsageLimit}
                      onChange={(e) => setAiUsageLimit(e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Monthly post limit</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      value={monthlyPostLimit}
                      onChange={(e) => setMonthlyPostLimit(e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field orientation="vertical">
                <FieldLabel>
                  <Label>Features (one per line)</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder="Feature one&#10;Feature two"
                    rows={4}
                  />
                </FieldContent>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>Sort order</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label>Active</Label>
                  </div>
                </Field>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/plans")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminDashboardLayout>
  )
}
