import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

const FloatingCalcButton = ({ onToggle, isOpen }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 right-6 z-[10000] w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isOpen
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-purple-500/50'
          : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-gray-300 dark:shadow-gray-700 hover:shadow-xl'
      }`}
      aria-label="Toggle Calculator"
    >
      <Calculator className="w-6 h-6 mx-auto" />
    </button>
  );
};

export default FloatingCalcButton;
