import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last Updated: October 31, 2025</p>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                FireGuard Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Information We Collect</h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <h3 className="text-xl font-semibold text-white">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Information:</strong> Email address, password, and profile details</li>
                  <li><strong>Project Data:</strong> Projects, tasks, documents, and related information you create</li>
                  <li><strong>Time Tracking Data:</strong> Time logs and activity records</li>
                  <li><strong>Communication Data:</strong> Messages and interactions within the application</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-4">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
                  <li><strong>Log Data:</strong> IP addresses, access times, and error logs</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Detect, prevent, and address technical issues and security threats</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Data Storage and Security</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>
                  Your data is stored securely using Supabase, which provides enterprise-grade security:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Data encryption in transit (TLS/SSL)</li>
                  <li>Data encryption at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Secure authentication and authorization</li>
                  <li>Automated backups</li>
                </ul>
                <p className="mt-2">
                  While we implement industry-standard security measures, no method of transmission or storage is 100% secure.
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Data Sharing and Disclosure</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                  <li><strong>Team Members:</strong> With other users in your organization as needed for collaboration</li>
                  <li><strong>Service Providers:</strong> With third-party service providers who assist in operating our service (e.g., hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Your Data Rights</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">You have the following rights regarding your data:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Export:</strong> Export your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to certain processing of your data</li>
                  <li><strong>Restriction:</strong> Request restriction of data processing</li>
                </ul>
                <p className="mt-2">
                  To exercise these rights, please contact us through the application support system.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services.
                When you delete your account, we will delete or anonymize your personal information within 30 days,
                except where we are required to retain it for legal or legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Cookies and Tracking</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze usage patterns and improve our service</li>
                </ul>
                <p>
                  You can control cookies through your browser settings, but disabling cookies may affect functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service uses third-party services for hosting, authentication, and data storage (Supabase/PostgreSQL).
                These services have their own privacy policies and security measures. We carefully select providers that
                maintain high security and privacy standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that
                appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service is not intended for users under 18 years of age. We do not knowingly collect information
                from children. If you become aware that a child has provided us with personal information, please
                contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Changes to Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you
                to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us through
                the application support system. We will respond to your inquiry within a reasonable timeframe.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Your Privacy Matters:</strong> We are committed to transparency and
                protecting your data. If you have any concerns about how we handle your information, please reach out to us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
