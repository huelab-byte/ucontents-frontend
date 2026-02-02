"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSpeed01Icon,
  UserGroupIcon,
  Settings01Icon,
  SettingsIcon,
  HelpCircleIcon,
  Book01Icon,
  Alert01Icon,
  UserIcon,
  LogoutIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Analytics02Icon,
  Video01Icon,
  MusicNote01Icon,
  Image01Icon,
  File01Icon,
  LockKeyIcon,
  KeyIcon,
  Mail01Icon,
  Database02Icon,
  MachineRobotIcon,
  CreditCardIcon,
  NotificationIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"
import { usePermission } from "@/lib/hooks/use-permission"
import { SiteBranding } from "@/components/site-branding"
import { cn } from "@/lib/utils"
import { NavUser } from "@/components/nav-user"

// Types for menu items with permissions
interface SubMenuItem {
  title: string
  url: string
  icon: any
  permissions?: string[] // User needs ANY of these permissions
}

interface MenuItem {
  title: string
  icon: any
  url: string
  permissions?: string[] // User needs ANY of these permissions to see the parent
  items: SubMenuItem[]
}

interface ConfigSubItem {
  title: string
  url: string
  icon: any
  permissions?: string[]
}

interface ConfigItem {
  title: string
  icon: any
  permissions?: string[]
  subItems?: ConfigSubItem[]
}

interface ConfigSection {
  title: string
  icon: any
  items: ConfigItem[]
}

// Admin menu items with permissions
const adminMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: DashboardSpeed01Icon,
    url: "/admin/dashboard",
    permissions: ["view_dashboard"],
    items: [],
  },
  
  {
    title: "Library",
    icon: Book01Icon,
    url: "", // No URL - only triggers dropdown
    permissions: ["view_files", "upload_files", "view_footage_library", "manage_footage_library", "view_audio_library", "manage_audio_library", "view_image_library", "manage_image_library"],
    items: [
      {
        title: "Footage Library",
        url: "/admin/footage-library",
        icon: Video01Icon,
        permissions: ["view_files", "view_footage_library", "manage_footage_library"],
      },
      {
        title: "Audio Library",
        url: "/admin/audio-library",
        icon: MusicNote01Icon,
        permissions: ["view_audio_library", "manage_audio_library"],
      },
      {
        title: "Image Library",
        url: "/admin/image-library",
        icon: Image01Icon,
        permissions: ["view_image_library", "manage_image_library"],
      },
    ],
  },
  {
    title: "Overlay",
    icon: Image01Icon,
    url: "", // No URL - only triggers dropdown
    permissions: ["view_video_overlay", "manage_video_overlay", "view_bgm", "manage_bgm", "view_image_overlay", "manage_image_overlay"],
    items: [
      {
        title: "Video Overlay",
        url: "/admin/video-overlay",
        icon: Video01Icon,
        permissions: ["view_video_overlay", "manage_video_overlay"],
      },
      {
        title: "BGM Library",
        url: "/admin/bgm-library",
        icon: MusicNote01Icon,
        permissions: ["view_bgm", "manage_bgm"],
      },
      {
        title: "Image Overlay",
        url: "/admin/image-overlay",
        icon: Image01Icon,
        permissions: ["view_image_overlay", "manage_image_overlay"],
      },
    ],
  },

  {
    title: "Support Tickets",
    icon: Ticket01Icon,
    url: "/admin/support",
    permissions: ["view_all_tickets", "manage_tickets"],
    items: [],
  },

  {
    title: "Customer Management",
    icon: UserIcon,
    url: "/admin/customers",
    permissions: ["view_customers", "manage_customers"],
    items: [],
  },

  {
    title: "Plans",
    icon: CreditCardIcon,
    url: "/admin/plans",
    permissions: ["view_plans", "manage_plans"],
    items: [],
  },

  {
    title: "User Management",
    icon: UserGroupIcon,
    url: "",
    permissions: ["view_users", "manage_users", "view_roles", "manage_roles", "view_permissions", "manage_permissions"],
    items: [
      {
        title: "Users",
        url: "/admin/users/list",
        icon: UserIcon,
        permissions: ["view_users", "manage_users"],
      },
      {
        title: "Roles",
        url: "/admin/users/roles",
        icon: UserGroupIcon,
        permissions: ["view_roles", "manage_roles"],
      },
      {
        title: "Permissions",
        url: "/admin/users/permissions",
        icon: LockKeyIcon,
        permissions: ["view_permissions", "manage_permissions"],
      },
    ],
  },
]

