"use client"

import * as React from "react"
import { Suspense } from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Ticket01Icon,
  ArrowLeft01Icon,
  Paperclip,
  FileAttachmentIcon,
  MailSend01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { supportService, storageManagementService, type TicketPriority } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

const priorityOptions: Array<{ value: TicketPriority; label: string; description: string }> = [
  { value: "low", label: "Low", description: "General questions or minor issues" },
  { value: "medium", label: "Medium", description: "Standard support requests" },
  { value: "high", label: "High", description: "Important issues affecting functionality" },
  { value: "urgent", label: "Urgent", description: "Critical issues requiring immediate attention" },
]

const categoryOptions = [
  "Technical Issue",
  "Billing Question",
  "Feature Request",
  "Account Issue",
  "Other",
]

interface FileUploadState {
  file: File
  progress: number
  uploadedId: number | null
  error: boolean
}

function NewTicketContent() {
  const router = useRouter()
  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState<TicketPriority>("medium")
  const [category, setCategory] = React.useState("")
  const [fileUploads, setFileUploads] = React.useState<FileUploadState[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Check if any files are still uploading
  const isUploading = fileUploads.some((f) => f.progress < 100 && !f.error && f.uploadedId === null)

  // Get all successfully uploaded file IDs
  const uploadedFileIds = fileUploads
    .filter((f) => f.uploadedId !== null)
    .map((f) => f.uploadedId as number)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Reset input
    e.target.value = ""

    // Create initial upload states for each file
    const newUploads: FileUploadState[] = files.map((file) => ({
      file,
      progress: 0,
      uploadedId: null,
      error: false,
    }))

    const startIndex = fileUploads.length
    setFileUploads((prev) => [...prev, ...newUploads])

    // Upload each file with progress tracking
    files.forEach((file, index) => {
      const fileIndex = startIndex + index
      const path = `support/new/${Date.now()}-${file.name}`

      storageManagementService.uploadFileWithProgress(
        file,
        path,
        (progress) => {
          setFileUploads((prev) =>
            prev.map((f, i) => (i === fileIndex ? { ...f, progress } : f))
          )
        },
        (response) => {
          const data = response.success ? response.data : undefined
          if (data) {
            setFileUploads((prev) =>
              prev.map((f, i) =>
                i === fileIndex ? { ...f, progress: 100, uploadedId: data.id } : f
              )
            )
          } else {
            setFileUploads((prev) =>
              prev.map((f, i) => (i === fileIndex ? { ...f, error: true } : f))
            )
            toast.error(`Failed to upload ${file.name}`)
          }
        },
        (error) => {
          setFileUploads((prev) =>
            prev.map((f, i) => (i === fileIndex ? { ...f, error: true } : f))
          )
          toast.error(`Failed to upload ${file.name}`)
        }
      )
    })
  }

  const removeFile = (index: number) => {
    setFileUploads((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      toast.error("Please enter a subject")
      return
    }

    if (!description.trim()) {
      toast.error("Please enter a description")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await supportService.createTicket({
        subject,
        description,
        priority,
        category: category || undefined,
        attachments: uploadedFileIds,
      })

      if (response.success && response.data) {
        toast.success("Ticket created successfully")
        router.push(`/support/tickets/${response.data.id}`)
      }
    } catch (error) {
      toast.error("Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={Ticket01Icon} className="size-8" />
            Create New Ticket
          </h1>
          <p className="text-muted-foreground mt-2">
            Describe your issue and our support team will help you
          </p>
        </div>
        <Link href="/support/tickets">
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>
              Provide details about your issue or question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                required
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="text-sm font-medium mb-2 block">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {priorityOptions.find((opt) => opt.value === priority)?.description}
                </p>
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="">Select a category (optional)</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Attachments
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,application/pdf,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="cursor-pointer"
                  >
                    <HugeiconsIcon icon={Paperclip} className="size-4 mr-2" />
                    {isUploading ? "Uploading..." : "Attach Files"}
                  </Button>
                </div>
                {fileUploads.length > 0 && (
                  <div className="space-y-2">
                    {fileUploads.map((upload, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                      >
                        <HugeiconsIcon icon={FileAttachmentIcon} className="size-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm truncate">{upload.file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {upload.error
                                ? "Failed"
                                : upload.uploadedId
                                ? "Uploaded"
                                : `${upload.progress}%`}
                            </span>
                          </div>
                          {!upload.uploadedId && !upload.error && (
                            <Progress value={upload.progress} className="h-1 mt-1" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: Images, PDF, and Video files
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Link href="/support/tickets">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                <HugeiconsIcon icon={MailSend01Icon} className="size-4 mr-2" />
                {isSubmitting ? "Creating..." : isUploading ? "Wait for upload..." : "Create Ticket"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function NewTicketPage() {
  return (
    <CustomerDashboardLayout>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <NewTicketContent />
      </Suspense>
    </CustomerDashboardLayout>
  )
}
