"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-16 md:pt-24 pb-16">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

            <div className="container px-4 md:px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    <span>New AI Features Available</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
                    Simplify Social Media with <span className="text-primary">Intelligence</span>
                </h1>

                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
                    Create, schedule, and analyze your content across all platforms in one separate place.
                    Powered by advanced AI to save you time and boost engagement.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-300">
                    <Link
                        href="/auth/register"
                        className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base rounded-full")}
                    >
                        Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                        href="#features"
                        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8 text-base rounded-full")}
                    >
                        Explore Features
                    </Link>
                </div>

                {/* Dashboard Mockup */}
                <div className="mt-16 w-full max-w-5xl relative animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
                    <div className="rounded-xl border bg-background/50 backdrop-blur shadow-2xl overflow-hidden aspect-[16/9] relative group">
                        {/* Abstract UI Representation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <p className="text-muted-foreground font-medium">Interactive Dashboard Interface</p>
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                    </div>

                    {/* Decorative blobs behind mockup */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-1000" />
                </div>
            </div>
        </section>
    )
}
