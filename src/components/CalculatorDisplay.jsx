import React, { useState, useEffect, useCallback } from 'react';
import { create, all } from 'mathjs';
import { History, Trash2, Download } from 'lucide-react';

const math = create(all);

const CalculatorDisplay = ({ mode }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(newHistory.slice(-5)));
  }, []);

  const evaluateExpression = useCallback(() => {
    try {
      if (!expression.trim()) return;

      const result = math.evaluate(expression);
      const formattedResult = math.format(result, { precision: 10 });

      setDisplay(formattedResult);
      setExpression(formattedResult);

      const newEntry = { expression, result: formattedResult, timestamp: Date.now() };
      saveHistory([...history, newEntry]);
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  }, [expression, history, saveHistory]);

  const handleKeyPress = useCallback((key) => {
    if (key === 'Enter' || key === '=') {
      evaluateExpression();
    } else if (key === 'Backspace') {
      setExpression(prev => prev.slice(0, -1));
    } else if (key === 'Escape') {
      setExpression('');
      setDisplay('0');
    } else if (key === 'C' || key === 'c') {
      setExpression('');
      setDisplay('0');
    } else {
      setExpression(prev => prev + key);
    }
  }, [evaluateExpression]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key;
      if (/[\d+\-*/().^%sincoqrtanlneπ]/.test(key) || ['Enter', 'Backspace', 'Escape', '=', 'C', 'c'].includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const appendToExpression = (value) => {
    setExpression(prev => prev + value);
  };

  const clearAll = () => {
    setExpression('');
    setDisplay('0');
  };

  const clearEntry = () => {
    setExpression('');
  };

  const backspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const memoryAdd = () => {
    try {
      const value = parseFloat(display);
      setMemory(prev => prev + value);
    } catch {}
  };

  const memorySubtract = () => {
    try {
      const value = parseFloat(display);
      setMemory(prev => prev - value);
    } catch {}
  };

  const memoryRecall = () => {
    setExpression(prev => prev + memory.toString());
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const scientificFunctions = {
    sin: 'sin(',
    cos: 'cos(',
    tan: 'tan(',
    log: 'log10(',
    ln: 'log(',
    sqrt: 'sqrt(',
    square: '^2',
    cube: '^3',
    power: '^',
    pi: 'pi',
    e: 'e',
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'calculator-history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
  };

  const buttonClass = `h-10 rounded-md font-semibold transition-all duration-200 backdrop-blur-sm ${
    mode === 'dark'
      ? 'bg-gradient-to-br from-slate-700 to-gray-700 hover:from-slate-600 hover:to-gray-600 text-white border-slate-600'
      : 'bg-gradient-to-br from-slate-100 to-blue-100 hover:from-slate-200 hover:to-blue-200 text-gray-900 border-slate-300'
  } border`;

  const operatorClass = `h-10 rounded-md font-semibold transition-all duration-200 backdrop-blur-sm ${
    mode === 'dark'
      ? 'bg-gradient-to-br from-slate-600 to-blue-700 hover:from-slate-500 hover:to-blue-600 text-white'
      : 'bg-gradient-to-br from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white'
  }`;

  const equalsClass = `h-10 rounded-md font-semibold transition-all duration-200 backdrop-blur-sm ${
    mode === 'dark'
      ? 'bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white'
      : 'bg-gradient-to-br from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white'
  }`;

  return (
    <div className="space-y-4">
      {/* Display */}
      <div className={`p-3 rounded-lg border backdrop-blur-sm ${
        mode === 'dark' ? 'bg-gray-800/80 border-gray-600' : 'bg-gray-50/80 border-gray-200'
      }`}>
        <div className="text-right text-xl font-mono mb-2 min-h-[1.5rem] break-words">
          {display}
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className={`w-full p-2 rounded border text-right font-mono ${
            mode === 'dark'
              ? 'bg-gray-700/80 border-gray-600 text-white'
              : 'bg-white/80 border-gray-300 text-gray-900'
          }`}
          placeholder="Enter expression..."
        />
      </div>

      {/* Memory and History */}
      <div className="flex gap-1">
        <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={buttonClass}>
          <History className="w-4 h-4 mx-auto" />
        </button>
        <button onClick={memoryRecall} className={buttonClass}>MR</button>
        <button onClick={memoryAdd} className={buttonClass}>M+</button>
        <button onClick={memorySubtract} className={buttonClass}>M-</button>
        <button onClick={memoryClear} className={buttonClass}>MC</button>
      </div>

      {/* Scientific Functions */}
      <div className="grid grid-cols-4 gap-1">
        {Object.entries(scientificFunctions).map(([key, value]) => (
          <button
            key={key}
            onClick={() => appendToExpression(value)}
            className={buttonClass}
          >
            {key === 'square' ? 'x²' : key === 'cube' ? 'x³' : key === 'power' ? '^' : key}
          </button>
        ))}
      </div>

      {/* Main Calculator */}
      <div className="flex flex-col gap-1">
        {/* Row 1: AC, CE, ⌫ */}
        <div className="flex gap-1">
          <button onClick={clearAll} className={`${operatorClass} flex-[2]`}>AC</button>
          <button onClick={clearEntry} className={`${operatorClass} flex-1`}>CE</button>
          <button onClick={backspace} className={`${operatorClass} flex-1`}>⌫</button>
        </div>

        {/* Row 2: 7, 8, 9, ( */}
        <div className="flex gap-1">
          {[7, 8, 9].map(num => (
            <button key={num} onClick={() => appendToExpression(num.toString())} className={`${buttonClass} flex-1`}>
              {num}
            </button>
          ))}
          <button onClick={() => appendToExpression('(')} className={`${operatorClass} flex-1`}>(</button>
        </div>

        {/* Row 3: 4, 5, 6, ) */}
        <div className="flex gap-1">
          {[4, 5, 6].map(num => (
            <button key={num} onClick={() => appendToExpression(num.toString())} className={`${buttonClass} flex-1`}>
              {num}
            </button>
          ))}
          <button onClick={() => appendToExpression(')')} className={`${operatorClass} flex-1`}>)</button>
        </div>

        {/* Row 4: 1, 2, 3, × */}
        <div className="flex gap-1">
          {[1, 2, 3].map(num => (
            <button key={num} onClick={() => appendToExpression(num.toString())} className={`${buttonClass} flex-1`}>
              {num}
            </button>
          ))}
          <button onClick={() => appendToExpression('*')} className={`${operatorClass} flex-1`}>×</button>
        </div>

        {/* Row 5: 0, ., ÷ */}
        <div className="flex gap-1">
          <button onClick={() => appendToExpression('0')} className={`${buttonClass} flex-[2]`}>0</button>
          <button onClick={() => appendToExpression('.')} className={`${buttonClass} flex-1`}>.</button>
          <button onClick={() => appendToExpression('/')} className={`${operatorClass} flex-1`}>÷</button>
        </div>

        {/* Row 6: +, -, = */}
        <div className="flex gap-1">
          <button onClick={() => appendToExpression('+')} className={`${operatorClass} flex-1`}>+</button>
          <button onClick={() => appendToExpression('-')} className={`${operatorClass} flex-1`}>-</button>
          <button onClick={evaluateExpression} className={`${equalsClass} flex-[2]`}>=</button>
        </div>
      </div>

      {/* History Panel */}
      {isHistoryOpen && (
        <div className={`p-4 rounded-lg border max-h-48 overflow-y-auto ${
          mode === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">History</h3>
            <div className="flex gap-2">
              <button onClick={exportHistory} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={clearHistory} className="p-1 hover:bg-red-200 dark:hover:bg-red-700 rounded text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No history yet</p>
          ) : (
            <div className="space-y-2">
              {history.slice(-5).reverse().map((entry, index) => (
                <div
                  key={index}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    mode === 'dark' ? 'bg-gray-700' : 'bg-white'
                  }`}
                  onClick={() => setExpression(entry.expression)}
                >
                  <div className="text-sm font-mono">{entry.expression}</div>
                  <div className="text-xs text-gray-500">= {entry.result}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorDisplay;
