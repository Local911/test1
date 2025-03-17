import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TrendData } from '../types';

interface TrendCardProps {
  trend: TrendData;
}

export default function TrendCard({ trend }: TrendCardProps) {
  const isPositive = trend.growth_rate > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 hover:bg-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{trend.keyword}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{trend.platform}</p>
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />}
          <span className="ml-1 text-sm sm:text-base font-medium">{Math.abs(trend.growth_rate)}%</span>
        </div>
      </div>
      
      <div className="mt-3 sm:mt-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Volume</span>
          <span className="text-white font-medium">{trend.volume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm mt-2">
          <span className="text-gray-400">Sentiment</span>
          <span className="text-white font-medium">{trend.sentiment_score.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
        <p className="text-xs sm:text-sm text-gray-400">
          Updated {formatDistanceToNow(new Date(trend.timestamp))} ago
        </p>
      </div>
    </div>
  );
}
