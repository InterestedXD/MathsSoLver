import React, { useState, useEffect, useRef } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, RotateCcw, FastForward, 
  Layers, GitBranch, List, Box 
} from 'lucide-react';

// Sorting Algorithms
const sortingAlgorithms = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Repeatedly swaps adjacent elements if they are in wrong order',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)'
  },
  selection: {
    name: 'Selection Sort',
    description: 'Finds minimum element and places it at the beginning',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)'
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds sorted array one element at a time',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)'
  },
  quick: {
    name: 'Quick Sort',
    description: 'Divides array using pivot and recursively sorts',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)'
  },
  merge: {
    name: 'Merge Sort',
    description: 'Divides array in half, sorts, and merges',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  }
};

// Data Structures
const dataStructures = {
  stack: {
    name: 'Stack',
    description: 'LIFO - Last In First Out',
    operations: ['push', 'pop', 'peek']
  },
  queue: {
    name: 'Queue',
    description: 'FIFO - First In First Out',
    operations: ['enqueue', 'dequeue', 'front']
  },
  binaryTree: {
    name: 'Binary Tree',
    description: 'Hierarchical structure with at most 2 children per node',
    operations: ['insert', 'delete', 'traverse']
  }
};

export default function Visualizer() {
  usePageTitle('Algorithm Visualizer - Maths Solver');

  const [activeTab, setActiveTab] = useState('sorting');
  const [algorithm, setAlgorithm] = useState('bubble');
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [compareIndex, setCompareIndex] = useState(-1);
  const [sortedIndex, setSortedIndex] = useState(-1);
  const [speed, setSpeed] = useState(100);
  const [message, setMessage] = useState('');
  
  // Data Structure states
  const [dsType, setDsType] = useState('stack');
  const [dsData, setDsData] = useState([]);
  const [dsInput, setDsInput] = useState('');

  useEffect(() => {
    generateArray();
  }, []);

  const generateArray = () => {
    const newArray = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 5);
    setArray(newArray);
    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSortedIndex(-1);
    setMessage('Click Start to begin visualization');
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (!sorting || paused) { while (paused) await sleep(100); if (!sorting) return; }
        setCurrentIndex(j);
        setCompareIndex(j + 1);
        await sleep(speed);
        
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
      }
      setSortedIndex(arr.length - i);
    }
    setSortedIndex(0);
    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSorting(false);
    setMessage('Sorting complete!');
  };

  const selectionSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (!sorting || paused) { while (paused) await sleep(100); if (!sorting) return; }
        setCurrentIndex(minIdx);
        setCompareIndex(j);
        await sleep(speed);
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      setArray([...arr]);
      setSortedIndex(i + 1);
    }
    setSortedIndex(0);
    setSorting(false);
    setMessage('Sorting complete!');
  };

  const insertionSort = async () => {
    const arr = [...array];
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && arr[j] < arr[j - 1]) {
        if (!sorting || paused) { while (paused) await sleep(100); if (!sorting) return; }
        setCurrentIndex(j);
        setCompareIndex(j - 1);
        await sleep(speed);
        
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        setArray([...arr]);
        j--;
      }
    }
    setSortedIndex(0);
    setSorting(false);
    setMessage('Sorting complete!');
  };

  const quickSort = async () => {
    const arr = [...array];
    
    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (!sorting || paused) { while (paused) await sleep(100); if (!sorting) return; }
        setCurrentIndex(high);
        setCompareIndex(j);
        await sleep(speed);
        
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      return i + 1;
    };
    
    const quickSortRecursive = async (low, high) => {
      if (low < high) {
        const pi = await partition(low, high);
        await quickSortRecursive(low, pi - 1);
        await quickSortRecursive(pi + 1, high);
      }
    };
    
    await quickSortRecursive(0, arr.length - 1);
    setSortedIndex(0);
    setCurrentIndex(-1);
    setCompareIndex(-1);
    setSorting(false);
    setMessage('Sorting complete!');
  };

  const mergeSort = async () => {
    const arr = [...array];
    
    const merge = async (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        if (!sorting || paused) { while (paused) await sleep(100); if (!sorting) return; }
        setCurrentIndex(k);
        await sleep(speed);
        
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        setArray([...arr]);
        k++;
      }
      
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        setArray([...arr]);
        i++; k++;
      }
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        setArray([...arr]);
        j++; k++;
      }
    };
    
    const mergeSortRecursive = async (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSortRecursive(left, mid);
        await mergeSortRecursive(mid + 1, right);
        await merge(left, mid, right);
      }
    };
    
    await mergeSortRecursive(0, arr.length - 1);
    setSortedIndex(0);
    setSorting(false);
    setMessage('Sorting complete!');
  };

  const startSorting = () => {
    setSorting(true);
    setMessage(`Running ${sortingAlgorithms[algorithm].name}...`);
    
    switch (algorithm) {
      case 'bubble': bubbleSort(); break;
      case 'selection': selectionSort(); break;
      case 'insertion': insertionSort(); break;
      case 'quick': quickSort(); break;
      case 'merge': mergeSort(); break;
      default: break;
    }
  };

  const stopSorting = () => {
    setSorting(false);
    setPaused(false);
    setMessage('Sorting stopped');
  };

  // Data Structure Operations
  const handleDsOperation = (op) => {
    if (op === 'push' || op === 'enqueue') {
      if (!dsInput) return;
      const value = parseInt(dsInput) || dsInput;
      setDsData([...dsData, value]);
      setDsInput('');
    } else if ((op === 'pop' || op === 'dequeue') && dsData.length > 0) {
      const newData = op === 'pop' ? dsData.slice(0, -1) : dsData.slice(1);
      setDsData(newData);
    }
  };

  const getBarColor = (idx) => {
    if (sortedIndex >= 0 && idx >= sortedIndex) return 'bg-green-500';
    if (idx === currentIndex) return 'bg-yellow-500';
    if (idx === compareIndex) return 'bg-red-500';
    return 'bg-indigo-500';
  };

  const maxVal = Math.max(...array, 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Algorithm Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn sorting algorithms and data structures through interactive visualization
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('sorting')}
            variant={activeTab === 'sorting' ? 'default' : 'outline'}
            className={activeTab === 'sorting' ? 'bg-indigo-600' : ''}
          >
            <Layers className="w-4 h-4 mr-2" /> Sorting
          </Button>
          <Button
            onClick={() => setActiveTab('structures')}
            variant={activeTab === 'structures' ? 'default' : 'outline'}
            className={activeTab === 'structures' ? 'bg-indigo-600' : ''}
          >
            <GitBranch className="w-4 h-4 mr-2" /> Data Structures
          </Button>
        </div>

        {/* Sorting Tab */}
        {activeTab === 'sorting' && (
          <div className="space-y-6">
            {/* Algorithm Selection */}
            <Card className="bg-white dark:bg-[#1A2235] border-gray-200 dark:border-[#2A3550]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Select Algorithm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(sortingAlgorithms).map(([key, algo]) => (
                    <button
                      key={key}
                      onClick={() => { setAlgorithm(key); generateArray(); }}
                      disabled={sorting}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        algorithm === key 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      } ${sorting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{algo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{algo.timeComplexity}</p>
                    </button>
                  ))}
                </div>
                
                {/* Algorithm Info */}
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sortingAlgorithms[algorithm].description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Time: {sortingAlgorithms[algorithm].timeComplexity}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      Space: {sortingAlgorithms[algorithm].spaceComplexity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visualization */}
            <Card className="bg-white dark:bg-[#1A2235] border-gray-200 dark:border-[#2A3550]">
              <CardContent className="p-6">
                {/* Bars */}
                <div className="flex items-end justify-center gap-1 h-64 mb-6">
                  {array.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-6 md:w-8 ${getBarColor(idx)} transition-all duration-200 rounded-t`}
                      style={{ height: `${(val / maxVal) * 100}%` }}
                      title={val}
                    >
                      <span className="text-xs text-white opacity-0 hover:opacity-100">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={generateArray} disabled={sorting} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" /> Generate New Array
                  </Button>
                  
                  {!sorting ? (
                    <Button onClick={startSorting} className="bg-indigo-600 hover:bg-indigo-700">
                      <Play className="w-4 h-4 mr-2" /> Start
                    </Button>
                  ) : (
                    <Button onClick={stopSorting} variant="destructive">
                      <Pause className="w-4 h-4 mr-2" /> Stop
                    </Button>
                  )}

                  {sorting && (
                    <Button onClick={() => setPaused(!paused)} variant="outline">
                      {paused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {paused ? 'Resume' : 'Pause'}
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={510 - speed}
                      onChange={(e) => setSpeed(510 - e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Message */}
                <p className="text-center mt-4 text-gray-600 dark:text-gray-400">{message}</p>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">Compare</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">Sorted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Structures Tab */}
        {activeTab === 'structures' && (
          <div className="space-y-6">
            <Card className="bg-white dark:bg-[#1A2235] border-gray-200 dark:border-[#2A3550]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Select Data Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(dataStructures).map(([key, ds]) => (
                    <button
                      key={key}
                      onClick={() => { setDsType(key); setDsData([]); }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        dsType === key 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{ds.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{ds.description}</p>
                    </button>
                  ))}
                </div>

                {/* Operations */}
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={dsInput}
                    onChange={(e) => setDsInput(e.target.value)}
                    placeholder="Enter value..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {dataStructures[dsType].operations.map((op) => (
                    <Button
                      key={op}
                      onClick={() => handleDsOperation(op)}
                      variant="outline"
                      className="capitalize"
                    >
                      {op}
                    </Button>
                  ))}
                </div>

                {/* Visualization */}
                <div className="flex flex-wrap gap-2 justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-32">
                  {dsData.length === 0 ? (
                    <p className="text-gray-500">Add elements to see the {dataStructures[dsType].name} visualization</p>
                  ) : (
                    dsData.map((val, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium flex items-center"
                      >
                        {val}
                        {dsType === 'queue' && idx === 0 && (
                          <span className="ml-2 text-xs bg-green-500 px-1 rounded">front</span>
                        )}
                        {dsType === 'stack' && idx === dsData.length - 1 && (
                          <span className="ml-2 text-xs bg-green-500 px-1 rounded">top</span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  {dsType === 'stack' && 'Items are added and removed from the top (LIFO)'}
                  {dsType === 'queue' && 'Items are added at back, removed from front (FIFO)'}
                  {dsType === 'binaryTree' && 'Tree visualization coming soon'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

