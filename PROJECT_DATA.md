# Project Data Models and Structures

## Overview
**Project Name:** ucontents-ui  
**Type:** Next.js 16.1.1 Application  
**Framework:** React 19.2.3 with TypeScript  
**UI Library:** shadcn/ui with Tailwind CSS 4

## Core Data Models

### 1. Library (Footage Library)
**Location:** `app/footage-library/page.tsx`

```typescript
interface Library {
  id: string
  name: string
  mood: string[]          // Array of mood tags (e.g., ["Calm", "Luxury", "Funny"])
  motion: string[]        // Array of motion tags (e.g., ["Static", "High", "Low", "Medium"])
  totalClips: number      // Total number of video clips
  landscapeCount: number  // Count of landscape (9:16) format clips
  verticalCount: number   // Count of vertical (9:16) format clips
  lastUpdated: string     // Last update timestamp (e.g., "2 days ago")
  isStarred?: boolean     // Optional starred/favorite flag
}
```

**Sample Data:** 6 demo libraries including:
- FutureBike - AI Hall Shots (6996 clips, starred)
- Tech Product Showcase (4523 clips)
- Nature Documentary Clips (8234 clips, starred)
- Urban Lifestyle Content (5678 clips)
- Corporate Brand Assets (3124 clips)

---

### 2. API Configuration Models
**Location:** `app/settings/api-keys/page.tsx`

#### OpenAI Configuration
```typescript
interface OpenAIConfig {
  id: string
  apiKey: string
  orgId: string
  textModel: string              // e.g., "gpt-4o"
  embeddingModel: string         // e.g., "text-embedding-3-large"
  imageModel: string             // e.g., "dall-e-3"
  isTesting: boolean
}
```

#### Google AI Configuration
```typescript
interface GoogleAIConfig {
  id: string
  apiKey: string
  projectId: string
  model: string
  isTesting: boolean
}
```

#### Azure OpenAI Configuration
```typescript
interface AzureOpenAIConfig {
  id: string
  apiKey: string
  endpoint: string
  deployment: string
  apiVersion: string
  model: string
  isTesting: boolean
}
```

---

### 3. Team Management Models
**Location:** `app/settings/team/page.tsx`

#### Team Member
```typescript
interface TeamMember {
  id: string
  name: string
  email: string
  role: string                    // e.g., "Owner", "Admin", "Member", "Viewer"
  status: "Active" | "Pending" | "Inactive"
}
```

#### Role
```typescript
interface Role {
  id: string
  name: string
  isDefault: boolean
  permissions?: Record<string, boolean>
}
```

#### Permission
```typescript
interface Permission {
  id: string
  label: string
  checked: boolean
}
```

#### Permission Section
```typescript
interface PermissionSection {
  id: string
  title: string
  icon?: any
  permissions: Permission[]
}
```

**Default Roles:**
- Owner (default)
- Admin (default)
- Member (default)
- Viewer (default)

**Sample Team Members:** 5 demo members with various roles and statuses

---

### 4. Subscription & Billing Models
**Location:** `app/profile/subscription/page.tsx`

#### Plan
```typescript
interface Plan {
  id: string                      // e.g., "free", "plus", "pro"
  name: string                    // e.g., "Free", "Plus", "Pro"
  price: number                   // Monthly or yearly price
  interval: "month" | "year"
  description: string
  features: string[]              // Array of feature descriptions
  popular?: boolean               // Optional popular plan flag
}
```

#### Invoice
```typescript
interface Invoice {
  id: string
  date: string                    // Invoice date
  amount: number                  // Invoice amount
  status: "Paid" | "Pending" | "Failed"
}
```

**Plans Available:**
- Free: $0/month or $0/year
- Plus: $19/month or $190/year (2 months free)
- Pro: $49/month or $490/year (2 months free)
- Enterprise: Custom pricing

---

### 5. Usage & Credits Model
**Location:** `app/profile/usage/page.tsx`

#### Usage Breakdown
```typescript
interface UsageBreakdown {
  category: string                // e.g., "Content Generation", "Image Generation", "Automation Jobs"
  icon: any                       // Icon component
  used: number                    // Credits/units used
  total: number                   // Total credits/units available
  color: string                   // Color scheme (e.g., "bg-blue-500")
}
```

**Usage Categories:**
- Content Generation (156/500 used)
- Image Generation (89/300 used)
- Automation Jobs (97/200 used)

**Credit Balance:** 342/1000 used, 658 remaining

---

### 6. Support Ticket Model
**Location:** `app/support/page.tsx`

```typescript
interface Ticket {
  id: string
  title: string
  status: "open" | "in-progress" | "resolved" | "closed"
  date: string                    // Date string (e.g., "2024-01-15")
}
```

**Sample Tickets:** 6 demo tickets with various statuses

