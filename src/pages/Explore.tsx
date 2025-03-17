import React from 'react';
import ExploreSection from '../components/ExploreSection';

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore Trends</h1>
          <p className="text-gray-400 mt-2">Discover trending content across social platforms</p>
        </div>
      </div>

      <ExploreSection />
    </div>
  );
}
