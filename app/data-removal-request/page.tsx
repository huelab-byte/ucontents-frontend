"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailIcon, UserIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { SiteBranding } from "@/components/site-branding"

export default function DataRemovalRequestPage() {
  const [email, setEmail] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [requestType, setRequestType] = React.useState<"deletion" | "export" | "both">("deletion")
  const [additionalInfo, setAdditionalInfo] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to submit request. Please try again or contact support directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Site Logo Header */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <SiteBranding showText={true} iconClassName="h-10 w-10" textClassName="text-2xl" />
            </Link>
          </div>

          <Card>
            <CardContent className="pt-12 pb-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-emerald-500/10 p-4">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-12 text-emerald-500"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Request Submitted Successfully</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We have received your data {requestType === "both" ? "deletion and export" : requestType} request. 
                You will receive a confirmation email at <strong>{email}</strong> within 24 hours.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-left text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                <p className="font-medium text-foreground mb-2">What happens next?</p>
                <ul className="space-y-2">
                  <li>1. We will verify your identity using the email provided</li>
                  <li>2. Your request will be processed within 30 days</li>
                  <li>3. You will receive confirmation once completed</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/login">
                  <Button variant="outline">Back to Login</Button>
                </Link>
                <Link href="/">
                  <Button>Go to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Site Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <SiteBranding showText={true} iconClassName="h-10 w-10" textClassName="text-2xl" />
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1 border-b">
            <CardTitle className="text-3xl font-bold">Data Removal Request</CardTitle>
            <CardDescription className="text-base">
              Exercise your rights to access, delete, or export your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Information Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Data Rights</h2>
              <p className="text-muted-foreground mb-4">
                At uContents, we respect your privacy and your rights over your personal data. In accordance with GDPR, CCPA, and other applicable data protection regulations, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong>Right to Deletion:</strong> Request the deletion of your personal data from our systems</li>
                <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
              </ul>
            </section>

            <Separator className="my-8" />

            {/* Data Scope Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">What Data We Delete</h2>
              <p className="text-muted-foreground mb-4">
                When you request data deletion, we will remove the following from our systems:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Account Data</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Profile information (name, email, etc.)</li>
                    <li>• Account settings and preferences</li>
                    <li>• Login credentials</li>
                    <li>• Two-factor authentication data</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Content & Media</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Uploaded images and videos</li>
                    <li>• Scheduled posts and drafts</li>
                    <li>• Post history and content</li>
                    <li>• Media library assets</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Connected Accounts</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Social media connection tokens</li>
                    <li>• Platform account information</li>
                    <li>• Publishing permissions</li>
                    <li>• Analytics data we've collected</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Usage Data</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Activity logs</li>
                    <li>• Feature usage history</li>
                    <li>• Support ticket history</li>
                    <li>• Communication records</li>
                  </ul>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-sm">
                <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">Important Notes:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Content already published to social media platforms will not be affected. You must delete that directly from each platform.</li>
                  <li>• Some data may be retained for legal compliance (e.g., billing records for tax purposes) for the legally required period.</li>
                  <li>• Anonymous, aggregated data that cannot identify you may be retained for analytics purposes.</li>
                </ul>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Third-Party Platform Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Third-Party Platform Data</h2>
              <p className="text-muted-foreground mb-4">
                If you've connected social media accounts through our platform, you can also request data deletion directly from these providers:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <a 
                  href="https://www.facebook.com/help/contact/784491318687824" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium mb-1">Meta (Facebook/Instagram)</h3>
                  <p className="text-sm text-primary">Request Data Deletion →</p>
                </a>
                <a 
                  href="https://support.google.com/accounts/answer/3024190" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium mb-1">Google (YouTube)</h3>
                  <p className="text-sm text-primary">Manage Your Data →</p>
                </a>
                <a 
                  href="https://www.tiktok.com/legal/report/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium mb-1">TikTok</h3>
                  <p className="text-sm text-primary">Privacy Request →</p>
                </a>
              </div>
            </section>

            <Separator className="my-8" />

            {/* Request Form */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Submit Your Request</h2>
              <p className="text-muted-foreground mb-6">
                Please fill out the form below to submit your data request. We will verify your identity and process your request within 30 days.
              </p>

              {error && (
                <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <HugeiconsIcon
                        icon={UserIcon}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <HugeiconsIcon
                        icon={MailIcon}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use the email address associated with your uContents account
                    </p>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Request Type</FieldLabel>
                  <FieldContent>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="requestType"
                          value="deletion"
                          checked={requestType === "deletion"}
                          onChange={() => setRequestType("deletion")}
                          className="mt-1 h-4 w-4 accent-primary"
                          disabled={isSubmitting}
                        />
                        <div>
                          <span className="font-medium">Delete my data</span>
                          <p className="text-sm text-muted-foreground">Permanently remove all my personal data from uContents</p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="requestType"
                          value="export"
                          checked={requestType === "export"}
                          onChange={() => setRequestType("export")}
                          className="mt-1 h-4 w-4 accent-primary"
                          disabled={isSubmitting}
                        />
                        <div>
                          <span className="font-medium">Export my data</span>
                          <p className="text-sm text-muted-foreground">Receive a copy of all my personal data in a downloadable format</p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="requestType"
                          value="both"
                          checked={requestType === "both"}
                          onChange={() => setRequestType("both")}
                          className="mt-1 h-4 w-4 accent-primary"
                          disabled={isSubmitting}
                        />
                        <div>
                          <span className="font-medium">Export and then delete my data</span>
                          <p className="text-sm text-muted-foreground">Receive a copy of my data, then permanently delete it</p>
                        </div>
                      </label>
                    </div>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="additionalInfo">Additional Information (Optional)</FieldLabel>
                  <FieldContent>
                    <textarea
                      id="additionalInfo"
                      placeholder="Any additional details about your request..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </FieldContent>
                </Field>

                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                  <p>
                    By submitting this request, you confirm that you are the owner of the account associated with the email address provided, or you are authorized to make this request on their behalf. We may contact you to verify your identity before processing this request.
                  </p>
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting Request..." : "Submit Data Request"}
                </Button>
              </form>
            </section>

            <Separator className="my-8" />

            {/* Contact Section */}
            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about your data or need assistance with your request, please contact our Data Protection team:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
                <p><strong>Email:</strong> privacy@ucontents.com</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                <Link href="/auth/login" className="text-primary hover:underline">Back to Login</Link>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