---

### 7. Log Entry Model
**Location:** `app/settings/logs/page.tsx`

```typescript
interface LogEntry {
  id: string
  timestamp: string               // ISO timestamp (e.g., "2024-01-20T14:30:25Z")
  actor: "User" | "System"
  actorName?: string              // Email address for user actors
  category: "System" | "Automation" | "Queue" | "Storage" | "Auth"
  action: string                  // Description of the action
  status: "Success" | "Failed" | "Warning"
}
```

**Log Categories:**
- System
- Automation
- Queue
- Storage
- Auth

---

### 8. System Status Model
**Location:** `app/settings/system/page.tsx` and `app/settings/preferences/page.tsx`

```typescript
interface SystemStatus {
  id: string
  name: string
  status: string                    // e.g., "Running", "Degraded", "Down", "Active", "Paused"
  icon: any                         // Icon component
  description?: string              // Optional description
}
```

**Status Values:**
- Running / Active
- Degraded
- Down
- Paused

---

### 9. Changelog Entry Model
**Location:** `app/support/changelog/page.tsx`

```typescript
interface ChangelogEntry {
  date: string                     // Date string (e.g., "2024-01-15")
  description: string              // Description of the change/update
}
```

**Sample Entries:** 8 demo changelog entries with dates from 2024-01-01 to 2024-01-15

---

### 10. Tutorial Model
**Location:** `app/support/tutorials/page.tsx`

```typescript
interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  duration?: string
  // Additional properties may exist
}
```

---

### 11. Bug Report Model
**Location:** `app/support/report/page.tsx`

```typescript
interface BugReport {
  title: string
  description: string
  stepsToReproduce: string
  expectedBehavior: string
  actualBehavior: string
  attachments?: File[]            // Optional file attachments
  // Additional properties may exist
}
```

---

## Notification System
**Location:** `components/notifications-bar.tsx`

```typescript
export type NotificationType = "error" | "warning" | "info" | "success"

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number               // Optional duration in milliseconds
}
```

---

## UI Component Props

### Dashboard Layout Props
**Location:** `components/dashboard-layout.tsx`

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
}
```

### Progress Props
**Location:** `components/ui/progress.tsx`

```typescript
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number                   // Progress value (0-100)
  // Additional HTML div attributes
}
```

---

## Project Structure

### Main Routes/Pages
- `/` - Redirects to `/dashboard`
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics page
- `/content-generation` - Content generation
- `/content-generation/add` - Add content
- `/content-generation/playground` - Content playground
- `/footage-library` - Footage library management
- `/footage-library/upload` - Upload footage
- `/social-automation` - Social automation
- `/social-automation/add` - Add automation
- `/profile` - User profile
- `/profile/subscription` - Subscription management
- `/profile/usage` - Usage statistics
- `/settings` - Settings
- `/settings/api-keys` - API key management
- `/settings/logs` - System logs
- `/settings/preferences` - User preferences
- `/settings/system` - System settings
- `/settings/team` - Team management
- `/support` - Support tickets
- `/support/changelog` - Changelog
- `/support/report` - Bug reports
- `/support/tutorials` - Tutorials
- `/templates` - Templates
- `/templates/prompt-templates` - Prompt templates
- `/login` - Login page
- `/register` - Registration page
- `/otp` - OTP verification
- `/logout` - Logout page

---

## Key Technologies

### Frontend Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Component Library:** shadcn/ui (base-nova style)
- **Icons:** @hugeicons/react
- **Animations:** motion (formerly framer-motion) 12.25.0
- **Theme:** next-themes (dark mode support)
- **Form Handling:** class-variance-authority

### Build Tools
- **TypeScript:** 5.x
- **ESLint:** 9.x with eslint-config-next
- **PostCSS:** @tailwindcss/postcss 4

---

## Data Patterns

### Common Patterns
1. **Demo Data:** Most pages include demo/mock data for development and UI demonstration
2. **State Management:** React useState hooks for local state management
3. **Data Normalization:** Helper functions to normalize data (e.g., `normalizeLibrary`)
4. **Type Safety:** Strong TypeScript typing throughout the application
5. **Array-based Tags:** Many models use string arrays for tags/categories (mood, motion, features)
6. **Status Enums:** Common use of union types for status fields (Active/Pending/Inactive, Success/Failed/Warning, etc.)

### Data Flow
- Client-side state management (React hooks)
- No apparent backend API integration yet (all demo data)
- Local state updates for CRUD operations
- Pagination implemented for large datasets

---

## Notes
- All data models are currently frontend-only (demo data)
- No database or API integration visible
- Data structures are well-typed with TypeScript interfaces
- The application appears to be a social media/content management platform with automation features
- Focus areas include: content generation, footage library management, social automation, team collaboration, and subscription management
