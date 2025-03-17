import React from 'react';
import ExploreSection from '../components/ExploreSection';

export default function Hunter() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hunter AI</h1>
          <p className="text-gray-400 mt-2">Discover and analyze trending content across platforms</p>
        </div>
      </div>

      <ExploreSection />
    </div>
  );
}
