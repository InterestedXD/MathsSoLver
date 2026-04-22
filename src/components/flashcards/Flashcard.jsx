import React from 'react';

const Flashcard = ({ question, answer, flipped, onFlip }) => {
  return (
    <div 
      className="relative w-full max-w-md mx-auto perspective-1000"
      onClick={onFlip}
    >
      <div className="relative h-64 w-full transform-style-preserve-3d transition-transform duration-700 hover:scale-105 cursor-pointer group">
        {/* Front */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center p-8 text-white text-xl font-semibold text-center backface-hidden transform rotate-y-0 ${flipped ? 'invisible opacity-0' : 'visible opacity-100'}`}>
          {question}
        </div>
        
        {/* Back */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-indigo-500 rounded-2xl shadow-2xl flex items-center justify-center p-8 text-white text-lg leading-relaxed backface-hidden transform rotate-y-180 ${flipped ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          <div>{answer}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

