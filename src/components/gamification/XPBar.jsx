import React from 'react';
import { Trophy, Star } from 'lucide-react';

export default function XPBar({ xp, level, xpToNextLevel, className = '' }) {
  const progressPercentage = (xp / xpToNextLevel) * 100;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-purple-200 dark:border-gray-700 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">Level {level}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {xp}/{xpToNextLevel} XP
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
      </div>
    </div>
  );
}
