"use client"

import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon, Book01Icon } from "@hugeicons/core-free-icons"

interface Tutorial {
  id: string
  title: string
  description: string
  videoId: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
}

const tutorials: Tutorial[] = [
  {
    id: "1",
    title: "Getting Started with Content Generation",
    description: "Learn how to create and manage your first content generation workflow with step-by-step instructions.",
    videoId: "AURnISajubk",
    category: "Content Generation",
    level: "beginner",
  },
  {
    id: "2",
    title: "Advanced Social Automation Setup",
    description: "Master advanced techniques for setting up complex social media automation workflows and integrations.",
    videoId: "e3OV3LnrS7o",
    category: "Social Automation",
    level: "intermediate",
  },
]


export default function TutorialsPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={Book01Icon} className="size-8" />
              Tutorial Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Step-by-step tutorials for setting up automations, generating content, managing teams, and optimizing workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-video bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${tutorial.videoId}`}
                  title={tutorial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight pr-2">
                    {tutorial.title}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
                  <HugeiconsIcon icon={Video01Icon} className="size-4" />
                  <span className="text-xs">YouTube Tutorial</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {tutorials.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <HugeiconsIcon icon={Video01Icon} className="size-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No tutorials available</CardTitle>
              <CardDescription>
                Tutorials will appear here once they are added to the library.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerDashboardLayout>
  )
}
