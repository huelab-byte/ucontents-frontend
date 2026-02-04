"use client"

import { Check } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for individuals just starting out.",
        features: [
            "3 Social Accounts",
            "10 AI Generations / mo",
            "Basic Analytics",
            "1 User",
        ],
        cta: "Start for Free",
        popular: false,
        href: "/auth/register"
    },
    {
        name: "Pro",
        price: "$29",
        description: "For creators and small businesses.",
        features: [
            "10 Social Accounts",
            "Unlimited AI Generations",
            "Advanced Analytics",
            "3 Team Members",
            "Priority Support",
            "Content Calendar"
        ],
        cta: "Get Started",
        popular: true,
        href: "/auth/register?plan=pro"
    },
    {
        name: "Business",
        price: "$99",
        description: "For agencies and large teams.",
        features: [
            "Unlimited Social Accounts",
            "Custom AI Models",
            "White-label Reports",
            "Unlimited Team Members",
            "Dedicated Account Manager",
            "API Access"
        ],
        cta: "Contact Sales",
        popular: false,
        href: "/contact"
    }
]

export function PricingSection() {
    return (
        <section id="pricing" className="py-20 md:py-32">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                        Pricing
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Simple, transparent <span className="text-primary">pricing</span>
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Choose the perfect plan for your needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col rounded-3xl border p-8 ${plan.popular
                                ? "border-primary shadow-lg scale-105 z-10 bg-background"
                                : "bg-background/60 shadow-sm hover:shadow-md transition-shadow"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <p className="text-muted-foreground mt-2">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <Check className="h-5 w-5 text-primary mr-3 shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={cn(
                                    buttonVariants({ variant: plan.popular ? "default" : "outline" }),
                                    "w-full rounded-full h-12",
                                    plan.popular && "text-base shadow-primary/20 shadow-lg"
                                )}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
