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
import { SiteBranding } from "@/components/site-branding"
import {
  DashboardSpeed01Icon,
  MachineRobotIcon,
  Queue01Icon,
  DocumentCodeIcon,
  File01Icon,
  Database02Icon,
  Video01Icon,
  Settings01Icon,
  LockKeyIcon,
  UserGroupIcon,
  SettingsIcon,
  HelpCircleIcon,
  Book01Icon,
  Alert01Icon,
  UserIcon,
  CreditCardIcon,
  Analytics02Icon,
  LogoutIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Link01Icon,
  Ticket01Icon,
  MusicNote01Icon,
  Image01Icon,
  GlobalIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"
import { usePermission } from "@/lib/hooks/use-permission"
import { NavUser } from "@/components/nav-user"

// Two menus like admin: Library and Overlay (permission per item; section hidden if no permissions)
const libraryMenuItems: { title: string; url: string; icon: any; permission: string }[] = [
  { title: "Footage Library", url: "/library/footage", icon: Video01Icon, permission: "use_footage_library" },
  { title: "Audio Library", url: "/library/audio", icon: MusicNote01Icon, permission: "use_audio_library" },
  { title: "Image Library", url: "/library/images", icon: Image01Icon, permission: "use_image_library" },
]
const overlayMenuItems: { title: string; url: string; icon: any; permission: string }[] = [
  { title: "Video Overlay", url: "/library/video-overlays", icon: Video01Icon, permission: "use_video_overlay" },
  { title: "BGM Library", url: "/library/bgm", icon: MusicNote01Icon, permission: "use_bgm_library" },
  { title: "Image Overlay", url: "/library/image-overlays", icon: Image01Icon, permission: "use_image_overlay" },
]

// Customer menu items (no admin features)
const customerMenuItems = [
  {
    title: "Dashboard",
    icon: DashboardSpeed01Icon,
    url: "/dashboard",
    items: [] as { title: string; url: string; icon: any }[],
  },
  {
    title: "Connections",
    icon: Link01Icon,
    url: "/connection",
    items: [],
    useBrandHighlight: true,
  },
  
  {
    title: "Social Automation",
    icon: MachineRobotIcon,
    url: "/social-automation/bulk-posting",
    items: [],
  },
  {
    title: "Collections",
    icon: File01Icon,
    url: undefined,
    items: [
      {
        title: "Videos",
        url: "/content-generation/media-upload",
        icon: Database02Icon,
      },
    ],
  },
  {
    title: "Library",
    icon: Book01Icon,
    url: undefined,
    items: [] as { title: string; url: string; icon: any }[], // Populated from libraryMenuItems by permission
  },
  {
    title: "Overlay",
    icon: Image01Icon,
    url: undefined,
    items: [] as { title: string; url: string; icon: any }[], // Populated from overlayMenuItems by permission
  },
  {
    title: "Templates",
    icon: File01Icon,
    url: undefined,
    items: [
      {
        title: "Prompt Templates",
        url: "/templates/prompt-templates",
        icon: File01Icon,
      },
    ],
  },
]

const customerConfigItems = [
  {
    title: "Configuration",
    icon: Settings01Icon,
    items: [
      {
        title: "AI Settings",
        url: "/configuration/ai-settings",
        icon: MachineRobotIcon,
      },
      {
        title: "Proxy Setup",
        icon: GlobalIcon,
        url: "/proxy-setup",
        items: [],
      },
      {
        title: "Help & Resources",
        url: "/support/tutorials",
        icon: HelpCircleIcon,
        subItems: [
          {
            title: "Tutorials",
            url: "/support/tutorials",
            icon: Book01Icon,
          },
          {
            title: "Report Issue",
            url: "/support/report",
            icon: Alert01Icon,
          },
        ],
      },
    ],
  },
]

const customerProfileItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon,
  },
  {
    title: "Subscription",
    url: "/profile/subscription",
    icon: CreditCardIcon,
  },
  {
    title: "Usage & Credits",
    url: "/profile/usage",
    icon: Analytics02Icon,
  },
  {
    title: "Support",
    url: "/support/tickets",
    icon: Ticket01Icon,
  },
  {
    title: "Logout",
    url: "/auth/logout",
    icon: LogoutIcon,
  },
]

