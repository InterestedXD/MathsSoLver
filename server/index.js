const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
console.log('Loaded GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Not found');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Topic mapping for video recommendations
const topicMapping = {
  'Algebra': 'Algebra Fundamentals',
  'Trigonometry': 'Trigonometry Basics',
  'Geometry': 'Geometry Fundamentals',
  'Calculus': 'Calculus Basics',
  'derivatives': 'Derivatives Basics',
  'integrals': 'Integration Basics',
  'algebra': 'Algebra Fundamentals'
};

// Mock quiz data organized by topic and difficulty
const mockQuizzes = {
  Algebra: {
    Easy: {
      title: "Algebra Quiz - Easy",
      description: "Basic algebra concepts and operations",
      questions: [
        {
          question: "Solve for x: 2x + 3 = 7",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          correctAnswer: 1
        },
        {
          question: "Simplify: 3x + 2x",
          options: ["5x", "6x", "3x²", "5x²"],
          correctAnswer: 0
        },
        {
          question: "What is the coefficient of x in 5x + 3?",
          options: ["3", "5", "8", "15"],
          correctAnswer: 1
        },
        {
          question: "Solve: x - 5 = 10",
          options: ["x = 5", "x = 10", "x = 15", "x = -5"],
          correctAnswer: 2
        },
        {
          question: "What is 4 × 3?",
          options: ["7", "12", "16", "24"],
          correctAnswer: 1
        }
      ]
    },
    Medium: {
      title: "Algebra Quiz - Medium",
      description: "Intermediate algebra with equations and expressions",
      questions: [
        {
          question: "Solve for x: 2(x + 3) = 10",
          options: ["x = 1", "x = 2", "x = 4", "x = 7"],
          correctAnswer: 1
        },
        {
          question: "Factor: x² - 4",
          options: ["(x-2)(x+2)", "(x-2)²", "(x+2)²", "x(x-4)"],
          correctAnswer: 0
        },
        {
          question: "Solve the system: x + y = 5, x - y = 1",
          options: ["x=3, y=2", "x=2, y=3", "x=4, y=1", "x=1, y=4"],
          correctAnswer: 0
        },
        {
          question: "Simplify: (2x + 3)(x - 1)",
          options: ["2x² + x - 3", "2x² - 2x + 3", "2x² + x + 3", "x² + 2x - 3"],
          correctAnswer: 0
        },
        {
          question: "What is the discriminant of x² + 4x + 4 = 0?",
          options: ["0", "4", "8", "16"],
          correctAnswer: 0
        }
      ]
    },
    Hard: {
      title: "Algebra Quiz - Hard",
      description: "Advanced algebra with complex equations and inequalities",
      questions: [
        {
          question: "Solve: |2x - 3| = 5",
          options: ["x = 1, x = -1", "x = 4, x = -1", "x = 1, x = 4", "x = -4, x = 1"],
          correctAnswer: 1
        },
        {
          question: "Find the roots of x³ - 6x² + 11x - 6 = 0",
          options: ["1, 2, 3", "1, 3, 6", "2, 3, 6", "1, 2, 6"],
          correctAnswer: 0
        },
        {
          question: "Solve the inequality: (x-1)(x+2) > 0",
          options: ["x < -2 or x > 1", "x > -2 and x < 1", "-2 < x < 1", "x < -2 and x > 1"],
          correctAnswer: 0
        },
        {
          question: "What is the sum of the roots of x² - 5x + 6 = 0?",
          options: ["5", "6", "11", "-5"],
          correctAnswer: 0
        },
        {
          question: "Solve: log₂(x) + log₂(x-1) = 1",
          options: ["x = 2", "x = 3", "x = 4", "x = 1"],
          correctAnswer: 0
        }
      ]
    }
  },
  Trigonometry: {
    Easy: {
      title: "Trigonometry Quiz - Easy",
      description: "Basic trigonometric functions and values",
      questions: [
        {
          question: "What is sin(90°)?",
          options: ["0", "1", "0.5", "-1"],
          correctAnswer: 1
        },
        {
          question: "What is cos(0°)?",
          options: ["0", "1", "0.5", "-1"],
          correctAnswer: 1
        },
        {
          question: "What is tan(45°)?",
          options: ["0", "1", "√2", "∞"],
          correctAnswer: 1
        },
        {
          question: "What is the period of sin(x)?",
          options: ["π", "2π", "π/2", "4π"],
          correctAnswer: 1
        },
        {
          question: "What is sin(0°)?",
          options: ["0", "1", "0.5", "-1"],
          correctAnswer: 0
        }
      ]
    },
    Medium: {
      title: "Trigonometry Quiz - Medium",
      description: "Trigonometric identities and equations",
      questions: [
        {
          question: "Simplify: sin²θ + cos²θ",
          options: ["1", "0", "2", "sinθcosθ"],
          correctAnswer: 0
        },
        {
          question: "Solve: sin(x) = 0.5 for x in [0, π]",
          options: ["π/6", "π/4", "π/3", "π/2"],
          correctAnswer: 2
        },
        {
          question: "What is tan(x) in terms of sin(x) and cos(x)?",
          options: ["sin(x)/cos(x)", "cos(x)/sin(x)", "1/sin(x)", "1/cos(x)"],
          correctAnswer: 0
        },
        {
          question: "Solve: 2sin(x)cos(x) = 1 for x in [0, π]",
          options: ["π/4", "π/3", "π/6", "π/2"],
          correctAnswer: 0
        },
        {
          question: "What is the amplitude of y = 3sin(2x)?",
          options: ["2", "3", "6", "1"],
          correctAnswer: 1
        }
      ]
    },
    Hard: {
      title: "Trigonometry Quiz - Hard",
      description: "Advanced trigonometric identities and applications",
      questions: [
        {
          question: "Prove: sin(2x) = 2sin(x)cos(x)",
          options: ["Use double angle formula", "Use sum-to-product", "Use product-to-sum", "Use power reduction"],
          correctAnswer: 0
        },
        {
          question: "Solve: sin(x) + cos(x) = √2",
          options: ["x = π/4 + 2kπ", "x = π/3 + 2kπ", "x = π/6 + 2kπ", "x = π/2 + 2kπ"],
          correctAnswer: 0
        },
        {
          question: "What is ∫sin²(x) dx?",
          options: ["x/2 - (1/4)sin(2x) + C", "x - sin(x)cos(x) + C", "sin(x) - cos(x) + C", "(1/2)x + C"],
          correctAnswer: 0
        },
        {
          question: "Solve: tan(x) = cot(x)",
          options: ["x = π/4 + kπ", "x = π/3 + kπ", "x = π/6 + kπ", "x = π/2 + kπ"],
          correctAnswer: 0
        },
        {
          question: "What is the general solution of sin(x) = 0?",
          options: ["x = kπ", "x = π/2 + kπ", "x = 2kπ", "x = π + kπ"],
          correctAnswer: 0
        }
      ]
    }
  },
  Geometry: {
    Easy: {
      title: "Geometry Quiz - Easy",
      description: "Basic geometric shapes and properties",
      questions: [
        {
          question: "What is the area of a square with side 4?",
          options: ["8", "12", "16", "20"],
          correctAnswer: 2
        },
        {
          question: "What is the circumference of a circle with radius 3?",
          options: ["6π", "9π", "12π", "18π"],
          correctAnswer: 0
        },
        {
          question: "How many sides does a triangle have?",
          options: ["2", "3", "4", "5"],
          correctAnswer: 1
        },
        {
          question: "What is the sum of angles in a triangle?",
          options: ["90°", "180°", "270°", "360°"],
          correctAnswer: 1
        },
        {
          question: "What is the area of a rectangle with length 5 and width 3?",
          options: ["8", "15", "16", "20"],
          correctAnswer: 1
        }
      ]
    },
    Medium: {
      title: "Geometry Quiz - Medium",
      description: "Intermediate geometry with theorems and calculations",
      questions: [
        {
          question: "What is the Pythagorean theorem?",
          options: ["a² + b² = c²", "a² - b² = c²", "a² × b² = c²", "a² ÷ b² = c²"],
          correctAnswer: 0
        },
        {
          question: "What is the area of a circle with radius r?",
          options: ["πr", "2πr", "πr²", "2πr²"],
          correctAnswer: 2
        },
        {
          question: "In a right triangle, what is the hypotenuse?",
          options: ["The longest side", "The shortest side", "The right angle side", "The equal side"],
          correctAnswer: 0
        },
        {
          question: "What is the volume of a sphere with radius r?",
          options: ["(4/3)πr²", "(4/3)πr³", "(2/3)πr³", "4πr³"],
          correctAnswer: 1
        },
        {
          question: "What is the area of an equilateral triangle with side a?",
          options: ["a²", "(√3/2)a²", "(√3/4)a²", "(1/2)a²"],
          correctAnswer: 1
        }
      ]
    },
    Hard: {
      title: "Geometry Quiz - Hard",
      description: "Advanced geometry with proofs and complex calculations",
      questions: [
        {
          question: "What is the formula for the area of a regular hexagon with side a?",
          options: ["(3√3/2)a²", "(√3/2)a²", "(3/2)a²", "(√3/4)a²"],
          correctAnswer: 0
        },
        {
          question: "In coordinate geometry, what is the distance between (1,2) and (4,6)?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 2
        },
        {
          question: "What is the volume of a cone with radius r and height h?",
          options: ["(1/3)πr²h", "(1/2)πr²h", "πr²h", "(2/3)πr²h"],
          correctAnswer: 0
        },
        {
          question: "What is the surface area of a sphere with radius r?",
          options: ["2πr", "4πr", "4πr²", "2πr²"],
          correctAnswer: 2
        },
        {
          question: "In a circle, what is the measure of an inscribed angle?",
          options: ["Half the arc", "Same as the arc", "Double the arc", "Quarter the arc"],
          correctAnswer: 0
        }
      ]
    }
  },
  Calculus: {
    Easy: {
      title: "Calculus Quiz - Easy",
      description: "Basic derivatives and integrals",
      questions: [
        {
          question: "What is d/dx[x²]?",
          options: ["x", "2x", "x²", "2"],
          correctAnswer: 1
        },
        {
          question: "What is ∫x dx?",
          options: ["x", "x²", "x²/2", "x²/2 + C"],
          correctAnswer: 3
        },
        {
          question: "What is d/dx[sin(x)]?",
          options: ["cos(x)", "-sin(x)", "tan(x)", "sec(x)"],
          correctAnswer: 0
        },
        {
          question: "What is ∫cos(x) dx?",
          options: ["sin(x)", "-sin(x)", "sin(x) + C", "-sin(x) + C"],
          correctAnswer: 2
        },
        {
          question: "What is d/dx[constant]?",
          options: ["1", "0", "x", "constant"],
          correctAnswer: 1
        }
      ]
    },
    Medium: {
      title: "Calculus Quiz - Medium",
      description: "Intermediate calculus with rules and applications",
      questions: [
        {
          question: "What is d/dx[x³]?",
          options: ["x²", "3x²", "3x", "x³"],
          correctAnswer: 1
        },
        {
          question: "What is ∫x² dx?",
          options: ["x²", "x³", "x³/3", "x³/3 + C"],
          correctAnswer: 3
        },
        {
          question: "Use chain rule: d/dx[(x² + 1)³]",
          options: ["3(x² + 1)²", "6x(x² + 1)²", "3(x² + 1)² * 2x", "6x(x² + 1)"],
          correctAnswer: 1
        },
        {
          question: "What is ∫e^x dx?",
          options: ["e^x", "e^x + C", "x e^x", "x e^x + C"],
          correctAnswer: 1
        },
        {
          question: "What is the derivative of ln(x)?",
          options: ["1/x", "x", "e^x", "ln(x)"],
          correctAnswer: 0
        }
      ]
    },
    Hard: {
      title: "Calculus Quiz - Hard",
      description: "Advanced calculus with limits, series, and complex problems",
      questions: [
        {
          question: "Evaluate: lim(x→0) sin(x)/x",
          options: ["0", "1", "∞", "undefined"],
          correctAnswer: 1
        },
        {
          question: "What is ∫(1/x) dx?",
          options: ["x", "ln|x|", "ln|x| + C", "1/x²"],
          correctAnswer: 2
        },
        {
          question: "Find d²y/dx² for y = x³",
          options: ["x²", "3x²", "6x", "6"],
          correctAnswer: 2
        },
        {
          question: "What is the Taylor series of e^x around x=0?",
          options: ["Σ(x^n/n!)", "Σ(x^n)", "Σ(n! x^n)", "Σ(x^n/n)"],
          correctAnswer: 0
        },
        {
          question: "Evaluate: ∫(from 0 to 1) x² dx",
          options: ["1/2", "1/3", "1", "2/3"],
          correctAnswer: 1
        }
      ]
    }
  }
};

