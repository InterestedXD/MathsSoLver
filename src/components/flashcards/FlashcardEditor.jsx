import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';

const FlashcardEditor = ({ onSave, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1e40af';
      ctxRef.current = ctx;
    }
  }, []);

  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  }, [isDrawing]);

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const drawingData = canvas.toDataURL();
    onSave({
      question,
      answer,
      drawing: drawingData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Create Flashcard
        </h2>

        {/* Question */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl resize-vertical min-h-[80px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg"
            placeholder="What is the derivative of x²?"
          />
        </div>

        {/* Canvas */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            Diagram / Drawing (optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 hover:border-indigo-400 transition-colors">
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="w-full h-64 bg-white rounded-xl cursor-crosshair shadow-sm hover:shadow-md transition-shadow"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="mt-3 w-full"
            >
              Clear Drawing
            </Button>
          </div>
        </div>

        {/* Answer */}
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl resize-vertical min-h-[80px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg"
            placeholder="2x (Power Rule)"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8 py-3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 text-lg font-semibold"
            disabled={!question.trim() || !answer.trim()}
          >
            Save Flashcard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardEditor;

