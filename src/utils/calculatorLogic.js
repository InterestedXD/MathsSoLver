import { create, all } from 'mathjs';

const math = create(all);

// Configure math.js for better precision
math.config({
  number: 'BigNumber',
  precision: 64
});

export const evaluateExpression = (expression) => {
  try {
    if (!expression || !expression.trim()) {
      return { result: '0', error: null };
    }

    // Replace common math symbols with math.js equivalents
    let processedExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/\^/g, '^');

    const result = math.evaluate(processedExpression);
    const formattedResult = math.format(result, { precision: 10 });

    return { result: formattedResult, error: null };
  } catch (error) {
    return { result: null, error: error.message };
  }
};

export const formatNumber = (num) => {
  try {
    return math.format(math.bignumber(num), { precision: 10 });
  } catch {
    return num.toString();
  }
};

export const isValidExpression = (expression) => {
  try {
    math.parse(expression);
    return true;
  } catch {
    return false;
  }
};

export const getMemoryValue = () => {
  const saved = localStorage.getItem('calculatorMemory');
  return saved ? parseFloat(saved) : 0;
};

export const setMemoryValue = (value) => {
  localStorage.setItem('calculatorMemory', value.toString());
};

export const getHistory = () => {
  const saved = localStorage.getItem('calculatorHistory');
  return saved ? JSON.parse(saved) : [];
};

export const saveHistory = (history) => {
  localStorage.setItem('calculatorHistory', JSON.stringify(history.slice(-5)));
};
