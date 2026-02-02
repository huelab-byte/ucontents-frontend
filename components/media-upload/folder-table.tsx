"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalCircle01Icon,
  EditIcon,
  DeleteIcon,
  ClockIcon,
  Folder01Icon,
  Video01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import type { MediaUploadFolder } from "@/lib/api"
import { CreateFolderDialog } from "./create-folder-dialog"
import { EditFolderDialog } from "./edit-folder-dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return "—"
  }
}

interface FolderTableProps {
  folders: MediaUploadFolder[]
  isLoading?: boolean
  onCreateFolder: (data: { name: string; parent_id?: number | null }) => Promise<string | null>
  onUpdateFolder: (id: number, data: { name: string }) => Promise<void>
  onDeleteFolder: (id: number) => Promise<void>
  onNavigate: (id: number) => void
}

export function FolderTable({
  folders,
  isLoading,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onNavigate,
}: FolderTableProps) {
  const [editingFolder, setEditingFolder] = React.useState<MediaUploadFolder | null>(null)
  const [deletingFolder, setDeletingFolder] = React.useState<MediaUploadFolder | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Folders</CardTitle>
          <CreateFolderDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSubmit={async (data) => {
              const error = await onCreateFolder(data)
              if (!error) {
                setCreateOpen(false)
              }
              return error
            }}
            trigger={
              <>
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                New Folder
              </>
            }
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : folders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No folders yet. Create one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Videos</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Created</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {folders.map((folder) => (
                    <tr
                      key={folder.id}
                      onClick={() => onNavigate(folder.id)}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={Folder01Icon} className="size-6 text-primary" />
                          <span className="font-medium">{folder.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Video01Icon} className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {(folder.media_uploads_count ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <HugeiconsIcon icon={ClockIcon} className="size-4" />
                          <span>{formatDate(folder.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                              <span className="sr-only">Options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingFolder(folder)}>
                              <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingFolder(folder)}
                              className="text-destructive focus:text-destructive"
                            >
                              <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <EditFolderDialog
        folder={editingFolder}
        onClose={() => setEditingFolder(null)}
        onSubmit={async (data) => {
          if (editingFolder) {
            await onUpdateFolder(editingFolder.id, data)
            setEditingFolder(null)
          }
        }}
      />
      <DeleteConfirmDialog
        open={!!deletingFolder}
        onOpenChange={(open) => !open && setDeletingFolder(null)}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deletingFolder?.name}"? All videos in this folder will also be deleted. This action cannot be undone.`}
        onConfirm={async () => {
          if (deletingFolder) {
            await onDeleteFolder(deletingFolder.id)
            setDeletingFolder(null)
          }
        }}
      />
    </>
  )
}
