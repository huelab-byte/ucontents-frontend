"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteBranding } from "@/components/site-branding"

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-6">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to uContents. By accessing or using our social media management platform and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
              </p>
              <p className="text-muted-foreground mb-4">
                These Terms constitute a legally binding agreement between you and uContents. We may update these Terms from time to time, and your continued use of the Services after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground mb-4">
                uContents provides a social media management platform that allows users to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Connect and manage multiple social media accounts (including Meta/Facebook/Instagram, Google/YouTube, TikTok, and others)</li>
                <li>Schedule and publish content across connected platforms</li>
                <li>Access analytics and insights about social media performance</li>
                <li>Generate AI-powered content suggestions</li>
                <li>Collaborate with team members on social media management</li>
                <li>Store and manage media assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Account Registration and Security</h2>
              
              <h3 className="text-lg font-medium mb-3">3.1 Account Creation</h3>
              <p className="text-muted-foreground mb-4">
                To use our Services, you must create an account by providing accurate, complete, and current information. You must be at least 16 years old to create an account and use our Services.
              </p>

              <h3 className="text-lg font-medium mb-3">3.2 Account Security</h3>
              <p className="text-muted-foreground mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication when available</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Not share your account credentials with others</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">3.3 Account Termination</h3>
              <p className="text-muted-foreground mb-4">
                You may terminate your account at any time through your account settings or by contacting us. We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Third-Party Platform Integration</h2>
              
              <h3 className="text-lg font-medium mb-3">4.1 Platform Connections</h3>
              <p className="text-muted-foreground mb-4">
                Our Services allow you to connect third-party social media accounts. By connecting these accounts, you:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Authorize us to access your account data as permitted by each platform's API</li>
                <li>Agree to comply with each platform's terms of service and community guidelines</li>
                <li>Understand that platform APIs may change, affecting available features</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">4.2 Meta (Facebook & Instagram)</h3>
              <p className="text-muted-foreground mb-4">
                When connecting Facebook or Instagram accounts, you agree to comply with <a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta's Terms of Service</a> and <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Platform Terms</a>. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>You have the necessary permissions to manage connected pages/accounts</li>
                <li>Content published through our platform must comply with Meta's Community Standards</li>
                <li>Meta may revoke access at any time according to their policies</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">4.3 Google (YouTube)</h3>
              <p className="text-muted-foreground mb-4">
                When connecting Google/YouTube accounts, you agree to <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube's Terms of Service</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Terms of Service</a>. Our use of Google data is subject to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>.
              </p>

              <h3 className="text-lg font-medium mb-3">4.4 TikTok</h3>
              <p className="text-muted-foreground mb-4">
                When connecting TikTok accounts, you agree to <a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok's Terms of Service</a> and <a href="https://www.tiktok.com/legal/page/global/terms-of-service-for-api/en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TikTok for Developers Terms</a>. Content must comply with TikTok's Community Guidelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. User Content and Conduct</h2>
              
              <h3 className="text-lg font-medium mb-3">5.1 Your Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain ownership of all content you create or upload through our Services. By using our Services, you grant us a limited license to store, process, and transmit your content as necessary to provide the Services.
              </p>

              <h3 className="text-lg font-medium mb-3">5.2 Content Responsibility</h3>
              <p className="text-muted-foreground mb-4">
                You are solely responsible for the content you publish through our platform. You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>You own or have the necessary rights to use and publish the content</li>
                <li>Your content does not infringe any third-party intellectual property rights</li>
                <li>Your content complies with all applicable laws and platform guidelines</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">5.3 Prohibited Content</h3>
              <p className="text-muted-foreground mb-4">
                You agree not to use our Services to create, upload, or distribute content that:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or obscene</li>
                <li>Infringes intellectual property rights of others</li>
                <li>Contains viruses, malware, or malicious code</li>
                <li>Violates the privacy rights of others</li>
                <li>Constitutes spam, phishing, or misleading content</li>
                <li>Promotes hate speech, discrimination, or violence</li>
                <li>Exploits minors in any way</li>
                <li>Violates any applicable laws or regulations</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">5.4 Prohibited Activities</h3>
              <p className="text-muted-foreground mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Use the Services for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Services</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated tools to access the Services without permission</li>
                <li>Resell or redistribute the Services without authorization</li>
                <li>Violate third-party platform terms through our Services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Subscription and Payment</h2>
              
              <h3 className="text-lg font-medium mb-3">6.1 Subscription Plans</h3>
              <p className="text-muted-foreground mb-4">
                We offer various subscription plans with different features and limitations. Details of each plan are available on our pricing page.
              </p>

              <h3 className="text-lg font-medium mb-3">6.2 Payment Terms</h3>
              <p className="text-muted-foreground mb-4">
                By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Pay all fees according to your selected plan</li>
                <li>Provide accurate billing information</li>
                <li>Authorize recurring charges for subscription renewals</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">6.3 Refunds</h3>
              <p className="text-muted-foreground mb-4">
                Refund policies vary by subscription type and are detailed at the time of purchase. Generally, we offer a satisfaction guarantee for new subscriptions.
              </p>

              <h3 className="text-lg font-medium mb-3">6.4 Price Changes</h3>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify our pricing. We will provide notice of any price changes before they take effect for existing subscribers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-lg font-medium mb-3">7.1 Our Intellectual Property</h3>
              <p className="text-muted-foreground mb-4">
                The Services, including all software, designs, text, graphics, and other content provided by uContents, are protected by intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.
              </p>

              <h3 className="text-lg font-medium mb-3">7.2 Feedback</h3>
              <p className="text-muted-foreground mb-4">
                If you provide feedback or suggestions about our Services, we may use such feedback without any obligation to compensate you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Disclaimers</h2>
              
              <h3 className="text-lg font-medium mb-3">8.1 Service Availability</h3>
              <p className="text-muted-foreground mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted access. Services may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>

              <h3 className="text-lg font-medium mb-3">8.2 Third-Party Services</h3>
              <p className="text-muted-foreground mb-4">
                We are not responsible for the availability, accuracy, or functionality of third-party social media platforms. Changes to their APIs or policies may affect our Services.
              </p>

              <h3 className="text-lg font-medium mb-3">8.3 No Warranty</h3>
              <p className="text-muted-foreground mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, UCONTENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICES.
              </p>
              <p className="text-muted-foreground mb-4">
                OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify and hold harmless uContents, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                <li>Your use of the Services</li>
                <li>Your content or its publication</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                Any disputes arising from these Terms or your use of the Services shall be resolved through good-faith negotiation. If a resolution cannot be reached, disputes shall be submitted to binding arbitration in accordance with applicable arbitration rules.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. General Provisions</h2>
              
              <h3 className="text-lg font-medium mb-3">12.1 Entire Agreement</h3>
              <p className="text-muted-foreground mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and uContents regarding the Services.
              </p>

              <h3 className="text-lg font-medium mb-3">12.2 Severability</h3>
              <p className="text-muted-foreground mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
              </p>

              <h3 className="text-lg font-medium mb-3">12.3 Waiver</h3>
              <p className="text-muted-foreground mb-4">
                Our failure to enforce any provision of these Terms shall not be deemed a waiver of our right to enforce such provision in the future.
              </p>

              <h3 className="text-lg font-medium mb-3">12.4 Assignment</h3>
              <p className="text-muted-foreground mb-4">
                You may not assign these Terms without our prior written consent. We may assign these Terms without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
                <p><strong>Email:</strong> legal@ucontents.com</p>
                <p><strong>Support:</strong> support@ucontents.com</p>
              </div>
            </section>

            <section className="border-t pt-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
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
