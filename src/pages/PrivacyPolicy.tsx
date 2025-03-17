import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-10 w-10 text-purple-500 mr-3" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            Welcome to OnlyViral AI. This Privacy Policy explains how OnlyViral AI ("<strong>we</strong>," "<strong>our</strong>," or "<strong>us</strong>") collects, uses, and protects your personal information when you use our platform or services ("<strong>OnlyViral AI</strong>" or the "<strong>Service</strong>"). We value your privacy and are committed to handling your personal data transparently and securely.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data Collection</h2>
          <p className="text-gray-300">
            OnlyViral AI collects certain information from you to provide and improve our services. The types of data we collect include:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li><strong>Personal Information:</strong> Information that identifies you, such as your name and email address.</li>
            <li><strong>User-Generated Content:</strong> Any content you input into the OnlyViral AI platform.</li>
            <li><strong>Usage Data:</strong> Information about how you use OnlyViral AI.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data Processing and Storage</h2>
          <p className="text-gray-300">
            OnlyViral AI uses the information you provide to operate and enhance our services. Your user-generated content is processed by our AI systems to generate responses or perform the functions you request.
          </p>
          <p className="text-gray-300">
            We store user-generated content and related data on our secure servers for a limited duration of <strong>30 days</strong> from the date of submission.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Third-Party Sharing</h2>
          <p className="text-gray-300">
            OnlyViral AI does <strong>not</strong> share, sell, rent, or disclose your personal data or user-generated content to any third-party services, advertisers, or partners.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Security Measures</h2>
          <p className="text-gray-300">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Data encryption in transit and at rest</li>
            <li>Strict access controls and authentication</li>
            <li>Regular security audits and monitoring</li>
            <li>Secure data centers and infrastructure</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact Information</h2>
          <p className="text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@onlyviral.ai" className="text-purple-400 hover:text-purple-300">
              privacy@onlyviral.ai
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
