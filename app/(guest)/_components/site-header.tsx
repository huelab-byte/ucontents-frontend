"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
    const { isAuthenticated, user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "About", href: "#about" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 md:px-6 mx-auto flex h-14 items-center justify-between">
                {/* Logo - Left */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">uContents</span>
                    </Link>
                </div>

                {/* Desktop Nav - Center */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Buttons & Theme Toggle - Right */}
                <div className="hidden md:flex items-center gap-2">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <Link
                            href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                            className={cn(buttonVariants({ variant: "default" }))}
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/auth/login"
                                className={cn(buttonVariants({ variant: "ghost" }))}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/auth/register"
                                className={cn(buttonVariants({ variant: "default" }))}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Nav */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 mt-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-lg font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <div className="h-px bg-border my-2" />
                                {isAuthenticated ? (
                                    <Link
                                        href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                        className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