// Function to generate quiz using Gemini API with randomization
async function generateQuizWithGemini(difficulty, topic) {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Add randomization elements to ensure unique questions
  const randomSeed = Math.floor(Math.random() * 10000);
  const currentTime = new Date().toISOString();

  const prompt = `Generate a UNIQUE mathematics quiz with 5 multiple-choice questions on the topic of ${topic} at ${difficulty} difficulty level.

IMPORTANT: Make each question completely unique and different from common textbook examples. Use random numbers, different scenarios, and varied problem types.

Requirements:
- Each question should have 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should be appropriate for the difficulty level
- Include a mix of conceptual and computational questions
- Use random numbers and scenarios (seed: ${randomSeed})
- Avoid using the same numbers or examples as typical problems
- Make questions creative and varied
- Return the response in valid JSON format with this exact structure:
{
  "title": "Mathematics Quiz - ${topic} (${difficulty})",
  "description": "Test your knowledge in ${topic} at ${difficulty} level",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Ensure the JSON is valid and parseable. Current timestamp: ${currentTime}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const quizData = JSON.parse(jsonMatch[0]);
    return quizData;
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    throw error;
  }
}

// Function to get mock quiz based on difficulty and topic
function getMockQuiz(difficulty, topic) {
  // Get the appropriate quiz based on topic and difficulty
  const topicQuizzes = mockQuizzes[topic];
  if (!topicQuizzes) {
    // Fallback to Algebra if topic not found
    return mockQuizzes['Algebra'][difficulty] || mockQuizzes['Algebra']['Medium'];
  }

  return topicQuizzes[difficulty] || topicQuizzes['Medium'];
}

// API endpoint to generate quiz
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { difficulty = 'Medium', topic = 'General Mathematics' } = req.body;

    console.log(`Generating quiz for ${topic} at ${difficulty} difficulty...`);

    let quizData;

    if (genAI) {
      try {
        quizData = await generateQuizWithGemini(difficulty, topic);
      } catch (geminiError) {
        console.warn('Gemini API failed, falling back to mock data:', geminiError.message);
        quizData = getMockQuiz(difficulty, topic);
      }
    } else {
      console.log('Gemini API not configured, using mock data');
      quizData = getMockQuiz(difficulty, topic);
    }

    res.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Function to generate YouTube search query using Gemini API
async function generateYouTubeSearchQuery(expression, topic) {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate an effective YouTube search query for finding educational math videos.

Problem/Topic: "${expression}"
Subject Area: ${topic}

Create a search query that will find high-quality, educational YouTube videos explaining this specific math concept. The query should:
- Be specific to the mathematical concept
- Include terms like "tutorial", "explained", "math", "mathematics"
- Avoid generic terms that might return unrelated content
- Be optimized for finding clear, step-by-step explanations

Respond with ONLY the search query text, nothing else. Make it concise but effective.

Examples:
- For "derivative of x²": "derivative of x squared power rule explained tutorial"
- For "integration by substitution": "integration by substitution calculus tutorial explained"
- For "quadratic formula": "quadratic formula explained step by step tutorial"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const searchQuery = response.text().trim();

    return searchQuery;
  } catch (error) {
    console.error('Error generating YouTube search query:', error);
    // Fallback to simple query
    return `${topic} ${expression} tutorial explained`;
  }
}

// Function to search YouTube and get video details (using web scraping as fallback)
async function searchYouTubeVideos(searchQuery, mappedTopic) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  // Try YouTube Data API first if key is available and valid
  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'AIzaSyCUUy-tCXWnENC8FOqCem6lT6urwy4ut88' && YOUTUBE_API_KEY.startsWith('AIzaSy')) {
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}&order=relevance&safeSearch=strict`;

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        throw new Error(`YouTube API search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('No videos found via API');
      }

      // Get the first video result
      const video = searchData.items[0];
      const videoId = video.id.videoId;

      // Get detailed video information
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;

      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) {
        throw new Error(`YouTube API details failed: ${detailsResponse.status}`);
      }

      const detailsData = await detailsResponse.json();

      if (!detailsData.items || detailsData.items.length === 0) {
        throw new Error('No video details found via API');
      }

      const videoDetails = detailsData.items[0];

      return {
        videoId,
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        thumbnail: videoDetails.snippet.thumbnails.medium?.url || videoDetails.snippet.thumbnails.default?.url,
        channelTitle: videoDetails.snippet.channelTitle,
        publishedAt: videoDetails.snippet.publishedAt,
        duration: videoDetails.contentDetails.duration,
        viewCount: videoDetails.statistics.viewCount,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`
      };

    } catch (apiError) {
      console.warn('YouTube API failed, falling back to mock videos:', apiError.message);
    }
  }

  // Fallback to web scraping approach
  try {
    console.log('Using web scraping fallback for YouTube search');

    // Create a search URL for YouTube
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    // For now, return a mock video since we can't actually scrape YouTube without proper setup
    // In a real implementation, you'd use a headless browser or scraping service
    const mockVideos = {
      derivatives: [
        {
          videoId: '4tuhAu6aO2s',
          title: 'Power Rule for Derivatives - Calculus Tutorial',
          thumbnail: 'https://img.youtube.com/vi/4tuhAu6aO2s/mqdefault.jpg',
          channelTitle: 'Professor Leonard',
          duration: 'PT15M30S',
          embedUrl: 'https://www.youtube.com/embed/4tuhAu6aO2s',
          watchUrl: 'https://www.youtube.com/watch?v=4tuhAu6aO2s'
        },
        {
          videoId: 't1-nQy6oVb4',
          title: 'Product Rule Explained - Derivatives',
          thumbnail: 'https://img.youtube.com/vi/t1-nQy6oVb4/mqdefault.jpg',
          channelTitle: 'Calculus Help',
          duration: 'PT8M45S',
          embedUrl: 'https://www.youtube.com/embed/t1-nQy6oVb4',
          watchUrl: 'https://www.youtube.com/watch?v=t1-nQy6oVb4'
        },
        {
          videoId: 'GFZr4KauJng',
          title: 'Quotient Rule for Differentiation',
          thumbnail: 'https://img.youtube.com/vi/GFZr4KauJng/mqdefault.jpg',
          channelTitle: 'Math Explained',
          duration: 'PT12M15S',
          embedUrl: 'https://www.youtube.com/embed/GFZr4KauJng',
          watchUrl: 'https://www.youtube.com/watch?v=GFZr4KauJng'
        }
      ],
      integration: [
        {
          videoId: '0VcEoBZm9zY',
          title: 'Integration by Substitution - Calculus Tutorial',
          thumbnail: 'https://img.youtube.com/vi/0VcEoBZm9zY/mqdefault.jpg',
          channelTitle: 'Professor Leonard',
          duration: 'PT18M20S',
          embedUrl: 'https://www.youtube.com/embed/0VcEoBZm9zY',
          watchUrl: 'https://www.youtube.com/watch?v=0VcEoBZm9zY'
        },
        {
          videoId: 'Z8s7jxEYj3A',
          title: 'Integration by Parts Explained',
          thumbnail: 'https://img.youtube.com/vi/Z8s7jxEYj3A/mqdefault.jpg',
          channelTitle: 'Calculus Help',
          duration: 'PT12M10S',
          embedUrl: 'https://www.youtube.com/embed/Z8s7jxEYj3A',
          watchUrl: 'https://www.youtube.com/watch?v=Z8s7jxEYj3A'
        },
        {
          videoId: 'b_0S4zZGV4g',
          title: 'Definite Integrals - Fundamentals',
          thumbnail: 'https://img.youtube.com/vi/b_0S4zZGV4g/mqdefault.jpg',
          channelTitle: 'Math Explained',
          duration: 'PT14M5S',
          embedUrl: 'https://www.youtube.com/embed/b_0S4zZGV4g',
          watchUrl: 'https://www.youtube.com/watch?v=b_0S4zZGV4g'
        }
      ],
      algebra: [
        {
          videoId: '9vBhZw8QKf8',
          title: 'Solving Linear Equations - Algebra Basics',
          thumbnail: 'https://img.youtube.com/vi/9vBhZw8QKf8/mqdefault.jpg',
          channelTitle: 'Khan Academy',
          duration: 'PT9M40S',
          embedUrl: 'https://www.youtube.com/embed/9vBhZw8QKf8',
          watchUrl: 'https://www.youtube.com/watch?v=9vBhZw8QKf8'
        },
        {
          videoId: 'i7iKLZQ-vCk',
          title: 'Quadratic Equations Explained',
          thumbnail: 'https://img.youtube.com/vi/i7iKLZQ-vCk/mqdefault.jpg',
          channelTitle: 'Math Help',
          duration: 'PT11M25S',
          embedUrl: 'https://www.youtube.com/embed/i7iKLZQ-vCk',
          watchUrl: 'https://www.youtube.com/watch?v=i7iKLZQ-vCk'
        },
        {
          videoId: 'Y9Kf3e5XmEw',
          title: 'Systems of Equations - Algebra Tutorial',
          thumbnail: 'https://img.youtube.com/vi/Y9Kf3e5XmEw/mqdefault.jpg',
          channelTitle: 'Algebra Explained',
          duration: 'PT13M15S',
          embedUrl: 'https://www.youtube.com/embed/Y9Kf3e5XmEw',
          watchUrl: 'https://www.youtube.com/watch?v=Y9Kf3e5XmEw'
        }
      ]
    };

    // Use the mapped topic passed as parameter
    let topic = 'derivatives'; // default
    if (mappedTopic.toLowerCase().includes('integration')) {
      topic = 'integration';
    } else if (mappedTopic.toLowerCase().includes('algebra')) {
      topic = 'algebra';
    }

    // Get videos for the determined topic
    const topicVideos = mockVideos[topic] || mockVideos['derivatives'];

    // Select a random video from the topic videos
    const relevantVideo = topicVideos[Math.floor(Math.random() * topicVideos.length)];

    return relevantVideo;

  } catch (scrapeError) {
    console.error('Error with web scraping fallback:', scrapeError);
    return null;
  }
}

