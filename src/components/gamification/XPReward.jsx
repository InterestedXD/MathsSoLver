import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function XPReward({ xp, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Random position for floating effect
    setPosition({
      x: Math.random() * 200 - 100, // -100 to 100
      y: Math.random() * 200 - 100, // -100 to 100
    });

    // Auto-hide after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none animate-bounce"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-300 flex items-center gap-2 animate-pulse">
        <Star className="w-4 h-4 fill-current" />
        <span className="font-bold text-sm">+{xp} XP</span>
      </div>
    </div>
  );
}
