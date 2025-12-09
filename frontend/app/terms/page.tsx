"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, FileText, Shield, Users, AlertCircle, Scale, Ban } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen w-full bg-page-gradient">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
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
          className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Registration
        </Link>

        {/* Page Header */}
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 px-6 sm:px-12 py-8 sm:py-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Terms of Service</h1>
                <p className="text-green-50 mt-2">Last Updated: December 7, 2025</p>
              </div>
            </div>
            <p className="text-lg text-green-50">
              Please read these terms carefully before using MicroLearning
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="p-6 sm:p-8 bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20">
            <h2 className="font-bold text-foreground mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <a href="#acceptance" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">1. Acceptance of Terms</a>
              <a href="#eligibility" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">2. Eligibility</a>
              <a href="#account" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">3. User Accounts</a>
              <a href="#conduct" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">4. User Conduct</a>
              <a href="#content" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">5. Content & Intellectual Property</a>
              <a href="#termination" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline">6. Termination</a>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border border-border/50 p-6 sm:p-12 space-y-8">
          {/* Section 1 */}
          <section id="acceptance">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <p>
                By accessing and using MicroLearning ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Section 2 */}
          <section id="eligibility">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">2. Eligibility</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <p>
                You must be at least 13 years old to use MicroLearning. If you are under 18, you must have permission from a parent or guardian.
              </p>
              <p>
                By creating an account, you represent that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You meet the age requirement</li>
                <li>All information you provide is accurate and complete</li>
                <li>You will maintain the accuracy of your information</li>
                <li>You are legally capable of entering into binding contracts</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Section 3 */}
          <section id="account">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">3. User Accounts</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use a strong, unique password</li>
                <li>Not share your account with others</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-6">Account Termination</h3>
              <p>
                You may delete your account at any time through your account settings. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Section 4 */}
          <section id="conduct">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">4. User Conduct</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <p>
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post harmful, threatening, abusive, or harassing content</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Use the Platform for commercial purposes without permission</li>
                <li>Impersonate others or misrepresent your affiliation</li>
                <li>Spam or send unsolicited messages to other users</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Section 5 */}
          <section id="content">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">5. Content & Intellectual Property</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <h3 className="font-semibold text-foreground">Platform Content</h3>
              <p>
                All content on MicroLearning, including courses, lessons, videos, text, graphics, logos, and software, is owned by MicroLearning or its content suppliers and is protected by intellectual property laws.
              </p>

              <h3 className="font-semibold text-foreground mt-6">User-Generated Content</h3>
              <p>
                By posting content on MicroLearning, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on the Platform.
              </p>
              <p>
                You retain ownership of your content and are responsible for ensuring you have the rights to share it.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Section 6 */}
          <section id="termination">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">6. Termination</h2>
              </div>
            </div>
            <div className="pl-16 space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate your access to MicroLearning at any time, with or without notice, for conduct that we believe:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violates these Terms of Service</li>
                <li>Harms other users or the Platform</li>
                <li>Exposes us to legal liability</li>
                <li>Is fraudulent or illegal</li>
              </ul>
            </div>
          </section>

          <div className="border-t border-border"></div>

          {/* Additional Sections */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                MicroLearning is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Platform.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Changes to Service</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without notice.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Governing Law</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These Terms of Service are governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate courts.
              </p>
            </div>
          </section>

          <div className="border-t border-border"></div>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
                <p className="font-semibold text-foreground">MicroLearning Support</p>
                <p>Email: <a href="mailto:legal@microlearning.com" className="text-green-600 dark:text-green-400 hover:underline">legal@microlearning.com</a></p>
                <p>Support: <a href="mailto:support@microlearning.com" className="text-green-600 dark:text-green-400 hover:underline">support@microlearning.com</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link
            href="/privacy"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium hover:underline"
          >
            View Privacy Policy →
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