export function CustomerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const { user } = useAuth()
  const { hasPermission } = usePermission()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  const libraryItems = React.useMemo(
    () => libraryMenuItems.filter((item) => hasPermission(item.permission)).map(({ title, url, icon }) => ({ title, url, icon })),
    [hasPermission]
  )
  const overlayItems = React.useMemo(
    () => overlayMenuItems.filter((item) => hasPermission(item.permission)).map(({ title, url, icon }) => ({ title, url, icon })),
    [hasPermission]
  )

  const effectiveMenuItems = React.useMemo(() => {
    return customerMenuItems.map((item) => {
      if (item.title === "Library") return { ...item, items: libraryItems }
      if (item.title === "Overlay") return { ...item, items: overlayItems }
      return item
    }).filter((item) => {
      if ((item as any).permission && !hasPermission((item as any).permission)) return false
      if (item.title === "Library" && libraryItems.length === 0) return false
      if (item.title === "Overlay" && overlayItems.length === 0) return false
      return true
    })
  }, [libraryItems, overlayItems, hasPermission])

  React.useEffect(() => {
    // Calculate which items should be open based on current pathname
    const initialOpen: Record<string, boolean> = {}
    effectiveMenuItems.forEach((item) => {
      if (item.items.length > 0) {
        const hasActive = item.items.some((subItem) => pathname === subItem.url || (subItem.url && pathname?.startsWith(subItem.url + "/")))
        if (hasActive) initialOpen[item.title] = true
      }
    })
    customerConfigItems.forEach((configItem) => {
      configItem.items.forEach((item) => {
        if (item.subItems) {
          const isOpen = item.subItems.some((subItem) => pathname?.startsWith(subItem.url))
          if (isOpen) initialOpen[item.title] = true
        }
      })
    })
    setOpenItems(initialOpen)
  }, [pathname, effectiveMenuItems])

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
        {effectiveMenuItems.map((item) => {
          const effectiveItems = item.items
          const hasActiveSubItem = effectiveItems.some((subItem) => pathname === subItem.url || (subItem.url && pathname?.startsWith(subItem.url + "/")))
          const isItemOpen = openItems[item.title] ?? hasActiveSubItem ?? pathname?.startsWith(item.url || `/library`)
          return (
            <SidebarGroup key={item.title}>
              {effectiveItems.length > 0 ? (
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
                          isActive={hasActiveSubItem}
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
                        {effectiveItems.map((subItem: { title: string; url?: string; icon: any }) => (
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
                    isActive={(item as { useBrandHighlight?: boolean }).useBrandHighlight ? false : pathname === item.url}
                    className={(item as { useBrandHighlight?: boolean }).useBrandHighlight
                      ? "!bg-primary/10 !text-primary hover:!bg-primary/15 hover:!text-primary font-medium"
                      : undefined
                    }
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

        <SidebarSeparator />

        {customerConfigItems.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              {item.items.map((configItem) => {
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
                                isActive={pathname?.startsWith(configItem.url)}
                                className="w-full"
                                onClick={(e) => {
                                  if (configItem.url) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    // Close collapsible before navigation to prevent portal cleanup errors
                                    setOpenItems((prev) => ({ ...prev, [configItem.title]: false }))
                                    // Use setTimeout to ensure portal cleanup completes before navigation
                                    setTimeout(() => {
                                      router.push(configItem.url)
                                    }, 0)
                                  }
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
                          isActive={pathname === configItem.url}
                          onClick={(e) => {
                            if (configItem.url) {
                              e.preventDefault()
                              router.push(configItem.url)
                            }
                          }}
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
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Switch to admin panel"
                onClick={(e) => {
                  e.preventDefault()
                  router.push("/admin/dashboard")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="shrink-0 size-3.5" />
                <span className="truncate whitespace-nowrap min-w-0 flex-1">Admin panel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <NavUser
          user={{
            name: user?.name || "Customer",
            email: user?.email || "customer@example.com"
          }}
          menuItems={customerProfileItems.map(item => ({
            title: item.title,
            icon: item.icon,
            onClick: () => router.push(item.url),
          }))}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
