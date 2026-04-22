import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const topic = 'algebra';
  const reason = 'your accuracy is low in algebra';

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Learning Dashboard</h1>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl mb-8">
        <h2 className="text-2xl font-semibold mb-2">Focus Topic: {topic}</h2>
        <p className="text-gray-700 mb-6">Reason: {reason}</p>
        <Button 
          onClick={handleStartQuiz}
          className="w-full text-xl py-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

