"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteBranding } from "@/components/site-branding"

export default function PrivacyPolicyPage() {
  const lastUpdated = "February 2, 2026"
  
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to uContents ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media management platform and related services.
              </p>
              <p className="text-muted-foreground mb-4">
                By using uContents, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-3">2.1 Information You Provide Directly</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, and profile information when you create an account</li>
                <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely through our payment providers)</li>
                <li><strong>Content:</strong> Posts, images, videos, and other content you create or upload through our platform</li>
                <li><strong>Communications:</strong> Information you provide when contacting our support team</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">2.2 Information from Third-Party Platforms</h3>
              <p className="text-muted-foreground mb-4">
                When you connect your social media accounts (including but not limited to Facebook, Instagram, Google/YouTube, and TikTok), we collect:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Profile Information:</strong> Name, profile picture, email address, and user ID from the connected platform</li>
                <li><strong>Account Data:</strong> Page/channel information, follower counts, and account settings</li>
                <li><strong>Content Data:</strong> Posts, media, comments, and engagement metrics as permitted by each platform's API</li>
                <li><strong>Authentication Tokens:</strong> Access tokens required to perform actions on your behalf</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">2.3 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
                <li><strong>Cookies and Similar Technologies:</strong> See our Cookie Policy section below</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our social media management services</li>
                <li><strong>Content Management:</strong> To schedule, publish, and manage content across your connected social media accounts</li>
                <li><strong>Analytics:</strong> To provide insights and analytics about your social media performance</li>
                <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
                <li><strong>Personalization:</strong> To customize your experience and provide relevant features</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraudulent activities</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium mb-3">4.1 With Your Consent</h3>
              <p className="text-muted-foreground mb-4">
                We share information when you explicitly authorize us to do so.
              </p>

              <h3 className="text-lg font-medium mb-3">4.2 Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We engage trusted third-party service providers to perform functions on our behalf, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Cloud hosting and storage providers</li>
                <li>Payment processors</li>
                <li>Analytics providers</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">4.3 Social Media Platforms</h3>
              <p className="text-muted-foreground mb-4">
                When you use our services to publish content, we transmit your content to the respective social media platforms (Meta/Facebook/Instagram, Google/YouTube, TikTok, etc.) according to their APIs and terms of service.
              </p>

              <h3 className="text-lg font-medium mb-3">4.4 Legal Requirements</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose information when required by law, legal process, or government request, or to protect our rights, privacy, safety, or property.
              </p>

              <h3 className="text-lg font-medium mb-3">4.5 Business Transfers</h3>
              <p className="text-muted-foreground mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Third-Party Platform Data Usage</h2>
              
              <h3 className="text-lg font-medium mb-3">5.1 Meta (Facebook & Instagram)</h3>
              <p className="text-muted-foreground mb-4">
                When you connect your Facebook or Instagram account, we access data through Meta's Graph API. We use this data solely to provide our services, including content scheduling and analytics. We do not sell Facebook or Instagram user data to third parties. Your use of Facebook/Instagram features is also subject to <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta's Privacy Policy</a>.
              </p>

              <h3 className="text-lg font-medium mb-3">5.2 Google (YouTube)</h3>
              <p className="text-muted-foreground mb-4">
                When you connect your Google/YouTube account, we use Google's API Services. Our use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. Your use of Google features is also subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Privacy Policy</a>.
              </p>

              <h3 className="text-lg font-medium mb-3">5.3 TikTok</h3>
              <p className="text-muted-foreground mb-4">
                When you connect your TikTok account, we access data through TikTok's API. We use this data solely to provide content publishing and analytics services. Your use of TikTok features is also subject to <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok's Privacy Policy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. Specifically:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period thereafter</li>
                <li><strong>Content:</strong> Retained until you delete it or close your account</li>
                <li><strong>Analytics Data:</strong> Aggregated data may be retained for longer periods for statistical purposes</li>
                <li><strong>Legal Records:</strong> Some information may be retained longer to comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                To exercise these rights, please visit our <Link href="/data-removal-request" className="text-primary hover:underline">Data Removal Request</Link> page or contact us using the information below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Maintain your session and remember your preferences</li>
                <li>Analyze usage patterns and improve our services</li>
                <li>Provide security features</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses and adequacy decisions where applicable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
                <p><strong>Email:</strong> privacy@ucontents.com</p>
                <p><strong>Data Protection Requests:</strong> <Link href="/data-removal-request" className="text-primary hover:underline">Submit a Data Request</Link></p>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                <Link href="/data-removal-request" className="text-primary hover:underline">Data Removal Request</Link>
                <Link href="/auth/login" className="text-primary hover:underline">Back to Login</Link>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
