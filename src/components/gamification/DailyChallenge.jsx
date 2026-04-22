import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, Clock, Star } from 'lucide-react';
import XPReward from './XPReward';

export default function DailyChallenge({ onComplete }) {
  const [challenge, setChallenge] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showXPReward, setShowXPReward] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock daily challenge data
  const mockChallenge = {
    title: "Daily Math Challenge",
    description: "Complete 3 random questions to earn bonus XP!",
    questions: [
      {
        question: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        correctAnswer: 2
      },
      {
        question: "Solve: 3x + 5 = 17",
        options: ["x = 4", "x = 6", "x = 8", "x = 12"],
        correctAnswer: 0
      },
      {
        question: "What is the area of a circle with radius 3?",
        options: ["6π", "9π", "12π", "18π"],
        correctAnswer: 1
      }
    ]
  };

  useEffect(() => {
    // Load challenge from localStorage or generate new one
    const today = new Date().toDateString();
    const storedChallenge = localStorage.getItem('dailyChallenge');
    const storedDate = localStorage.getItem('dailyChallengeDate');
    const storedCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';

    if (storedDate === today && storedChallenge) {
      const parsedChallenge = JSON.parse(storedChallenge);
      setChallenge(parsedChallenge);
      setCompleted(storedCompleted);
    } else {
      // Generate new challenge
      setChallenge(mockChallenge);
      localStorage.setItem('dailyChallenge', JSON.stringify(mockChallenge));
      localStorage.setItem('dailyChallengeDate', today);
      localStorage.setItem('dailyChallengeCompleted', 'false');
    }

    setLoading(false);
  }, []);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitChallenge();
    }
  };

  const submitChallenge = () => {
    let correct = 0;
    challenge.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);

    if (correct === challenge.questions.length && !completed) {
      // Award bonus XP for completing daily challenge
      setShowXPReward(true);
      setCompleted(true);
      localStorage.setItem('dailyChallengeCompleted', 'true');

      // Update user progress
      const currentXP = parseInt(localStorage.getItem('userXP') || '0');
      const newXP = currentXP + 50; // 50 XP bonus for daily challenge
      localStorage.setItem('userXP', newXP.toString());

      onComplete?.(50);
    }
  };

  const resetChallenge = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) return null;

  if (completed) {
    return (
      <Card className="border-2 border-green-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-6 h-6" />
            Daily Challenge Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Great job! You've completed today's daily challenge and earned 50 bonus XP.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
            <Clock className="w-4 h-4" />
            Come back tomorrow for a new challenge!
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="border-2 border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Challenge Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {score}/{challenge.questions.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {score === challenge.questions.length
                ? "Perfect! You've earned 50 bonus XP!"
                : "Keep practicing to complete the daily challenge!"}
            </p>
          </div>
          <Button onClick={resetChallenge} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2 border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            {challenge.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {challenge.description}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {challenge.questions.length}</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                50 XP reward
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / challenge.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">
            {challenge.questions[currentQuestion].question}
          </h3>

          <div className="space-y-3 mb-6">
            {challenge.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 dark:border-purple-400'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-600 dark:hover:border-purple-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {currentQuestion === challenge.questions.length - 1 ? 'Complete Challenge' : 'Next Question'}
          </Button>
        </CardContent>
      </Card>

      {showXPReward && (
        <XPReward
          xp={50}
          onComplete={() => setShowXPReward(false)}
        />
      )}
    </>
  );
}
