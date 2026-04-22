import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2, History, Trash2, Download, Calculator } from 'lucide-react';
import CalculatorDisplay from './CalculatorDisplay';
import { useDarkMode } from '../contexts/DarkModeContext';

const CalculatorPopup = ({ isOpen, onClose, onMinimize }) => {
  const { isDarkMode } = useDarkMode();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState(isDarkMode ? 'dark' : 'light'); // light, dark, compact
  const nodeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const savedPosition = localStorage.getItem('calculatorPosition');
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    localStorage.setItem('calculatorPosition', JSON.stringify(newPosition));
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  const toggleMode = () => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'compact';
      return 'light';
    });
  };

  const getModeClasses = () => {
    switch (mode) {
      case 'dark':
        return 'bg-gradient-to-br from-black via-slate-900 to-gray-900 text-white border-slate-700';
      case 'compact':
        return 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 text-white border-slate-700 scale-75';
      default:
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-gray-900 border-slate-300';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        <Draggable
          nodeRef={nodeRef}
          handle=".drag-handle"
          position={position}
          onStop={handleDragStop}
          bounds="parent"
        >
          <div
            ref={nodeRef}
            className={`pointer-events-auto ${getModeClasses()} backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 ${
              isMinimized ? 'w-96 h-16' : 'w-96 min-h-[700px] max-h-[80vh]'
            }`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Header */}
            <div className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-sm">Scientific Calculator</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMode}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={`Switch to ${mode === 'light' ? 'dark' : mode === 'dark' ? 'compact' : 'light'} mode`}
                >
                  {mode === 'light' ? '🌙' : mode === 'dark' ? '🔸' : '☀️'}
                </button>
                <button
                  onClick={handleMinimize}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="p-4">
                <CalculatorDisplay mode={mode} />
              </div>
            )}

            {/* Minimized State */}
            {isMinimized && (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center">
                  <Calculator className="w-6 h-6 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Calculator minimized</span>
                </div>
              </div>
            )}
          </div>
        </Draggable>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalculatorPopup;
