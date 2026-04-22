import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LevelUpModal({ level, onClose }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 border-2 border-purple-200 dark:border-gray-700 shadow-2xl">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
              Level Up!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Congratulations! You've reached Level {level}!
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                New Level Unlocked
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep solving problems to earn more XP and unlock higher levels!
            </p>
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
          >
            Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
}
