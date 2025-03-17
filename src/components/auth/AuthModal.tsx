import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: boolean; // true for sign in, false for sign up
}

const niches = [
  'comedy',
  'dance',
  'fashion',
  'food',
  'beauty',
  'fitness',
  'education',
  'lifestyle',
  'travel',
  'gaming',
  'other'
];

export default function AuthModal({ isOpen, onClose, defaultMode = true }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(defaultMode);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [subNiche, setSubNiche] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  useEffect(() => {
    setIsSignIn(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setFullName('');
      setSelectedNiche('');
      setCustomNiche('');
      setSubNiche('');
      setShowPassword(false);
      setIsLoading(false);
      setIsForgotPassword(false);
      setAcceptedTerms(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setFullName('');
      setSelectedNiche('');
      setCustomNiche('');
      setSubNiche('');
      setShowPassword(false);
      setIsForgotPassword(false);
      onClose();
    }
  };

  const validateInput = () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!isForgotPassword && !password.trim()) {
      setError('Please enter your password');
      return false;
    }
    if (!isForgotPassword && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!isSignIn && !fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!isSignIn && !selectedNiche) {
      setError('Please select your primary niche');
      return false;
    }
    if (!isSignIn && selectedNiche === 'other' && !customNiche.trim()) {
      setError('Please enter your custom niche');
      return false;
    }
    if (!isSignIn && !acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateInput()) return;

    setIsLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setEmail('');
      } else if (isSignIn) {
        await signIn(email, password);
        handleClose();
      } else {
        const finalNiche = selectedNiche === 'other' ? customNiche : selectedNiche;
        await signUp(email, password, fullName, finalNiche, subNiche);
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        setIsSignIn(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setIsForgotPassword(false);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setFullName('');
    setSelectedNiche('');
    setCustomNiche('');
    setSubNiche('');
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isForgotPassword 
              ? 'Reset Password'
              : isSignIn 
                ? 'Sign In' 
                : 'Create Account'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
            disabled={isLoading}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-2 rounded mb-4">
            {successMessage}
          </div>
        )}

        {!isForgotPassword && (
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        {!isForgotPassword && (
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && !isForgotPassword && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={isLoading}
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!isSignIn && (
                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          )}

          {!isSignIn && !isForgotPassword && (
            <>
              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-gray-300 mb-1">
                  Primary Niche
                </label>
                <select
                  id="niche"
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select your niche</option>
                  {niches.map(niche => (
                    <option key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </option>
                  ))}
                </select>

                {selectedNiche === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customNiche}
                      onChange={(e) => setCustomNiche(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your custom niche"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="subNiche" className="block text-sm font-medium text-gray-300 mb-1">
                  Sub-niche (Optional)
                </label>
                <input
                  id="subNiche"
                  type="text"
                  value={subNiche}
                  onChange={(e) => setSubNiche(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your sub-niche"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Specify a more focused area within your primary niche
                </p>
              </div>

              <div className="space-y-2">
                <label className="relative flex items-start cursor-pointer group">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-purple-600 rounded border-gray-500 bg-gray-700 
                             focus:ring-offset-gray-800 focus:ring-2 focus:ring-purple-500 
                             transition-colors cursor-pointer
                             checked:bg-purple-600 checked:border-purple-600
                             hover:border-purple-400"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                      I accept the{' '}
                      <Link
                        to="/terms"
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                        <LinkIcon className="h-3 w-3 ml-1" />
                      </Link>
                      {' '}and{' '}
                      <Link
                        to="/privacy"
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                        <LinkIcon className="h-3 w-3 ml-1" />
                      </Link>
                    </span>
                  </div>
                </label>
              </div>
            </>
          )}

          {isSignIn && !isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-purple-400 hover:text-purple-300 text-sm"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading || (!isSignIn && !acceptedTerms)}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </span>
            ) : (
              isForgotPassword 
                ? 'Send Reset Instructions'
                : isSignIn 
                  ? 'Sign In' 
                  : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-purple-400 hover:text-purple-300 text-sm"
              disabled={isLoading}
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={toggleMode}
              className="text-purple-400 hover:text-purple-300 text-sm"
              disabled={isLoading}
            >
              {isSignIn ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
