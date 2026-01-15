import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Container from '../components/layout/Container';

const TermsOfService = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Head>
        <title>Terms of Service - Flavatix</title>
        <meta
          name="description"
          content="Flavatix Terms of Service - Legal terms and conditions for using our tasting platform"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <Container>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              Last Updated: January 15, 2026
            </p>

            <div className="prose dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  1. Agreement to Terms
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  By accessing or using Flavatix (&quot;Service&quot;, &quot;Platform&quot;,
                  &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by
                  these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
                  you may not access or use the Service.
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  These Terms constitute a legally binding agreement between you and Flavatix.
                  Please read them carefully.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  2. Eligibility
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  You must be at least 16 years old to use Flavatix. By using the Service, you
                  represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>You are at least 16 years of age</li>
                  <li>You have the legal capacity to enter into these Terms</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>All information you provide is accurate and current</li>
                  <li>You will not use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  3. Account Registration
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.1 Account Creation
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  To access certain features, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.2 Account Security
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  You are responsible for maintaining the confidentiality of your account
                  credentials. We recommend:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    Using a strong, unique password (minimum 8 characters with complexity
                    requirements)
                  </li>
                  <li>Enabling two-factor authentication (2FA) when available</li>
                  <li>Not sharing your password with others</li>
                  <li>Logging out of shared devices</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.3 Account Termination
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We reserve the right to suspend or terminate your account if you violate these
                  Terms or engage in fraudulent, abusive, or illegal activity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  4. Service Description
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Flavatix provides a digital platform for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    Recording and organizing tasting notes for coffee, wine, spirits, and other
                    beverages
                  </li>
                  <li>Creating and managing tasting sessions and competitions</li>
                  <li>AI-powered flavor extraction and analysis</li>
                  <li>Social features including following, liking, and commenting</li>
                  <li>Sharing tasting experiences and building a tasting community</li>
                  <li>Exporting tasting data and generating reports</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  5. User Content
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.1 Your Content
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  You retain ownership of all content you submit to Flavatix (&quot;User
                  Content&quot;), including tasting notes, reviews, images, and comments. By
                  submitting User Content, you grant us a worldwide, non-exclusive, royalty-free
                  license to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Store, display, and distribute your User Content on the Platform</li>
                  <li>Use your User Content to provide and improve the Service</li>
                  <li>
                    Create derivative works for service improvement (e.g., AI model training with
                    anonymized data)
                  </li>
                  <li>
                    Share your public User Content with other users as per your privacy settings
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.2 Content Standards
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  You agree that your User Content will not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Violate any law or regulation</li>
                  <li>Infringe intellectual property rights of others</li>
                  <li>Contain hate speech, harassment, or discriminatory content</li>
                  <li>Include explicit, obscene, or offensive material</li>
                  <li>Contain spam, advertising, or promotional content (unless authorized)</li>
                  <li>Include malicious code, viruses, or harmful software</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Contain false or misleading information</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.3 Content Moderation
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We reserve the right to review, moderate, and remove User Content that violates
                  these Terms. We are not responsible for User Content and do not endorse any
                  opinions expressed by users.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.4 Content Deletion
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  You may delete your User Content at any time through your account settings.
                  Deleted content will be removed from active systems within 30 days and from
                  backups within 90 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  6. Intellectual Property
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  6.1 Our Intellectual Property
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  The Service, including its design, software, code, features, and content
                  (excluding User Content), is owned by Flavatix and protected by copyright,
                  trademark, and other intellectual property laws. You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Copy, modify, or distribute our software or content</li>
                  <li>Reverse engineer, decompile, or disassemble the Service</li>
                  <li>Remove or alter copyright, trademark, or proprietary notices</li>
                  <li>Use our trademarks without written permission</li>
                  <li>Create derivative works based on the Service</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  6.2 Trademarks
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Flavatix, the Flavatix logo, and other marks are trademarks of Flavatix. You may
                  not use our trademarks without prior written consent.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  6.3 Copyright Infringement
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  If you believe content on Flavatix infringes your copyright, please contact us at
                  dmca@flavatix.com with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Description of the copyrighted work</li>
                  <li>URL of the infringing content</li>
                  <li>Your contact information</li>
                  <li>A statement of good faith belief that use is not authorized</li>
                  <li>A statement under penalty of perjury that information is accurate</li>
                  <li>Physical or electronic signature of copyright owner or authorized agent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  7. Prohibited Conduct
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to systems or user accounts</li>
                  <li>Use automated systems (bots, scrapers) without permission</li>
                  <li>Transmit viruses, malware, or malicious code</li>
                  <li>Collect or harvest user information without consent</li>
                  <li>Engage in spamming or unsolicited advertising</li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Manipulate or game the system (e.g., fake reviews, vote manipulation)</li>
                  <li>Circumvent security measures or access controls</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  8. Payment and Subscriptions
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  8.1 Free and Paid Services
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Flavatix offers both free and paid subscription tiers. Paid features and pricing
                  are described on our pricing page.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  8.2 Payment Processing
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Payments are processed by third-party payment processors. By providing payment
                  information, you authorize us to charge the applicable fees.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  8.3 Refund Policy
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Refunds are handled on a case-by-case basis. Contact support@flavatix.com for
                  refund requests.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  8.4 Subscription Cancellation
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  You may cancel your subscription at any time through your account settings.
                  Cancellation takes effect at the end of the current billing period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  9. Privacy and Data Protection
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use,
                  and protect your personal data. By using the Service, you consent to our Privacy
                  Policy.
                </p>
                <button
                  onClick={() => router.push('/privacy')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Read Privacy Policy →
                </button>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  10. Disclaimers
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  10.1 Service Availability
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                  WARRANTIES OF ANY KIND. We do not guarantee uninterrupted, secure, or error-free
                  operation.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  10.2 Accuracy of Information
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We do not warrant the accuracy, completeness, or reliability of User Content or
                  AI-generated insights. Tasting notes and flavor profiles are subjective opinions.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  10.3 Third-Party Services
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  The Service may integrate with third-party services. We are not responsible for
                  third-party services or their availability, accuracy, or security.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  10.4 Health and Safety
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Flavatix does not provide medical, health, or safety advice. Consult professionals
                  before consuming products, especially if you have allergies or health conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  11. Limitation of Liability
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLAVATIX SHALL NOT BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or data breaches</li>
                  <li>User Content or actions of other users</li>
                  <li>Unauthorized access to your account</li>
                  <li>Errors or inaccuracies in the Service</li>
                </ul>
                <p className="text-zinc-700 dark:text-zinc-300 mt-4">
                  OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE LAST 12 MONTHS,
                  OR $100, WHICHEVER IS GREATER.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  12. Indemnification
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300">
                  You agree to indemnify and hold harmless Flavatix, its officers, directors,
                  employees, and agents from any claims, damages, losses, liabilities, and expenses
                  (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Your use of the Service</li>
                  <li>Your User Content</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  13. Dispute Resolution
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  13.1 Governing Law
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  These Terms are governed by the laws of [Your Jurisdiction], without regard to
                  conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  13.2 Informal Resolution
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Before filing a claim, please contact us at legal@flavatix.com to attempt informal
                  resolution. We will work in good faith to resolve disputes.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  13.3 Arbitration
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Any dispute that cannot be resolved informally shall be resolved through binding
                  arbitration in accordance with [Arbitration Rules]. You waive the right to a jury
                  trial or class action.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  14. Modifications to Terms
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We reserve the right to modify these Terms at any time. We will notify you of
                  material changes via:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Email notification to your registered email address</li>
                  <li>Prominent notice on the Platform</li>
                  <li>In-app notification</li>
                </ul>
                <p className="text-zinc-700 dark:text-zinc-300 mt-4">
                  Continued use of the Service after changes constitutes acceptance of the updated
                  Terms. If you do not agree to the changes, you must stop using the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  15. Termination
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  15.1 Termination by You
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  You may terminate your account at any time through your account settings or by
                  contacting support@flavatix.com.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  15.2 Termination by Us
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We may suspend or terminate your account immediately if you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Violate these Terms</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Abuse or harm other users</li>
                  <li>Fail to pay applicable fees</li>
                  <li>Create security or legal risks</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  15.3 Effect of Termination
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Upon termination, your right to use the Service immediately ceases. We will delete
                  your account data within 90 days, subject to legal and backup retention
                  requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  16. General Provisions
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  16.1 Entire Agreement
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  These Terms, together with our Privacy Policy, constitute the entire agreement
                  between you and Flavatix.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  16.2 Severability
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  If any provision of these Terms is found invalid or unenforceable, the remaining
                  provisions remain in full force.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  16.3 Waiver
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Our failure to enforce any right or provision does not constitute a waiver of such
                  right or provision.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  16.4 Assignment
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  You may not assign these Terms without our written consent. We may assign these
                  Terms at any time without notice.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  16.5 Force Majeure
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We are not liable for delays or failures due to circumstances beyond our
                  reasonable control (e.g., natural disasters, government actions, network
                  failures).
                </p>
              </section>

              <section className="border-t border-zinc-200 dark:border-zinc-700 pt-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  17. Contact Information
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-700 p-6 rounded-lg">
                  <p className="text-zinc-900 dark:text-zinc-50 mb-2">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:legal@flavatix.com" className="text-primary hover:underline">
                      legal@flavatix.com
                    </a>
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-50 mb-2">
                    <strong>Support:</strong>{' '}
                    <a href="mailto:support@flavatix.com" className="text-primary hover:underline">
                      support@flavatix.com
                    </a>
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-50">
                    <strong>Response Time:</strong> We will respond to all inquiries within 2
                    business days
                  </p>
                </div>
              </section>

              <section className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg mt-8">
                <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-2">
                  By using Flavatix, you acknowledge that you have read, understood, and agree to be
                  bound by these Terms of Service.
                </p>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                  If you do not agree to these Terms, please discontinue use of the Service
                  immediately.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TermsOfService;
