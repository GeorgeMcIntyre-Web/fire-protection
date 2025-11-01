import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export const TermsPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last Updated: October 31, 2025</p>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using FireGuard Pro ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed">
                FireGuard Pro provides project management tools specifically designed for fire protection professionals,
                including but not limited to project tracking, task management, document storage, time tracking, and budget monitoring.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. User Accounts</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Acceptable Use</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. User Content</h2>
              <div className="text-gray-300 leading-relaxed space-y-2">
                <p>
                  You retain all rights to the content you upload to the Service. By uploading content, you grant us a license
                  to store, process, and display your content solely for the purpose of providing the Service to you.
                </p>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ensuring you have the right to upload and share your content</li>
                  <li>Backing up your important data</li>
                  <li>The accuracy and legality of your content</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Data Security and Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                We take data security seriously and implement industry-standard security measures. However, no method of
                transmission over the Internet is 100% secure. Please review our{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>{' '}
                for details on how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Service Availability</h2>
              <p className="text-gray-300 leading-relaxed">
                We strive to provide reliable service but do not guarantee uninterrupted access. We may modify, suspend,
                or discontinue the Service at any time with or without notice. We are not liable for any modification,
                suspension, or discontinuation of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                The Service and its original content, features, and functionality are owned by FireGuard Pro and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, FireGuard Pro shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly
                or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or
                liability, for any reason, including breach of these Terms. Upon termination, your right to use the
                Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by
                posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service
                after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">13. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us through the application support system.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Note:</strong> By using FireGuard Pro, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
