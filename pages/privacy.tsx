import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Container from '../components/layout/Container';

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Head>
        <title>Privacy Policy - Flavatix</title>
        <meta
          name="description"
          content="Flavatix Privacy Policy - How we collect, use, and protect your personal data"
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
              Privacy Policy
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              Last Updated: January 22, 2026
            </p>

            <div className="prose dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  1. Introduction
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Welcome to Flavatix (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are
                  committed to protecting your personal data and respecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you use our tasting platform and services.
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  This policy complies with the EU General Data Protection Regulation (GDPR),
                  California Consumer Privacy Act (CCPA), and other applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  2. Data Controller
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Flavatix is the data controller responsible for your personal data. If you have
                  any questions about this privacy policy or our data practices, please contact us
                  at:
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                  <p className="text-zinc-900 dark:text-zinc-50 font-medium">
                    Email: privacy@flavatix.com
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-50 font-medium">
                    Data Protection Officer: dpo@flavatix.com
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  3. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.1 Information You Provide
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Account Information:</strong> Name, email address, password (encrypted),
                    profile picture
                  </li>
                  <li>
                    <strong>Tasting Data:</strong> Flavor notes, ratings, reviews, tasting session
                    details, uploaded images
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Bio, preferences, expertise level, social
                    connections
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Messages, comments, feedback, support
                    requests
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Processed securely by third-party payment
                    processors (we do not store full payment card details)
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.2 Information Collected Automatically
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Device Information:</strong> IP address, browser type, operating system,
                    device identifiers
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Pages visited, features used, time spent,
                    interaction patterns
                  </li>
                  <li>
                    <strong>Cookies and Tracking:</strong> Session cookies, analytics cookies,
                    preference cookies (see Cookie Policy)
                  </li>
                  <li>
                    <strong>Location Data:</strong> Approximate location based on IP address (if you
                    consent)
                  </li>
                  <li>
                    <strong>Performance Data:</strong> Error logs, crash reports, API response times
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.3 Camera and Barcode Scanning
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Camera Access:</strong> We request camera access solely for barcode
                    scanning functionality. You must explicitly grant permission.
                  </li>
                  <li>
                    <strong>Image Processing:</strong> Camera images are processed locally on your
                    device for barcode detection. We do not store or transmit camera images to our
                    servers.
                  </li>
                  <li>
                    <strong>Barcode Data:</strong> Only the extracted barcode/UPC data is stored with
                    your tasting notes for product identification purposes.
                  </li>
                  <li>
                    <strong>No Biometric Data:</strong> We do not collect facial recognition data,
                    fingerprints, or other biometric information.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  3.4 Information from Third Parties
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Social Login:</strong> Profile information from Google OAuth (if you
                    choose social login)
                  </li>
                  <li>
                    <strong>Authentication Services:</strong> Authentication status and user ID from
                    Supabase Auth
                  </li>
                  <li>
                    <strong>Analytics Providers:</strong> Aggregated usage statistics from analytics
                    services (if enabled)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  4. How We Use Your Information
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We process your personal data for the following purposes:
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  4.1 Service Provision (Legal Basis: Contract Performance)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Create and manage your account</li>
                  <li>Enable tasting sessions and flavor tracking</li>
                  <li>Store and display your tasting notes and reviews</li>
                  <li>Facilitate social features (connections, sharing, competitions)</li>
                  <li>Provide AI-powered flavor extraction and insights</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  4.2 Service Improvement (Legal Basis: Legitimate Interest)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Analyze usage patterns to improve features</li>
                  <li>Monitor performance and fix bugs</li>
                  <li>Train and improve AI models (anonymized data only)</li>
                  <li>Conduct research and development</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  4.3 Communication (Legal Basis: Consent / Legitimate Interest)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Send service updates and notifications</li>
                  <li>Respond to support requests</li>
                  <li>Send marketing communications (with your consent - you can opt out)</li>
                  <li>Notify you of new features and improvements</li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  4.4 Security and Compliance (Legal Basis: Legal Obligation)
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>Detect and prevent fraud, abuse, and security incidents</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Comply with legal obligations and law enforcement requests</li>
                  <li>Maintain audit logs for security purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  5. Data Sharing and Disclosure
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We do not sell your personal data. We may share your information with:
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.1 Service Providers
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Supabase:</strong> Database and authentication services (GDPR compliant)
                  </li>
                  <li>
                    <strong>Anthropic Claude:</strong> AI-powered flavor extraction (data processed
                    securely)
                  </li>
                  <li>
                    <strong>Sentry:</strong> Error monitoring and performance tracking
                  </li>
                  <li>
                    <strong>Cloud Hosting:</strong> Vercel/Netlify for application hosting
                  </li>
                  <li>
                    <strong>Email Services:</strong> Transactional email delivery
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.2 Legal Requirements
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We may disclose your information if required by law, court order, or government
                  regulation, or to protect our rights, property, or safety.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.3 Business Transfers
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  In the event of a merger, acquisition, or sale of assets, your personal data may
                  be transferred. We will notify you of any such change.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
                  5.4 With Your Consent
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We may share your data with third parties when you explicitly consent (e.g.,
                  social sharing features).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  6. Data Retention
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We retain your personal data for as long as necessary to provide our services and
                  comply with legal obligations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Account Data:</strong> Retained while your account is active, then
                    deleted within 90 days of account deletion request
                  </li>
                  <li>
                    <strong>Tasting Data:</strong> Retained while your account is active, unless you
                    delete specific tasting sessions
                  </li>
                  <li>
                    <strong>Backup Data:</strong> Deleted from backups within 90 days of deletion
                    from production systems
                  </li>
                  <li>
                    <strong>Audit Logs:</strong> Security and access logs retained for 1 year for
                    compliance and security purposes
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> Anonymized usage data retained indefinitely for
                    service improvement
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  7. Your Rights (GDPR/CCPA)
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  You have the following rights regarding your personal data:
                </p>

                <div className="space-y-4">
                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Access
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Request a copy of all personal data we hold about you
                    </p>
                    <button
                      onClick={() => router.push('/settings?tab=privacy')}
                      className="mt-2 text-primary hover:text-primary/80 font-medium"
                    >
                      Export Your Data →
                    </button>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Rectification
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Correct inaccurate or incomplete personal data
                    </p>
                    <button
                      onClick={() => router.push('/settings')}
                      className="mt-2 text-primary hover:text-primary/80 font-medium"
                    >
                      Update Your Profile →
                    </button>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Erasure (Right to be Forgotten)
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Request deletion of your personal data
                    </p>
                    <button
                      onClick={() => router.push('/settings?tab=privacy')}
                      className="mt-2 text-primary hover:text-primary/80 font-medium"
                    >
                      Delete Your Account →
                    </button>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Data Portability
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Receive your data in a structured, machine-readable format (JSON)
                    </p>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Restriction of Processing
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Request that we limit how we use your data
                    </p>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Object
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Object to processing based on legitimate interests or for direct marketing
                    </p>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      Right to Withdraw Consent
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Withdraw consent at any time (does not affect lawfulness of prior processing)
                    </p>
                  </div>
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 mt-6">
                  To exercise any of these rights, contact us at{' '}
                  <a href="mailto:privacy@flavatix.com" className="text-primary hover:underline">
                    privacy@flavatix.com
                  </a>
                  . We will respond within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  8. Data Security
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We implement comprehensive security measures to protect your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>
                    <strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest
                    (AES-256)
                  </li>
                  <li>
                    <strong>Authentication:</strong> Multi-factor authentication available, OAuth
                    2.0 with JWT tokens
                  </li>
                  <li>
                    <strong>Access Control:</strong> Role-based access control (RBAC), principle of
                    least privilege
                  </li>
                  <li>
                    <strong>Password Security:</strong> Passwords hashed using bcrypt with salting
                    (never stored in plaintext)
                  </li>
                  <li>
                    <strong>CSRF Protection:</strong> Cross-Site Request Forgery protection on all
                    state-changing operations
                  </li>
                  <li>
                    <strong>Rate Limiting:</strong> API rate limiting to prevent abuse and DDoS
                    attacks
                  </li>
                  <li>
                    <strong>Security Headers:</strong> Content Security Policy (CSP), HSTS,
                    X-Frame-Options
                  </li>
                  <li>
                    <strong>Monitoring:</strong> Real-time security monitoring with Sentry for
                    incident detection
                  </li>
                  <li>
                    <strong>Auditing:</strong> Comprehensive audit logs for security-critical
                    operations
                  </li>
                  <li>
                    <strong>Penetration Testing:</strong> Regular security assessments and
                    vulnerability scans
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  Your data may be transferred to and processed in countries outside your country of
                  residence. We ensure adequate protection through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                  <li>EU Standard Contractual Clauses (SCCs) for transfers outside the EU/EEA</li>
                  <li>GDPR-compliant service providers with appropriate safeguards</li>
                  <li>Data Processing Agreements (DPAs) with all third-party processors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  10. Children&apos;s Privacy
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Flavatix is not intended for children under 16 years of age. We do not knowingly
                  collect personal data from children. If you believe we have collected data from a
                  child, please contact us immediately at privacy@flavatix.com, and we will delete
                  it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  11. Cookies and Tracking Technologies
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  We use cookies and similar tracking technologies. You can manage your cookie
                  preferences through our cookie consent banner. For detailed information, see our
                  Cookie Policy.
                </p>
                <button
                  onClick={() => router.push('/settings?tab=privacy')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Manage Cookie Preferences →
                </button>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  12. Third-Party Links
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Our service may contain links to third-party websites. We are not responsible for
                  the privacy practices of these sites. We encourage you to review their privacy
                  policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  13. Changes to This Policy
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300">
                  We may update this Privacy Policy periodically. We will notify you of material
                  changes via email or prominent notice on our platform. Continued use after changes
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  14. Supervisory Authority
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  If you are located in the EU/EEA, you have the right to lodge a complaint with
                  your local data protection authority if you believe your rights have been
                  violated.
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  For a list of EU data protection authorities, visit:{' '}
                  <a
                    href="https://edpb.europa.eu/about-edpb/board/members_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://edpb.europa.eu/about-edpb/board/members_en
                  </a>
                </p>
              </section>

              <section className="border-t border-zinc-200 dark:border-zinc-700 pt-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  15. Contact Us
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or
                  our data practices, please contact us:
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-700 p-6 rounded-lg">
                  <p className="text-zinc-900 dark:text-zinc-50 mb-2">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:privacy@flavatix.com" className="text-primary hover:underline">
                      privacy@flavatix.com
                    </a>
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-50 mb-2">
                    <strong>Data Protection Officer:</strong>{' '}
                    <a href="mailto:dpo@flavatix.com" className="text-primary hover:underline">
                      dpo@flavatix.com
                    </a>
                  </p>
                  <p className="text-zinc-900 dark:text-zinc-50">
                    <strong>Response Time:</strong> We will respond to all privacy requests within
                    30 days
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