const adminConfigItems: ConfigSection[] = [
  {
    title: "Configuration",
    icon: Settings01Icon,
    items: [
      {
        title: "Settings",
        icon: SettingsIcon,
        permissions: [
          "view_general_settings", "manage_general_settings",
          "view_auth_settings", "manage_auth_settings",
          "view_clients", "manage_clients",
          "view_email_config", "manage_email_config",
          "view_ai_usage", "manage_ai_api_keys", "manage_ai_providers",
          "view_storage_config", "manage_storage_config",
          "manage_payment_gateways", "view_all_invoices", "edit_invoices",
          "view_logs", "manage_logs",
          "manage_social_connection_providers",
          "view_notification_settings", "manage_notification_settings"
        ],
        subItems: [
          {
            title: "General Settings",
            url: "/admin/settings/general",
            icon: SettingsIcon,
            permissions: ["view_general_settings", "manage_general_settings"],
          },
          {
            title: "Social Connection",
            url: "/admin/settings/social-connection",
            icon: SettingsIcon,
            permissions: ["manage_social_connection_providers"],
          },
          {
            title: "Auth Settings",
            url: "/admin/settings/auth",
            icon: LockKeyIcon,
            permissions: ["view_auth_settings", "manage_auth_settings"],
          },
          {
            title: "Client Settings",
            url: "/admin/settings/clients",
            icon: KeyIcon,
            permissions: ["view_clients", "manage_clients"],
          },
          {
            title: "Email Configuration",
            url: "/admin/settings/email",
            icon: Mail01Icon,
            permissions: ["view_email_config", "manage_email_config"],
          },
          {
            title: "AI Integration",
            url: "/admin/settings/ai-integration",
            icon: MachineRobotIcon,
            permissions: ["view_ai_usage", "manage_ai_api_keys", "manage_ai_providers"],
          },
          {
            title: "Payment Gateway",
            url: "/admin/settings/payment-gateway",
            icon: CreditCardIcon,
            permissions: ["manage_payment_gateways", "view_all_invoices", "edit_invoices"],
          },
          {
            title: "Storage Management",
            url: "/admin/settings/storage",
            icon: Database02Icon,
            permissions: ["view_storage_config", "manage_storage_config"],
          },
          {
            title: "Notifications",
            url: "/admin/settings/notifications",
            icon: NotificationIcon,
            permissions: ["view_notification_settings", "manage_notification_settings"],
          },          
          {
            title: "Logs & Activity",
            url: "/admin/settings/logs",
            icon: Alert01Icon,
            permissions: ["view_logs", "manage_logs"],
          },
        ],
      },
    ],
  },
]

