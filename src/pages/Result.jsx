import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <div className="p-8">No quiz data found</div>;
  }

  const { score, correct, total, xpEarned } = state;
  const weakArea = score < 0.6 ? 'algebra basics' : 'practice more problems';

  const handleNextStep = () => {
    navigate('/dashboard');  // Or flashcards/solver
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
        <div className="text-6xl font-black text-blue-600 mb-4">
          {correct}/{total}
        </div>
        <p className="text-2xl text-gray-600 mb-8">
          Score: {Math.round(score * 100)}%
        </p>
        
        <div className="bg-green-100 p-6 rounded-xl mb-8">
          <p className="text-xl font-semibold">+{xpEarned} XP Earned!</p>
        </div>
      </div>

      <div className="bg-yellow-50 p-8 rounded-xl mb-8">
        <h3 className="font-semibold text-lg mb-2">Next Step:</h3>
        <p>Focus on {weakArea}</p>
      </div>

      <Button 
        onClick={handleNextStep}
        className="w-full text-xl py-6 bg-gradient-to-r from-green-500 to-emerald-500"
      >
        Practice Weak Area
      </Button>
    </div>
  );
};

export default Result;

