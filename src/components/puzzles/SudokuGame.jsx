import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react';

// Predefined Sudoku puzzles
const PUZZLES = {
  easy: [{
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  }],
  medium: [{
    puzzle: [
      [0,0,0,6,0,0,4,0,0],
      [7,0,0,0,0,3,6,0,0],
      [0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],
      [0,5,0,1,8,0,0,0,3],
      [0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],
      [9,0,3,0,0,0,0,0,0],
      [0,2,0,0,0,0,1,0,0]
    ],
    solution: [
      [5,8,1,6,7,2,4,3,9],
      [7,9,2,8,4,3,6,5,1],
      [3,6,4,5,9,1,7,8,2],
      [1,3,8,9,5,4,2,7,6],
      [4,5,6,1,8,7,9,2,3],
      [2,7,9,3,6,8,5,4,1],
      [8,4,5,2,1,9,3,6,7],
      [9,1,3,7,6,5,8,2,4],
      [6,2,7,4,3,8,1,9,5]
    ]
  }],
  hard: [{
    puzzle: [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,3,0,8,5],
      [0,0,1,0,2,0,0,0,0],
      [0,0,0,5,0,7,0,0,0],
      [0,0,4,0,0,0,1,0,0],
      [0,9,0,0,0,0,0,0,0],
      [5,0,0,0,0,0,0,7,3],
      [0,0,2,0,1,0,0,0,0],
      [0,0,0,0,4,0,0,0,9]
    ],
    solution: [
      [9,8,7,6,5,4,3,2,1],
      [2,4,6,1,7,3,9,8,5],
      [3,5,1,9,2,8,7,4,6],
      [1,2,8,5,3,7,6,9,4],
      [6,3,4,8,9,2,1,5,7],
      [7,9,5,4,6,1,8,3,2],
      [5,1,9,2,8,6,4,7,3],
      [4,7,2,3,1,9,5,6,8],
      [8,6,3,7,4,5,2,1,9]
    ]
  }]
};

