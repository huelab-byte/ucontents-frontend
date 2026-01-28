"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderIcon,
  MoreVerticalIcon,
  Edit01Icon,
  Delete01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { NewLibraryDialog } from "./new-library-dialog"
import type { Library } from "./types"

interface LibraryTableProps {
  libraries: Library[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView?: (id: number) => void
  onEdit?: (library: Library) => void
  onDelete?: (library: Library) => void
  onCreate?: (library: Pick<Library, "name" | "parent_id">) => Promise<boolean> | boolean
}

export function LibraryTable({
  libraries,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: LibraryTableProps) {
  const router = useRouter()
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLibraries = libraries.slice(startIndex, startIndex + itemsPerPage)

  const handleView = (library: Library) => {
    if (onView) {
      onView(library.id)
    } else {
      router.push(`/admin/image-overlay/${library.id}`)
    }
  }

  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Folders</CardTitle>
        {onCreate && <NewLibraryDialog onCreate={onCreate} />}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folder</TableHead>
              <TableHead className="text-center">Total Overlays</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLibraries.map((library) => (
              <TableRow
                key={library.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleView(library)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <HugeiconsIcon icon={FolderIcon} className="size-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{library.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{library.image_overlay_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(library); }}>
                          <HugeiconsIcon icon={Edit01Icon} className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); onDelete(library); }}
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, libraries.length)} of {libraries.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
