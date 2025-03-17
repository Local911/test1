import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center mb-8">
          <FileText className="h-10 w-10 text-purple-500 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Welcome to OnlyViral AI. By accessing or using our platform, you agree to be bound by these Terms of Service ("<strong>Terms</strong>"). Please read these Terms carefully before using OnlyViral AI.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing or using OnlyViral AI, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use OnlyViral AI.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Use of Service</h2>
          <p className="text-gray-300">
            You agree to use OnlyViral AI only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Use OnlyViral AI in any way that violates any applicable laws or regulations</li>
            <li>Attempt to interfere with or disrupt OnlyViral AI's systems or networks</li>
            <li>Use OnlyViral AI to transmit any malicious code or malware</li>
            <li>Attempt to gain unauthorized access to any part of OnlyViral AI</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Account Registration</h2>
          <p className="text-gray-300">
            To use certain features of OnlyViral AI, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Intellectual Property</h2>
          <p className="text-gray-300">
            OnlyViral AI and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-gray-300">
            OnlyViral AI is provided "as is" without any warranties, expressed or implied. We do not warrant that OnlyViral AI will be error-free or uninterrupted.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Contact Information</h2>
          <p className="text-gray-300">
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@onlyviral.ai" className="text-purple-400 hover:text-purple-300">
              legal@onlyviral.ai
            </a>
          </p>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last updated: March 17, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
