import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Hunter from './pages/Research';
import Script from './pages/Script';
import Trends from './pages/Trends';
import Competitors from './pages/Competitors';
import Scheduler from './pages/Scheduler';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import SavedContent from './pages/SavedContent';
import HelpCenter from './pages/HelpCenter';
import LandingPage from './pages/LandingPage';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading && location.pathname !== '/') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard/*"
        element={user ? <Layout /> : <Navigate to="/" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="hunter" element={<Hunter />} />
        <Route path="script" element={<Script />} />
        <Route path="trends" element={<Trends />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="scheduler" element={<Scheduler />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
        <Route path="saved" element={<SavedContent />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
