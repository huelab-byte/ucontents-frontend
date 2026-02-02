"use client"

import * as React from "react"
import {
  bulkPostingService,
  socialConnectionService,
  supportService,
  profileService,
} from "@/lib/api"
import type {
  BulkPostingCampaign,
  SocialChannel,
  SupportTicket,
} from "@/lib/api"
import {
  WelcomeWidget,
  CampaignStatsWidget,
  ChannelsWidget,
  SupportWidget,
  RecentCampaignsWidget,
  QuickActionsWidget,
} from "@/components/dashboard"

export function DashboardContent() {
  const [profile, setProfile] = React.useState<{ name?: string | null } | null>(null)
  const [campaigns, setCampaigns] = React.useState<BulkPostingCampaign[]>([])
  const [channels, setChannels] = React.useState<SocialChannel[]>([])
  const [openTicketsCount, setOpenTicketsCount] = React.useState(0)
  const [recentOpenTickets, setRecentOpenTickets] = React.useState<SupportTicket[]>([])

  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = React.useState(true)
  const [isLoadingChannels, setIsLoadingChannels] = React.useState(true)
  const [isLoadingSupport, setIsLoadingSupport] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      const [profileRes, campaignsRes, channelsRes, ticketsRes] = await Promise.all([
        profileService.getProfile(),
        bulkPostingService.list({ per_page: 200, page: 1 }),
        socialConnectionService.getChannels({ per_page: 100 }),
        supportService.getTickets({ status: "open", per_page: 5 }),
      ])

      if (profileRes.success && profileRes.data) {
        setProfile({ name: profileRes.data.name })
      }
      setIsLoadingProfile(false)

      if (campaignsRes.success && campaignsRes.data) {
        setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data : [])
      }
      setIsLoadingCampaigns(false)

      if (channelsRes.success && channelsRes.data) {
        setChannels(Array.isArray(channelsRes.data) ? channelsRes.data : [])
      }
      setIsLoadingChannels(false)

      if (ticketsRes.success && ticketsRes.data) {
        const list = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
        setRecentOpenTickets(list)
        setOpenTicketsCount(ticketsRes.pagination?.total ?? list.length)
      }
      setIsLoadingSupport(false)
    }

    loadData().catch((error) => {
      console.error("Failed to load dashboard data:", error)
      setIsLoadingProfile(false)
      setIsLoadingCampaigns(false)
      setIsLoadingChannels(false)
      setIsLoadingSupport(false)
    })
  }, [])

  const isLoadingWelcome = isLoadingProfile
  const hasChannels = channels.filter((c) => c.is_active).length > 0
  const hasCampaigns = campaigns.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your social media automation, content generation, and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeWidget
            userName={profile?.name}
            hasChannels={hasChannels}
            hasCampaigns={hasCampaigns}
            isLoading={isLoadingWelcome}
          />
        </div>
        <div>
          <QuickActionsWidget />
        </div>
      </div>

      <CampaignStatsWidget campaigns={campaigns} isLoading={isLoadingCampaigns} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChannelsWidget channels={channels} isLoading={isLoadingChannels} />
        <SupportWidget
          openTicketsCount={openTicketsCount}
          recentTickets={recentOpenTickets}
          isLoading={isLoadingSupport}
        />
        <RecentCampaignsWidget campaigns={campaigns} isLoading={isLoadingCampaigns} />
      </div>
    </div>
  )
}
