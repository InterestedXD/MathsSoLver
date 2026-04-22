import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import Flashcard from '../components/flashcards/Flashcard';

const Flashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [responses, setResponses] = useState([]);

  // Mock data - replace with API
  const flashcards = [
    { question: "What is the derivative of x²?", answer: "2x (Power Rule)" },
    { question: "Solve 2x + 5 = 11", answer: "x = 3" },
    { question: "sin²θ + cos²θ = ?", answer: "1 (Pythagorean Identity)" },
    { question: "Integral of x dx", answer: "(1/2)x² + C" },
    { question: "Factor x² - 9", answer: "(x - 3)(x + 3)" },
    { question: "What is tan(θ)?", answer: "sin(θ)/cos(θ)" },
    { question: "Quadratic formula", answer: "x = [-b ± √(b² - 4ac)] / 2a" },
    { question: "d/dx [sin(x)]", answer: "cos(x)" },
    { question: "Area of circle", answer: "πr²" },
    { question: "Pythagoras", answer: "a² + b² = c²" }
  ];

  const totalCards = flashcards.length;

  const flipCard = useCallback(() => {
    setFlipped(!flipped);
  }, [flipped]);

  const recordConfidence = useCallback((confidence) => {
    const newResponses = [...responses];
    newResponses[currentIndex] = confidence;
    setResponses(newResponses);
    setFlipped(false);
    // Auto next after short delay
    setTimeout(() => {
      if (currentIndex < totalCards - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 800);
  }, [currentIndex, responses, totalCards]);

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const goNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrevious();
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, flipped]);

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Flashcards
          </h1>
          <div className="text-2xl font-semibold text-gray-700 mb-2">
            {currentIndex + 1} / {totalCards}
          </div>
          <div className="text-sm text-gray-500">
            Space to flip | Arrows to navigate
          </div>
        </div>

        {/* Card Container */}
        <div className="flex justify-center mb-12">
          <Flashcard 
            question={currentCard.question}
            answer={currentCard.answer}
            flipped={flipped}
            onFlip={flipCard}
          />
        </div>

        {/* Confidence Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Button
            onClick={() => recordConfidence('easy')}
            className="flex-1 max-w-xs bg-emerald-500 hover:bg-emerald-600 text-lg py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
          >
            Easy 😎
          </Button>
          <Button
            onClick={() => recordConfidence('medium')}
            className="flex-1 max-w-xs bg-amber-500 hover:bg-amber-600 text-lg py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
          >
            Medium 🙂
          </Button>
          <Button
            onClick={() => recordConfidence('hard')}
            className="flex-1 max-w-xs bg-rose-500 hover:bg-rose-600 text-lg py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
          >
            Hard 😓
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="px-8 py-3 rounded-xl"
          >
            ← Previous
          </Button>
          <Button
            variant="outline"
            onClick={goNext}
            disabled={currentIndex === totalCards - 1}
            className="px-8 py-3 rounded-xl"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;

