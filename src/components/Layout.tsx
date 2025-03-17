import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  Bookmark,
  HelpCircle,
  Loader2,
  Calendar,
  Pencil
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Compass, label: 'Hunter AI', path: '/dashboard/hunter' },
  { icon: Pencil, label: 'Script AI', path: '/dashboard/script' },
  { icon: TrendingUp, label: 'Trends', path: '/dashboard/trends' },
  { icon: Users, label: 'Competitors', path: '/dashboard/competitors' },
  { icon: Calendar, label: 'Scheduler', path: '/dashboard/scheduler' },
  { icon: Bell, label: 'Alerts', path: '/dashboard/alerts' },
  { icon: Bookmark, label: 'Saved', path: '/dashboard/saved' },
  { icon: HelpCircle, label: 'Help', path: '/dashboard/help' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
];

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await signOut();
      // Redirect is handled in AuthContext
    } catch (error) {
      console.error('Failed to log out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex flex-1">
        {/* Mobile header with centered menu button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 z-40 flex items-center justify-between px-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            <span className="text-lg font-bold">OnlyViral AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center bg-gray-700 p-2 rounded-lg touch-manipulation w-10 h-10"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={clsx(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:mt-0 mt-16" // Add top margin on mobile to account for header
        )}>
          <div className="p-4 hidden lg:block">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <span className="text-lg sm:text-xl font-bold">OnlyViral AI</span>
            </Link>
          </div>
          
          <nav className="flex-1 mt-2 lg:mt-8 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-3 text-sm font-medium min-h-[44px]',
                    location.pathname === item.path
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center space-x-2 w-full text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>Log Out</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen pt-16 lg:pt-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
