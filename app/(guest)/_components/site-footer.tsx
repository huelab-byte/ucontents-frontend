import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/20 py-12 md:py-16">
            <div className="container px-4 md:px-6 mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <div className="col-span-2 lg:col-span-2">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl mb-4">
                        <span className="text-primary">uContents</span>
                    </Link>
                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                        The all-in-one social media management platform powered by AI.
                        Create, schedule, and grow effortlessly.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} uContents. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-col space-y-3">
                    <h3 className="font-semibold">Product</h3>
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                    <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</Link>
                </div>

                <div className="flex flex-col space-y-3">
                    <h3 className="font-semibold">Company</h3>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                </div>

                <div className="flex flex-col space-y-3">
                    <h3 className="font-semibold">Legal</h3>
                    <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                    <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                    <Link href="/data-removal-request" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Data Removal</Link>
                </div>
            </div>
        </footer>
    )
}
