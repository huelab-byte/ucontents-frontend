# Content Sources Components

This directory contains all the reusable components for the Content Sources page (`/content-generation/content-sources`).

## Component Structure

### Core Components

1. **ContentSourceStats** (`content-source-stats.tsx`)
   - Displays statistics cards (Total Sources, Total Videos, Active Schedulers)
   - Includes the "New Content Source" button
   - Props: `sources`, `onCreateSource`

2. **NewSourceDialog** (`new-source-dialog.tsx`)
   - Dialog for creating a new content source
   - Handles form state and validation
   - Props: `onCreate`

3. **EditSourceDialog** (`edit-source-dialog.tsx`)
   - Dialog for editing an existing content source
   - Pre-fills form with existing data
   - Props: `source`, `onUpdate`, `onClose`

4. **ContentSourceTable** (`content-source-table.tsx`)
   - Main table component displaying all content sources
   - Handles pagination logic
   - Props: `sources`, `currentPage`, `itemsPerPage`, `onEdit`, `onDelete`, `onNavigate`, `onPageChange`

5. **ContentSourceRow** (`content-source-row.tsx`)
   - Individual row component for the table
   - Displays source information and action menu
   - Props: `source`, `onEdit`, `onDelete`, `onNavigate`

6. **Pagination** (`pagination.tsx`)
   - Reusable pagination component
   - Optimized for large page counts with ellipsis
   - Props: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `startIndex`, `endIndex`, `onPageChange`

7. **EmptyState** (`empty-state.tsx`)
   - Empty state when no content sources exist
   - Includes "New Content Source" button
   - Props: `onCreateSource`

### Supporting Files

- **types.ts** - TypeScript interfaces (`ContentSource`, `Campaign`)
- **utils.ts** - Utility functions (`formatDate`)
- **demo-data.ts** - Demo data for development
- **index.ts** - Barrel export for easy imports

## Usage Example

```tsx
import {
  ContentSourceStats,
  ContentSourceTable,
  EmptyState,
  EditSourceDialog,
  type ContentSource,
} from "@/components/content-sources"

export default function ContentSourcesPage() {
  const [sources, setSources] = useState<ContentSource[]>([])
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null)

  return (
    <div>
      <ContentSourceStats 
        sources={sources} 
        onCreateSource={handleCreate} 
      />
      
      {sources.length > 0 ? (
        <ContentSourceTable
          sources={sources}
          currentPage={1}
          itemsPerPage={10}
          onEdit={setEditingSource}
          onDelete={handleDelete}
          onNavigate={handleNavigate}
          onPageChange={setCurrentPage}
        />
      ) : (
        <EmptyState onCreateSource={handleCreate} />
      )}

      <EditSourceDialog
        source={editingSource}
        onUpdate={handleUpdate}
        onClose={() => setEditingSource(null)}
      />
    </div>
  )
}
```

## File Organization

Each component is in its own file, making it easy to:
- Copy individual components
- Modify specific functionality
- Test components in isolation
- Reuse components in other pages

## Component Dependencies

All components use the shared UI components from `@/components/ui`:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `AlertDialog` components
- `DropdownMenu` components
- `Input`, `Label`, `Field` components
- `Select` components
- `Badge`

Icons are from `@hugeicons/react` and `@hugeicons/core-free-icons`.
