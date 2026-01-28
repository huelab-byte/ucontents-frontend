# UI Refactoring Guide - Role-Based Structure

## Overview
The UI has been refactored into 3 main areas:
1. **Auth** - Common authentication pages for both Customer and Admin
2. **Customer Area** - Customer-facing features
3. **Admin Area** - Admin-only features

## Structure

```
app/
├── auth/                    # Common auth pages
│   ├── login/
│   ├── register/
│   ├── logout/
│   └── otp/
├── (customer)/              # Customer area (route group)
│   ├── layout.tsx           # Customer route guard
│   ├── dashboard/
│   └── ... (customer pages)
├── (admin)/                  # Admin area (route group)
│   ├── layout.tsx           # Admin route guard
│   ├── dashboard/
│   ├── users/
│   └── ... (admin pages)
└── page.tsx                  # Root - redirects based on role
```

## Key Components

### Auth Context (`lib/auth-context.tsx`)
- Manages authentication state
- Provides `useAuth()` hook
- Handles login/logout
- Redirects based on user role after login

### Route Guard (`lib/route-guard.tsx`)
- Protects routes based on user roles
- Shows loading state
- Redirects unauthorized users

### Layouts
- `(customer)/layout.tsx` - Protects customer routes
- `(admin)/layout.tsx` - Protects admin routes

### Dashboard Layouts
- `components/customer-dashboard-layout.tsx` - Customer dashboard wrapper
- `components/admin-dashboard-layout.tsx` - Admin dashboard wrapper

## Next Steps

1. **Create Customer Sidebar** (`components/customer-sidebar.tsx`)
   - Copy from `app-sidebar.tsx`
   - Remove admin-only items (Users, etc.)
   - Customer routes have NO prefix (e.g., `/dashboard`, `/social-automation/*`)

2. **Create Admin Sidebar** (`components/admin-sidebar.tsx`)
   - Copy from `app-sidebar.tsx`
   - Include admin-only items
   - Update URLs to `/admin/*` prefix

3. **Move Customer Pages**
   - Move customer-facing pages to `(customer)/`
   - Update all internal links
   - Update sidebar URLs

4. **Move Admin Pages**
   - Move admin pages to `(admin)/`
   - Update all internal links
   - Update sidebar URLs

5. **Update Auth Pages**
   - All auth pages now in `auth/` folder
   - Update links to use `/auth/*` prefix

## Routing Structure

- **Auth routes**: `/auth/*` (e.g., `/auth/login`, `/auth/register`)
- **Admin routes**: `/admin/*` (e.g., `/admin/dashboard`, `/admin/users`)
- **Customer routes**: NO prefix (e.g., `/dashboard`, `/social-automation/*`, `/content-generation/*`)

## Testing

1. Login as customer → Should redirect to `/dashboard`
2. Login as admin → Should redirect to `/admin/dashboard`
3. Access admin routes as customer → Should redirect to `/dashboard`
4. Access customer routes as admin → Should work (admins can access customer features)

## Notes

- The root page (`app/page.tsx`) now redirects based on authentication and role
- Auth context uses localStorage for demo (replace with actual API calls)
- Route guards protect both customer and admin areas
- Sidebars need to be created separately for customer and admin
