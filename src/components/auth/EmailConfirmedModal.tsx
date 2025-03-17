import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface EmailConfirmedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailConfirmedModal({ isOpen, onClose }: EmailConfirmedModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full m-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Email Confirmed!</h2>
          <p className="text-gray-300 mb-6">
            Thank you for confirming your email address. Your account is now fully activated.
          </p>
          <button
            onClick={handleDashboard}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