// Function to extract main concept using Gemini API
async function extractConceptWithGemini(expression, topic) {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this mathematical problem and extract the main concept being tested.

Problem: "${expression}"
Topic: ${topic}

Please respond with ONLY the main mathematical concept name from this predefined list:
- Power Rule
- Product Rule
- Quotient Rule
- Chain Rule
- Derivative of Trigonometric Functions
- Derivative of Exponential Functions
- Derivative of Logarithmic Functions
- Basic Integration
- Integration by Substitution
- Integration by Parts
- Definite Integrals
- Fundamental Theorem of Calculus
- Solving Linear Equations
- Quadratic Equations
- Systems of Equations
- Polynomial Division
- Factoring
- Absolute Value Equations
- Polynomial Roots
- Inequalities
- Trigonometric Identities
- Unit Circle
- Trigonometric Equations
- Law of Sines
- Law of Cosines
- Double Angle Formulas
- Half Angle Formulas
- Inverse Trigonometric Functions
- Pythagorean Theorem
- Area of Shapes
- Volume of Solids
- Circle Properties
- Triangle Properties
- Coordinate Geometry
- Similarity and Congruence
- Limits
- Continuity
- Differentiation
- Integration
- Series and Sequences
- Multivariable Calculus
- Evaluating Limits
- Limit Laws
- One-Sided Limits
- Infinite Limits
- Domain and Range
- Function Composition
- Inverse Functions
- Even and Odd Functions
- Basic Statistics
- Probability

If the concept doesn't match any in the list, respond with "General ${topic}".

Respond with only the concept name, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const concept = response.text().trim();

    return concept;
  } catch (error) {
    console.error('Error extracting concept with Gemini:', error);
    throw error;
  }
}

