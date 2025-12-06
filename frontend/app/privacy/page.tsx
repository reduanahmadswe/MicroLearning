"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, Lock, Eye, Database, Shield, Cookie, UserCheck, Bell, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
                MicroLearning
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link 
          href="/auth/register" 
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Registration
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 px-6 sm:px-12 py-8 sm:py-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
                <p className="text-green-50 mt-2">Last Updated: December 7, 2025</p>
              </div>
            </div>
            <p className="text-lg text-green-50">
              Your privacy is important to us. Learn how we protect your data.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="p-6 sm:p-8 bg-green-50 border-b border-green-100">
            <h2 className="font-bold text-gray-800 mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <a href="#collection" className="text-sm text-green-600 hover:text-green-700 hover:underline">1. Information Collection</a>
              <a href="#usage" className="text-sm text-green-600 hover:text-green-700 hover:underline">2. How We Use Your Data</a>
              <a href="#sharing" className="text-sm text-green-600 hover:text-green-700 hover:underline">3. Information Sharing</a>
              <a href="#security" className="text-sm text-green-600 hover:text-green-700 hover:underline">4. Data Security</a>
              <a href="#cookies" className="text-sm text-green-600 hover:text-green-700 hover:underline">5. Cookies & Tracking</a>
              <a href="#rights" className="text-sm text-green-600 hover:text-green-700 hover:underline">6. Your Rights</a>
            </div>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-xl mb-8">
              <p className="text-gray-700">
                At <strong className="text-gray-900">MicroLearning</strong>, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding your data when you use our platform.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section id="collection">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">1. Information We Collect</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <h3 className="font-semibold text-gray-800">Information You Provide</h3>
              <p>
                When you create an account or use MicroLearning, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, password</li>
                <li><strong>Profile Information:</strong> Profile picture, bio, learning preferences</li>
                <li><strong>Learning Data:</strong> Course enrollments, progress, quiz scores, certificates earned</li>
                <li><strong>User Content:</strong> Forum posts, comments, questions, and uploaded files</li>
                <li><strong>Payment Information:</strong> Billing details for premium features (processed securely)</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800 mt-6">Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, features used, click patterns</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                <li><strong>Performance Data:</strong> App crashes, errors, and diagnostic information</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 2 */}
          <section id="usage">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">2. How We Use Your Information</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide Services:</strong> Deliver courses, track progress, issue certificates</li>
                <li><strong>Personalization:</strong> Recommend courses, customize learning paths with AI</li>
                <li><strong>Communication:</strong> Send notifications, updates, and educational content</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to enhance the platform</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, and protect user accounts</li>
                <li><strong>Support:</strong> Respond to questions, troubleshoot issues, provide assistance</li>
                <li><strong>Legal Compliance:</strong> Meet legal obligations and enforce our terms</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 3 */}
          <section id="sharing">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">3. Information Sharing</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                We do NOT sell your personal information. We may share data with:
              </p>
              
              <h3 className="font-semibold text-gray-800 mt-4">Service Providers</h3>
              <p>
                Third-party vendors who help us operate the platform (e.g., hosting, email, payment processing). They are contractually obligated to protect your data.
              </p>
              
              <h3 className="font-semibold text-gray-800 mt-4">Other Users</h3>
              <p>
                Your profile information, posts, and comments are visible to other users as part of the community features.
              </p>
              
              <h3 className="font-semibold text-gray-800 mt-4">Legal Requirements</h3>
              <p>
                We may disclose information when required by law or to protect rights, safety, and property.
              </p>
              
              <h3 className="font-semibold text-gray-800 mt-4">Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale, your information may be transferred to the new entity.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 4 */}
          <section id="security">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">4. Data Security</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS/TLS) and at rest</li>
                <li><strong>Access Controls:</strong> Limited employee access on a need-to-know basis</li>
                <li><strong>Authentication:</strong> Secure password hashing and optional two-factor authentication</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and vulnerability assessments</li>
                <li><strong>Backups:</strong> Regular data backups to prevent data loss</li>
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> No security system is 100% secure. We cannot guarantee absolute security, but we continuously work to improve our protections.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 5 */}
          <section id="cookies">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">5. Cookies & Tracking Technologies</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for login, security, and core functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant content and measure campaign effectiveness</li>
              </ul>
              <p className="mt-4">
                You can control cookie preferences through your browser settings. Note that disabling cookies may limit platform functionality.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 6 */}
          <section id="rights">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">6. Your Privacy Rights</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@microlearning.com" className="text-green-600 hover:underline font-medium">privacy@microlearning.com</a>
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 7 */}
          <section>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">7. Children's Privacy</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-gray-600">
              <p>
                MicroLearning is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
              <p>
                Users under 18 should have parental consent before using the platform.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Data Retention</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Legal compliance and regulatory requirements</li>
                <li>Dispute resolution and enforcement of agreements</li>
                <li>Fraud prevention and security purposes</li>
              </ul>
              <p>
                Anonymized data may be retained indefinitely for analytics and research.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. International Data Transfers</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
                <p className="font-semibold text-gray-800">MicroLearning Privacy Team</p>
                <p>Email: <a href="mailto:privacy@microlearning.com" className="text-green-600 hover:underline">privacy@microlearning.com</a></p>
                <p>Support: <a href="mailto:support@microlearning.com" className="text-green-600 hover:underline">support@microlearning.com</a></p>
                <p className="mt-3 text-sm text-gray-600">
                  We aim to respond to all privacy inquiries within 30 days.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link 
            href="/terms" 
            className="text-green-600 hover:text-green-700 font-medium hover:underline"
          >
            View Terms of Service →
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-xl hover:scale-105 transition-all"
          >
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
