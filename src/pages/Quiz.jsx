import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Quiz = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'algebra', difficulty: 'medium' })
      });
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Failed to fetch quiz', error);
      // Mock quiz for demo
      setQuiz({
        title: 'Algebra Quiz',
        questions: [
          { question: 'Solve 2x + 3 = 7', options: ['x=2', 'x=3', 'x=4', 'x=5'], correctAnswer: 0 },
          { question: 'What is 5x - 3?', options: ['2x', '5x-3', '8x', '2x+3'], correctAnswer: 1 },
          { question: 'Simplify x + x', options: ['2x', 'x^2', 'x/2', '0'], correctAnswer: 0 },
          { question: 'x^2 = 16?', options: ['x=4', 'x=8', 'x=2', 'x=16'], correctAnswer: 0 },
          { question: '3x = 12', options: ['x=3', 'x=4', 'x=36', 'x=9'], correctAnswer: 1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (index, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[index] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    
    // Calculate score for result page
    const score = answers.reduce((acc, ans, i) => 
      ans === quiz.questions[i].correctAnswer ? acc + 1 : acc, 0
    ) / 5;
    
    navigate('/result', { 
      state: { 
        score, 
        correct: answers.filter((ans, i) => ans === quiz.questions[i].correctAnswer).length,
        total: 5,
        xpEarned: Math.floor(score * 100)
      } 
    });
    
    setSubmitting(false);
  };

  if (loading) return <div className="p-8">Loading quiz...</div>;
  if (!quiz) return <div className="p-8">Failed to load quiz</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{quiz.title}</h1>
      
      <div className="space-y-6 mb-8">
        {quiz.questions.map((q, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md">
            <div className="font-medium text-lg mb-4">{q.question}</div>
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => selectAnswer(index, optIndex)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    answers[index] === optIndex
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button 
        onClick={submitQuiz}
        disabled={submitting || answers.some(a => a === null)}
        className="w-full text-xl py-4"
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </Button>
    </div>
  );
};

export default Quiz;

