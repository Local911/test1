import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-purple-500" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl text-gray-300 mb-6">Page Not Found</h2>
          
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
