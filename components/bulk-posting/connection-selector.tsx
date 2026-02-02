"use client"

import * as React from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxGroup,
  ComboboxLabel,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { SocialChannel, SocialConnectionGroup, SocialChannelType } from "@/lib/api"
import type { ConnectionSelection } from "./types"

interface ConnectionSelectorProps {
  channels: SocialChannel[]
  groups: SocialConnectionGroup[]
  selectedConnections: ConnectionSelection
  onSelectionChange: (selection: ConnectionSelection) => void
  isLoading?: boolean
}

// Helper to get icon for channel type
function getChannelIcon(type: SocialChannelType) {
  switch (type) {
    case "facebook_page":
    case "facebook_profile":
      return <FaFacebook className="size-4 text-[#1877F2]" />
    case "instagram_business":
      return <FaInstagram className="size-4 text-[#E4405F]" />
    case "youtube_channel":
      return <FaYoutube className="size-4 text-[#FF0000]" />
    case "tiktok_profile":
      return <FaTiktok className="size-4" />
    default:
      return null
  }
}

// Helper to format channel type for display
function formatChannelType(type: SocialChannelType): string {
  switch (type) {
    case "facebook_page":
      return "Facebook Page"
    case "facebook_profile":
      return "Facebook Profile"
    case "instagram_business":
      return "Instagram"
    case "youtube_channel":
      return "YouTube"
    case "tiktok_profile":
      return "TikTok"
    default:
      return type
  }
}

// Create a unified item type for the combobox
type SelectionItem = {
  id: string
  type: "channel" | "group"
  label: string
  subLabel?: string
  avatar?: string | null
  channelType?: SocialChannelType
}

export function ConnectionSelector({
  channels,
  groups,
  selectedConnections,
  onSelectionChange,
  isLoading = false,
}: ConnectionSelectorProps) {
  const anchorRef = useComboboxAnchor()

  // Convert channels and groups to unified selection items
  const items: SelectionItem[] = React.useMemo(() => {
    const groupItems: SelectionItem[] = groups.map((g) => ({
      id: `group-${g.id}`,
      type: "group" as const,
      label: g.name,
      subLabel: `${channels.filter((c) => c.group_id === g.id).length} connections`,
    }))

    const channelItems: SelectionItem[] = channels.map((c) => ({
      id: `channel-${c.id}`,
      type: "channel" as const,
      label: c.name,
      subLabel: formatChannelType(c.type),
      avatar: c.avatar_url,
      channelType: c.type,
    }))

    return [...groupItems, ...channelItems]
  }, [channels, groups])

  // Convert selection to string array for combobox
  const selectedValues = React.useMemo(() => {
    const channelValues = selectedConnections.channels.map((id) => `channel-${id}`)
    const groupValues = selectedConnections.groups.map((id) => `group-${id}`)
    return [...groupValues, ...channelValues]
  }, [selectedConnections])

  // Handle value change from combobox
  const handleValueChange = (values: string[] | null) => {
    const newValues = values || []
    const newChannels: number[] = []
    const newGroups: number[] = []

    newValues.forEach((value) => {
      if (value.startsWith("channel-")) {
        newChannels.push(parseInt(value.replace("channel-", ""), 10))
      } else if (value.startsWith("group-")) {
        newGroups.push(parseInt(value.replace("group-", ""), 10))
      }
    })

    onSelectionChange({
      channels: newChannels,
      groups: newGroups,
    })
  }

  // Remove a single item
  const handleRemoveItem = (itemId: string) => {
    const newValues = selectedValues.filter((v) => v !== itemId)
    handleValueChange(newValues)
  }

  // Get item by ID
  const getItemById = (id: string): SelectionItem | undefined => {
    return items.find((item) => item.id === id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 text-sm text-muted-foreground">
        Loading connections...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4">
        No connections available. Please connect your social accounts first.
      </div>
    )
  }

  return (
    <Combobox
      multiple
      value={selectedValues}
      onValueChange={handleValueChange}
    >
      <ComboboxChips ref={anchorRef} className="w-full min-h-10">
        {selectedValues.map((value) => {
          const item = getItemById(value)
          if (!item) return null

          return (
            <div
              key={value}
              className="bg-muted text-foreground flex h-6 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium whitespace-nowrap"
            >
              {item.type === "group" ? (
                <HugeiconsIcon icon={UserGroupIcon} className="size-3" />
              ) : item.channelType ? (
                <span className="flex-shrink-0">{getChannelIcon(item.channelType)}</span>
              ) : null}
              <span className="truncate max-w-[120px]">{item.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(value)}
                className="ml-0.5 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                aria-label={`Remove ${item.label}`}
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
              </button>
            </div>
          )
        })}
        <ComboboxChipsInput
          placeholder={selectedValues.length === 0 ? "Search connections or groups..." : "Add more..."}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxEmpty>No connections found.</ComboboxEmpty>
        {groups.length > 0 && (
          <ComboboxGroup>
            <ComboboxLabel>Groups</ComboboxLabel>
            <ComboboxList>
              {items.filter((i) => i.type === "group").map((item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                      <HugeiconsIcon icon={UserGroupIcon} className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.subLabel}</span>
                    </div>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxGroup>
        )}
        {channels.length > 0 && (
          <ComboboxGroup>
            <ComboboxLabel>Channels</ComboboxLabel>
            <ComboboxList>
              {items.filter((i) => i.type === "channel").map((item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    {item.avatar ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.avatar} alt={item.label} />
                        <AvatarFallback className="text-xs">
                          {item.label.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center">
                        {item.channelType && getChannelIcon(item.channelType)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.subLabel}</span>
                    </div>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxGroup>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