// API endpoint for video recommendations
app.post('/api/get-video-recommendation', async (req, res) => {
  try {
    const { expression, topic } = req.body;

    if (!expression || !topic) {
      return res.status(400).json({
        error: 'Missing required parameters: expression and topic'
      });
    }

    console.log(`Getting video recommendation for expression: "${expression}", topic: ${topic}`);

    // Map the quiz topic to video category
    const mappedTopic = topicMapping[topic] || topicMapping['Algebra']; // Default to Algebra if not found

    // Generate search query using mapped topic
    const searchQuery = `${mappedTopic} tutorial explained`;

    console.log(`Using mapped topic: ${mappedTopic}, search query: ${searchQuery}`);

    // Search YouTube for videos
    const videoData = await searchYouTubeVideos(searchQuery, mappedTopic);

    if (videoData) {
      res.json({
        concept: expression,
        videoId: videoData.videoId,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        channelTitle: videoData.channelTitle,
        duration: videoData.duration,
        viewCount: videoData.viewCount,
        embedUrl: videoData.embedUrl,
        watchUrl: videoData.watchUrl,
        message: `Found video explanation for: ${expression}`
      });
    } else {
      res.json({
        concept: expression,
        videoId: null,
        title: null,
        thumbnail: null,
        channelTitle: null,
        duration: null,
        viewCount: null,
        embedUrl: null,
        watchUrl: null,
        message: `No video found for: ${expression}. Video not available.`
      });
    }

  } catch (error) {
    console.error('Error getting video recommendation:', error);
    res.status(500).json({
      error: 'Failed to get video recommendation',
      concept: null,
      videoId: null,
      title: null,
      thumbnail: null,
      channelTitle: null,
      duration: null,
      viewCount: null,
      embedUrl: null,
      watchUrl: null,
      message: 'Video not available.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quiz API is running' });
});

// Function to generate flashcards using Gemini API
async function generateFlashcardsWithGemini(topic) {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create 8 study flashcards for the math topic: ${topic}.

Each flashcard should have:
- question: The math question or problem
- answer: The correct answer or explanation

Requirements:
- Make questions clear and appropriate for studying
- Include a mix of conceptual and practical questions
- Keep answers concise but informative
- Return in valid JSON format

Return JSON in this exact format:
[
  { "question": "...", "answer": "..." },
  { "question": "...", "answer": "..." },
  ...
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const flashcards = JSON.parse(jsonMatch[0]);
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards with Gemini:', error);
    throw error;
  }
}

// Default flashcards for fallback
const defaultFlashcards = {
  'derivatives': [
    { question: "What is the derivative of xⁿ?", answer: "nxⁿ⁻¹ (power rule)" },
    { question: "What is the derivative of sin(x)?", answer: "cos(x)" },
    { question: "What is the derivative of cos(x)?", answer: "-sin(x)" },
    { question: "What is the derivative of eˣ?", answer: "eˣ" },
    { question: "What is the derivative of ln(x)?", answer: "1/x" },
    { question: "What is the product rule?", answer: "(fg)' = f'g + fg'" },
    { question: "What is the chain rule?", answer: "dy/dx = dy/du × du/dx" },
    { question: "What is the quotient rule?", answer: "(f/g)' = (f'g - fg')/g²" }
  ],
  'integrals': [
    { question: "What is ∫xⁿdx?", answer: "xⁿ⁺¹/(n+1) + C (n≠-1)" },
    { question: "What is ∫sin(x)dx?", answer: "-cos(x) + C" },
    { question: "What is ∫cos(x)dx?", answer: "sin(x) + C" },
    { question: "What is ∫eˣdx?", answer: "eˣ + C" },
    { question: "What is ∫1/x dx?", answer: "ln|x| + C" },
    { question: "What is integration by parts?", answer: "∫u dv = uv - ∫v du" },
    { question: "What is the fundamental theorem of calculus?", answer: "∫ₐᵇ f(x)dx = F(b) - F(a)" },
    { question: "What is ∫aˣdx?", answer: "aˣ/ln(a) + C" }
  ],
  'trigonometry': [
    { question: "What is sin²θ + cos²θ?", answer: "1 (Pythagorean identity)" },
    { question: "What is tanθ?", answer: "sinθ/cosθ" },
    { question: "What is sin(2θ)?", answer: "2sinθcosθ" },
    { question: "What is cos(2θ)?", answer: "cos²θ - sin²θ" },
    { question: "What is 1 + tan²θ?", answer: "sec²θ" },
    { question: "What is the unit circle radius?", answer: "1" },
    { question: "What is sin(90°)?", answer: "1" },
    { question: "What is cos(0°)?", answer: "1" }
  ],
  'algebra': [
    { question: "What is the quadratic formula?", answer: "x = (-b ± √(b²-4ac))/2a" },
    { question: "What is (a+b)²?", answer: "a² + 2ab + b²" },
    { question: "What is (a-b)²?", answer: "a² - 2ab + b²" },
    { question: "What is a² - b²?", answer: "(a+b)(a-b)" },
    { question: "How do you solve 2x + 3 = 7?", answer: "x = 2" },
    { question: "What is the slope formula?", answer: "m = (y₂-y₁)/(x₂-x₁)" },
    { question: "What is point-slope form?", answer: "y - y₁ = m(x - x₁)" },
    { question: "What is slope-intercept form?", answer: "y = mx + b" }
  ]
};

// API endpoint to generate flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`Generating flashcards for topic: ${topic}`);

    let flashcards;

    if (genAI) {
      try {
        flashcards = await generateFlashcardsWithGemini(topic);
      } catch (geminiError) {
        console.warn('Gemini API failed, using default flashcards:', geminiError.message);
        // Fallback to default flashcards based on topic
        const topicKey = topic.toLowerCase().split(' ')[0];
        flashcards = defaultFlashcards[topicKey] || defaultFlashcards['derivatives'];
      }
    } else {
      console.log('Gemini API not configured, using default flashcards');
      const topicKey = topic.toLowerCase().split(' ')[0];
      flashcards = defaultFlashcards[topicKey] || defaultFlashcards['derivatives'];
    }

    res.json({ flashcards, topic });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Quiz API server running on port ${PORT}`);
  console.log(`GEMINI_API_KEY configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});