export default function SudokuGame({ onComplete, onBack, progress, updateProgress, xpReward }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState(0);
  const [maxErrors] = useState(3);
  const [gameStatus, setGameStatus] = useState('select');
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [highlightedNumber, setHighlightedNumber] = useState(null);

  useEffect(() => {
    let interval;
    if (isTimerRunning && gameStatus === 'playing') {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameStatus]);

  const generatePuzzle = (diff) => {
    const puzzles = PUZZLES[diff];
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    const puzzle = randomPuzzle.puzzle.map(row => [...row]);
    const sol = randomPuzzle.solution.map(row => [...row]);
    setBoard(puzzle);
    setInitialBoard(puzzle.map(row => [...row]));
    setSolution(sol);
    setErrors(0);
    setTime(0);
    setSelectedCell(null);
    setGameStatus('playing');
    setIsTimerRunning(true);
  };

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing') return;
    if (initialBoard[row][col] !== 0) return;
    setSelectedCell({ row, col });
    setHighlightedNumber(board[row][col]);
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || gameStatus !== 'playing') return;
    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    if (num !== solution[row][col]) {
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (newErrors >= maxErrors) {
        setGameStatus('lost');
        setIsTimerRunning(false);
      }
    }
    
    checkWin(newBoard);
  };

  const checkWin = (currentBoard) => {
    const isComplete = currentBoard.every((row, i) => 
      row.every((cell, j) => cell === solution[i][j])
    );
    if (isComplete) {
      setGameStatus('won');
      setIsTimerRunning(false);
      const baseXP = xpReward?.[difficulty] || 20;
      const totalXP = baseXP + Math.max(0, 30 - Math.floor(time / 30));
      if (onComplete) onComplete(totalXP);
      if (updateProgress) updateProgress('sudoku', totalXP, difficulty);
    }
  };

  const handleNewGame = () => {
    setGameStatus('select');
    setBoard([]);
    setSolution([]);
    setTime(0);
    setErrors(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellClass = (row, col, value) => {
    let classes = 'w-10 h-10 text-center text-lg font-medium border transition-colors ';
    if (initialBoard[row][col] !== 0) {
      classes += 'bg-gray-700 text-white cursor-not-allowed ';
    } else if (value !== 0) {
      classes += value === solution[row][col] ? 'bg-green-900 text-green-300 ' : 'bg-red-900 text-red-300 ';
    } else {
      classes += 'bg-gray-800 text-gray-300 ';
    }
    if (selectedCell?.row === row && selectedCell?.col === col) {
      classes += 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-900 ';
    }
    if (highlightedNumber && value === highlightedNumber && value !== 0) {
      classes += 'bg-indigo-900 ';
    }
    if (col === 2 || col === 5) classes += 'border-r-2 border-r-gray-500 ';
    if (row === 2 || row === 5) classes += 'border-b-2 border-b-gray-500 ';
    return classes;
  };

  if (gameStatus === 'select') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={onBack} variant="ghost" className="text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />Back to Arcade
            </Button>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <span className="text-3xl">🎯</span> Sudoku
              </CardTitle>
              <p className="text-gray-400">Classic number puzzle. Fill 9x9 grid with 1-9.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-white font-medium">Select Difficulty:</p>
                {['easy', 'medium', 'hard'].map((diff) => (
                  <Button key={diff} onClick={() => { setDifficulty(diff); generatePuzzle(diff); }}
                    className="w-full py-6 text-lg capitalize bg-indigo-600 hover:bg-indigo-700">
                    <Play className="w-5 h-5 mr-2" />{diff} - {xpReward?.[diff] || 20} XP
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-gray-400 mb-4">You solved the Sudoku!</p>
            <div className="flex justify-center gap-8 mb-6">
              <div><p className="text-2xl font-bold text-indigo-400">{formatTime(time)}</p><p className="text-gray-500 text-sm">Time</p></div>
              <div><p className="text-2xl font-bold text-green-400">+{xpReward?.[difficulty] || 20}</p><p className="text-gray-500 text-sm">XP</p></div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleNewGame} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Play Again</Button>
              <Button onClick={onBack} variant="outline" className="flex-1">Back to Arcade</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-6 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
            <p className="text-gray-400 mb-4">Too many errors!</p>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleNewGame} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Try Again</Button>
              <Button onClick={onBack} variant="outline" className="flex-1">Back to Arcade</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className="text-white"><ArrowLeft className="w-5 h-5 mr-2" />Exit</Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5" /><span className="text-xl font-mono">{formatTime(time)}</span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(maxErrors)].map((_, i) => (
                <XCircle key={i} className={`w-5 h-5 ${i < errors ? 'text-red-500' : 'text-gray-600'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-9 gap-0 border-2 border-gray-600">
            {board.map((row, rowIndex) => row.map((cell, colIndex) => (
              <button key={`${rowIndex}-${colIndex}`} onClick={() => handleCellClick(rowIndex, colIndex)}
                className={getCellClass(rowIndex, colIndex, cell)} disabled={initialBoard[rowIndex][colIndex] !== 0}>
                {cell || ''}
              </button>
            )))}
          </div>
        </div>
        <div className="grid grid-cols-9 gap-2 mb-6">
          {[1,2,3,4,5,6,7,8,9].map((num) => (
            <Button key={num} onClick={() => handleNumberInput(num)} disabled={!selectedCell}
              className="h-12 text-lg font-bold bg-gray-700 hover:bg-gray-600 text-white">{num}</Button>
          ))}
        </div>
        <div className="flex gap-4">
          <Button onClick={() => handleNumberInput(0)} disabled={!selectedCell} variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
            <XCircle className="w-4 h-4 mr-2" />Clear
          </Button>
          <Button onClick={() => generatePuzzle(difficulty)} variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
            <RotateCcw className="w-4 h-4 mr-2" />New Game
          </Button>
        </div>
      </div>
    </div>
  );
}

