import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold text-white">OnlyViral AI</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              AI-powered social media trend analysis and content optimization platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dashboard/explore" className="text-gray-400 hover:text-white transition-colors">
                  Explore Trends
                </Link>
              </li>
              <li>
                <Link to="/dashboard/competitors" className="text-gray-400 hover:text-white transition-colors">
                  Competitor Analysis
                </Link>
              </li>
              <li>
                <Link to="/dashboard/alerts" className="text-gray-400 hover:text-white transition-colors">
                  Trend Alerts
                </Link>
              </li>
              <li>
                <Link to="/dashboard/scheduler" className="text-gray-400 hover:text-white transition-colors">
                  Post Scheduler
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-gray-400 hover:text-white transition-colors">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} OnlyViral AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