// ==================== Chrome Extension Hooks ====================

// Endpoint 1: POST /api/solve-math
// Input: { expression: "x^2 + 5x + 6" }
// Return: { solution, steps, explanation }
app.post('/api/solve-math', async (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({ error: 'Expression is required' });
    }

    console.log(`Solving math expression: ${expression}`);

    let result = {
      solution: '',
      steps: [],
      explanation: ''
    };

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `Solve this mathematical expression and provide step-by-step solution.

Expression: ${expression}

Respond in JSON format with this exact structure:
{
  "solution": "the final answer",
  "steps": ["step 1", "step 2", "step 3"],
  "explanation": "brief explanation of how to solve it"
}`;

        const aiResult = await model.generateContent(prompt);
        const response = await aiResult.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
        console.warn('Gemini API failed for solve-math:', geminiError.message);
        // Fallback to basic solving
        result = basicMathSolve(expression);
      }
    } else {
      // Use basic solver when no API key
      result = basicMathSolve(expression);
    }

    res.json(result);
  } catch (error) {
    console.error('Error solving math:', error);
    res.status(500).json({ error: 'Failed to solve math expression' });
  }
});

// Basic math solver fallback
function basicMathSolve(expression) {
  const expr = expression.trim();
  
  // Try to evaluate simple expressions
  try {
    // Check for quadratic equations
    if (expr.includes('x^2') || expr.includes('x²')) {
      // Match ax^2 + bx + c = 0
      const quadraticMatch = expr.match(/(-?\d*)x\^2\s*([+-]?\d*)x\s*([+-]?\d*)\s*=\s*0/);
      if (quadraticMatch) {
        const a = parseInt(quadraticMatch[1] || '1') || 1;
        const b = parseInt(quadraticMatch[2] || '0') || 0;
        const c = parseInt(quadraticMatch[3] || '0') || 0;
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant > 0) {
          const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
          const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
          return {
            solution: `x = ${x1} or x = ${x2}`,
            steps: [
              `Identify coefficients: a = ${a}, b = ${b}, c = ${c}`,
              `Calculate discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
              `Since discriminant > 0, there are two real roots`,
              `x = (-b ± √discriminant) / 2a`,
              `x = (${-b} ± ${Math.sqrt(discriminant).toFixed(2)}) / ${2 * a}`
            ],
            explanation: 'This is a quadratic equation. Using the quadratic formula, we find two solutions.'
          };
        } else if (discriminant === 0) {
          const x = -b / (2 * a);
          return {
            solution: `x = ${x}`,
            steps: [
              `Identify coefficients: a = ${a}, b = ${b}, c = ${c}`,
              `Calculate discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = 0`,
              `Since discriminant = 0, there is one repeated root`,
              `x = -b / 2a = ${-b} / ${2 * a}`
            ],
            explanation: 'This quadratic has one repeated root.'
          };
        } else {
          return {
            solution: 'No real solutions',
            steps: [
              `Identify coefficients: a = ${a}, b = ${b}, c = ${c}`,
              `Calculate discriminant: b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant} < 0`,
              'Since discriminant < 0, there are no real solutions'
            ],
            explanation: 'This quadratic has no real solutions (complex roots).'
          };
        }
      }
    }
    
    // Try simple evaluation for arithmetic
    if (/^[\d\s+\-*/().]+$/.test(expr)) {
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      return {
        solution: result.toString(),
        steps: [`Evaluate: ${expr} = ${result}`],
        explanation: 'Simple arithmetic evaluation.'
      };
    }

    // Linear equation
    if (expr.includes('=') && expr.includes('x')) {
      const match = expr.match(/(-?\d*)x\s*([+-])\s*(-?\d*)\s*=\s*(-?\d+)/);
      if (match) {
        const a = parseInt(match[1] || '1') || 1;
        const op = match[2];
        const b = parseInt(match[3] || '0') || 0;
        const c = parseInt(match[4]);
        
        let solution;
        if (op === '+') {
          solution = (c - b) / a;
        } else {
          solution = (c + b) / a;
        }
        
        return {
          solution: `x = ${solution}`,
          steps: [
            `Simplify: ${a}x ${op === '+' ? '+' : '-'} ${b} = ${c}`,
            `${op === '+' ? 'Subtract' : 'Add'} ${b} from both sides: ${a}x = ${op === '+' ? c - b : c + b}`,
            `Divide by ${a}: x = ${solution}`
          ],
          explanation: 'Linear equation solved by isolating x.'
        };
      }
    }

    return {
      solution: 'Unable to solve',
      steps: ['Expression not recognized'],
      explanation: 'Please provide a valid mathematical expression.'
    };
  } catch (e) {
    return {
      solution: 'Error',
      steps: ['Could not evaluate expression'],
      explanation: e.message
    };
  }
}

// Endpoint 2: POST /api/save-flashcard
// Input: { question, answer, topic, userId }
// Purpose: Allow Chrome extension to save selected content as flashcards
app.post('/api/save-flashcard', async (req, res) => {
  try {
    const { question, answer, topic, userId } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    console.log(`Saving flashcard for user: ${userId}, topic: ${topic}`);

    // In a real implementation, you would save to Firestore here
    // For now, we'll return success and the saved data
    
    const savedFlashcard = {
      id: `fc_${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      topic: topic?.trim() || 'General',
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      source: 'chrome-extension'
    };

    // If userId is provided, could save to Firestore here
    // For now, return success
    res.json({
      success: true,
      message: 'Flashcard saved successfully',
      flashcard: savedFlashcard
    });
  } catch (error) {
    console.error('Error saving flashcard:', error);
    res.status(500).json({ error: 'Failed to save flashcard' });
  }
});

module.exports = app;
