"use client"

import {
    Wand2,
    CalendarClock,
    BarChart3,
    Users,
    Layers,
    Zap
} from "lucide-react"

const features = [
    {
        icon: Wand2,
        title: "AI Content Generation",
        description: "Generate engaging posts, captions, and hashtags in seconds tailored to your brand voice."
    },
    {
        icon: CalendarClock,
        title: "Smart Scheduling",
        description: "Schedule posts for optimal times across all your social channels with a visual calendar."
    },
    {
        icon: BarChart3,
        title: "Deep Analytics",
        description: "Track performance with real-time insights on engagement, reach, and audience demographics."
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite team members, assign roles, and streamline your approval workflow."
    },
    {
        icon: Layers,
        title: "Multi-Platform Support",
        description: "Manage Instagram, TikTok, Twitter, LinkedIn, and Facebook from a single dashboard."
    },
    {
        icon: Zap,
        title: "Automation Workflows",
        description: "Set up trigger-based actions to auto-reply to comments or repost top-performing content."
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                        Features
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Everything you need to <span className="text-primary">grow</span>
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Powerful tools designed to help you scale your social media presence without the burnout.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl border bg-background p-8 hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
