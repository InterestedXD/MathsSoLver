// Math Question Generator for Flappy Math

export const generateQuestion = (difficulty) => {
  let question, answer, options;
  
  if (difficulty === 'Easy') {
    // Addition and subtraction
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      question = `${a} + ${b}`;
      answer = a + b;
    } else {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      question = `${a} - ${b}`;
      answer = a - b;
    }
  } else if (difficulty === 'Medium') {
    // Multiplication and division
    const isMult = Math.random() > 0.5;
    
    if (isMult) {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      question = `${a} × ${b}`;
      answer = a * b;
    } else {
      const b = Math.floor(Math.random() * 10) + 2;
      const answerVal = Math.floor(Math.random() * 10) + 1;
      const a = b * answerVal;
      question = `${a} ÷ ${b}`;
      answer = answerVal;
    }
  } else {
    // Hard - Simple algebra
    const types = ['solve_linear', 'evaluate'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'solve_linear') {
      // Simple linear equation: ax + b = c
      const x = Math.floor(Math.random() * 8) + 2;
      const a = Math.floor(Math.random() * 4) + 1;
      const b = Math.floor(Math.random() * 10);
      const c = a * x + b;
      question = `Solve: ${a}x + ${b} = ${c}`;
      answer = x;
    } else {
      // Evaluate expression
      const x = Math.floor(Math.random() * 5) + 1;
      const a = Math.floor(Math.random() * 2) + 1;
      const b = Math.floor(Math.random() * 4);
      question = `If x = ${x}, find: ${a}x² + ${b}x`;
      answer = a * x * x + b * x;
    }
  }
  
  // Generate wrong options
  const wrongOptions = [];
  while (wrongOptions.length < 2) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + offset;
    if (wrong !== answer && wrong > 0 && !wrongOptions.includes(wrong)) {
      wrongOptions.push(wrong);
    }
  }
  
  // Shuffle options
  const allOptions = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);
  const correctIndex = allOptions.indexOf(answer);
  
  return {
    question,
    answer,
    options: allOptions.map((opt, idx) => ({
      value: opt,
      label: String.fromCharCode(65 + idx)
    })),
    correctIndex
  };
};

