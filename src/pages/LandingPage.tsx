import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ChevronRight,
  CheckCircle2,
  LogIn,
  LogOut,
  Search,
  Bell,
  LineChart,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsSignIn(false);
      setShowAuthModal(true);
    }
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  const handleLogin = () => {
    setIsSignIn(true);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const testimonials = [
    {
      quote: 'OnlyViral AI helped me increase my reach by 200% in just two months!',
      author: 'Sarah Johnson',
      role: 'Lifestyle Creator'
    },
    {
      quote: 'The trend predictions are incredibly accurate. It\'s like having a crystal ball for social media.',
      author: 'Mike Chen',
      role: 'Tech Influencer'
    },
    {
      quote: 'This tool has completely transformed how I plan my content strategy.',
      author: 'Emma Davis',
      role: 'Fashion Blogger'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      <div className="flex-1">
        <header className="relative overflow-hidden">
          <nav className="absolute top-0 w-full z-50 px-4 sm:px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <span className="text-xl sm:text-2xl font-bold text-white ml-2 whitespace-nowrap">OnlyViral AI</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                {user ? (
                  <>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center text-white hover:text-purple-400 transition-colors px-2 sm:px-3"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline ml-2">Logout</span>
                    </button>
                    <button 
                      onClick={handleDashboardClick}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-6 py-2 rounded-full font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Dashboard
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleLogin}
                      className="flex items-center text-white hover:text-purple-400 transition-colors px-2 sm:px-3"
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="hidden sm:inline ml-2">Login</span>
                    </button>
                    <button 
                      onClick={handleGetStarted}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-6 py-2 rounded-full font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
                Spot Tomorrow's Trends
                <span className="text-purple-500"> Today</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Harness the power of AI to predict viral trends, analyze competitors, and generate winning content ideas across all major social platforms.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={user ? handleDashboardClick : handleGetStarted}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-lg transition-colors flex items-center justify-center"
                >
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                <button className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium text-lg transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2070&q=80')] opacity-10 bg-cover bg-center" />
        </header>

        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Powerful AI-Driven Features</h2>
              <p className="text-gray-400 text-xl">Everything you need to stay ahead of the curve</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
                  title: 'Trend Prediction',
                  description: 'Identify emerging trends before they go viral using advanced AI algorithms.'
                },
                {
                  icon: <Bell className="h-8 w-8 text-purple-500" />,
                  title: 'Real-time Alerts',
                  description: 'Get instant notifications about trending topics in your niche.'
                },
                {
                  icon: <LineChart className="h-8 w-8 text-purple-500" />,
                  title: 'Performance Analytics',
                  description: 'Track and analyze your content performance across all platforms.'
                },
                {
                  icon: <Users className="h-8 w-8 text-purple-500" />,
                  title: 'Competitor Analysis',
                  description: 'Monitor competitors and identify content opportunities they\'ve missed.'
                },
                {
                  icon: <Zap className="h-8 w-8 text-purple-500" />,
                  title: 'Algorithm Updates',
                  description: 'Stay informed about platform algorithm changes affecting your content.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-800 p-6 sm:p-8 rounded-2xl hover:bg-gray-700 transition-colors">
                  <div className="bg-gray-900 p-3 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 bg-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-12">Trusted by Content Creators</h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-800 p-6 sm:p-8 rounded-2xl">
                  <p className="text-gray-300 mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-purple-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Content Strategy?</h2>
            <p className="text-xl text-gray-300 mb-8">Join thousands of creators who are already using OnlyViral AI to stay ahead of the curve.</p>
            <div className="space-y-4">
              <button 
                onClick={user ? handleDashboardClick : handleGetStarted}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors"
              >
                {user ? 'Go to Dashboard' : 'Get Started Now'}
              </button>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-400">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={isSignIn}
      />
    </div>
  );
}