const adminProfileItems = [
  {
    title: "Profile",
    url: "/admin/profile",
    icon: UserIcon,
  },
  {
    title: "Logout",
    url: "/auth/logout",
    icon: LogoutIcon,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const { user } = useAuth()
  const { hasAnyPermission } = usePermission()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  // Check if user can access a menu item based on permissions
  const canAccessItem = React.useCallback((permissions?: string[]): boolean => {
    // No permissions required for this item
    if (!permissions || permissions.length === 0) return true
    
    // Super admin (by role) always has access
    if (user?.role === 'super_admin') return true
    
    // Check if user has any of the required permissions
    return hasAnyPermission(permissions)
  }, [user?.role, hasAnyPermission])

  // Filter menu items based on permissions
  const filteredMenuItems = React.useMemo(() => {
    return adminMenuItems
      .filter(item => canAccessItem(item.permissions))
      .map(item => ({
        ...item,
        items: item.items.filter(subItem => canAccessItem(subItem.permissions))
      }))
      .filter(item => item.items.length > 0 || !item.items.length) // Keep items without sub-items or with visible sub-items
  }, [canAccessItem])

  // Filter config items based on permissions
  const filteredConfigItems = React.useMemo(() => {
    return adminConfigItems
      .map(section => ({
        ...section,
        items: section.items
          .filter(item => canAccessItem(item.permissions))
          .map(item => ({
            ...item,
            subItems: item.subItems?.filter(subItem => canAccessItem(subItem.permissions))
          }))
          .filter(item => !item.subItems || item.subItems.length > 0) // Keep items with visible sub-items
      }))
      .filter(section => section.items.length > 0) // Only show sections with visible items
  }, [canAccessItem])

  // Calculate initial open state based on pathname - only run on pathname change
  React.useEffect(() => {
    // Calculate which items should be open based on current pathname
    const initialOpen: Record<string, boolean> = {}
    
    // Check main menu items
    adminMenuItems.forEach((item) => {
      if (item.items.length > 0) {
        // Check if current pathname matches any sub-item URL
        const hasActiveSubItem = item.items.some((subItem) => 
          pathname === subItem.url || (subItem.url && pathname?.startsWith(subItem.url + "/"))
        )
        const isOpen = hasActiveSubItem || pathname?.startsWith(item.url || `/admin/${item.title.toLowerCase().replace(/\s+/g, "-")}`)
        if (isOpen) {
          initialOpen[item.title] = true
        }
      }
    })
    
    // Check config items
    adminConfigItems.forEach((configSection) => {
      configSection.items.forEach((item) => {
        if (item.subItems) {
          // Check if any subItem URL matches the current pathname
          const isOpen = item.subItems.some((subItem) => pathname?.startsWith(subItem.url))
          if (isOpen) {
            initialOpen[item.title] = true
          }
        }
      })
    })
    
    setOpenItems(initialOpen)
  }, [pathname]) // Only depend on pathname - menu structure is static

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          {state === "expanded" ? (
            <SiteBranding showText={true} />
          ) : (
            <SiteBranding showText={false} />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredMenuItems.map((item) => {
          // Check if any sub-item is active
          const hasActiveSubItem = item.items.some((subItem) => 
            pathname === subItem.url || (subItem.url && pathname?.startsWith(subItem.url + "/"))
          )
          const isItemOpen = openItems[item.title] ?? hasActiveSubItem ?? pathname?.startsWith(item.url || `/admin/${item.title.toLowerCase().replace(/\s+/g, "-")}`)
          return (
            <SidebarGroup key={item.title}>
              {item.items.length > 0 ? (
                <Collapsible
                  open={isItemOpen}
                  onOpenChange={(isOpen) => setOpenItems((prev: Record<string, boolean>) => ({ ...prev, [item.title]: isOpen }))}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <div className="flex items-center gap-1 w-full">
                      {item.url ? (
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname === item.url || pathname?.startsWith(item.url + "/")}
                          className="flex-1"
                          onClick={(e) => {
                            if (item.url) {
                              e.preventDefault()
                              router.push(item.url)
                            }
                          }}
                        >
                          <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                          <span className="truncate whitespace-nowrap min-w-0 flex-1">{item.title}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={pathname?.startsWith(`/admin/${item.title.toLowerCase().replace(/\s+/g, "-")}`)}
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault()
                            setOpenItems((prev: Record<string, boolean>) => ({
                              ...prev,
                              [item.title]: !prev[item.title],
                            }))
                          }}
                        >
                          <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                          <span className="truncate whitespace-nowrap min-w-0 flex-1">{item.title}</span>
                        </SidebarMenuButton>
                      )}
                      {!isItemOpen && !isMobile && state === "expanded" && (
                        <CollapsibleTrigger className="shrink-0 w-7 h-7 p-0 inline-flex items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50" aria-label="Toggle submenu">
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            strokeWidth={1.5}
                            className="size-3 transition-all duration-200"
                          />
                        </CollapsibleTrigger>
                      )}
                    </div>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={!!(pathname === subItem.url || (subItem.url && pathname?.startsWith(subItem.url + "/")))}
                              onClick={(e) => {
                                if (subItem.url) {
                                  e.preventDefault()
                                  router.push(subItem.url)
                                }
                              }}
                            >
                              <HugeiconsIcon icon={subItem.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                              <span className="truncate whitespace-nowrap min-w-0">{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    onClick={(e) => {
                      if (item.url) {
                        e.preventDefault()
                        router.push(item.url)
                      }
                    }}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                    <span className="truncate whitespace-nowrap min-w-0 flex-1">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarGroup>
          )
        })}

        {filteredConfigItems.length > 0 && <SidebarSeparator />}

        {filteredConfigItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              {section.items.map((configItem) => {
                // Check if any subItem matches the current pathname, or use the stored open state
                const hasActiveSubItem = configItem.subItems?.some((subItem) => pathname?.startsWith(subItem.url)) ?? false
                const isConfigItemOpen = openItems[configItem.title] ?? hasActiveSubItem
                return (
                  <Collapsible
                    key={configItem.title}
                    open={isConfigItemOpen}
                    onOpenChange={(isOpen) => setOpenItems((prev: Record<string, boolean>) => ({ ...prev, [configItem.title]: isOpen }))}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      {configItem.subItems ? (
                        <>
                          <div className="flex items-center gap-1 w-full">
                            <div className="flex-1 min-w-0">
                              <SidebarMenuButton
                                tooltip={configItem.title}
                                isActive={configItem.subItems?.some((subItem) => pathname?.startsWith(subItem.url)) ?? false}
                                className="w-full"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  // Only toggle the dropdown, don't navigate if there are subItems
                                  setOpenItems((prev: Record<string, boolean>) => ({
                                    ...prev,
                                    [configItem.title]: !prev[configItem.title],
                                  }))
                                }}
                              >
                                <HugeiconsIcon icon={configItem.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                                <span className="truncate whitespace-nowrap min-w-0 flex-1">{configItem.title}</span>
                              </SidebarMenuButton>
                            </div>
                            {!isConfigItemOpen && !isMobile && state === "expanded" && (
                              <CollapsibleTrigger className="shrink-0 w-7 h-7 p-0 inline-flex items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50" aria-label='Toggle submenu'>
                                <HugeiconsIcon
                                  icon={ArrowDown01Icon}
                                  strokeWidth={1.5}
                                  className="size-3 transition-all duration-200"
                                />
                              </CollapsibleTrigger>
                            )}
                          </div>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {configItem.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    isActive={pathname === subItem.url}
                                    onClick={(e) => {
                                      if (subItem.url) {
                                        e.preventDefault()
                                        router.push(subItem.url)
                                      }
                                    }}
                                  >
                                    <HugeiconsIcon icon={subItem.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                                    <span className="truncate whitespace-nowrap min-w-0">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : (
                        <SidebarMenuButton
                          tooltip={configItem.title}
                          className="cursor-pointer"
                        >
                          <HugeiconsIcon icon={configItem.icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                          <span className="truncate whitespace-nowrap min-w-0 flex-1">{configItem.title}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="View customer panel"
              onClick={(e) => {
                e.preventDefault()
                router.push("/dashboard")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={DashboardSpeed01Icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
              <span className="truncate whitespace-nowrap min-w-0 flex-1">View customer panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser 
          user={{ 
            name: user?.name || "Admin", 
            email: user?.email || "admin@example.com"
          }} 
          menuItems={adminProfileItems.map(item => ({
            title: item.title,
            icon: item.icon,
            onClick: () => router.push(item.url),
          }))}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
