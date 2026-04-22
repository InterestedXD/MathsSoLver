import React, { useState, useEffect } from 'react';

// Activity types to track
const ACTIVITY_TYPES = {
  LOGIN: 'login',
  QUIZ_COMPLETED: 'quiz_completed',
  ARCADE_PLAYED: 'arcade_game_played',
  FLASHCARD_STUDIED: 'flashcard_studied',
  PROBLEM_SOLVED: 'problem_solved'
};

// Color scale for activity intensity
const getActivityColor = (count) => {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
  if (count <= 3) return 'bg-indigo-300 dark:bg-indigo-900';
  if (count <= 6) return 'bg-indigo-500 dark:bg-indigo-700';
  return 'bg-indigo-700 dark:bg-indigo-500';
};

export default function ActivityHeatmap({ userId, compact = false }) {
  const [activityData, setActivityData] = useState({});
  const [totalActions, setTotalActions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    // Load activity data from localStorage
    loadActivityData();
  }, [userId]);

  const loadActivityData = () => {
    const storageKey = userId ? `activity_${userId}` : 'activity_guest';
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const parsed = JSON.parse(data);
      setActivityData(parsed.days || {});
      setTotalActions(parsed.total || 0);
      setCurrentStreak(parsed.currentStreak || 0);
      setLongestStreak(parsed.longestStreak || 0);
    } else {
      // Generate sample data for demo
      generateSampleData();
    }
  };

  const generateSampleData = () => {
    const days = {};
    const today = new Date();
    
    // Generate 365 days of data
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random activity (0-8 actions)
      const count = Math.random() > 0.3 ? Math.floor(Math.random() * 8) : 0;
      if (count > 0) {
        days[dateStr] = count;
      }
    }
    
    setActivityData(days);
    setTotalActions(Object.values(days).reduce((a, b) => a + b, 0));
    setCurrentStreak(calculateStreak(days));
    setLongestStreak(calculateStreak(days));
  };

  const calculateStreak = (days) => {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (days[dateStr] && days[dateStr] > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Generate weeks and days for the heatmap
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    
    // Adjust to start from Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    let currentWeek = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = activityData[dateStr] || 0;
      
      currentWeek.push({
        date: dateStr,
        count,
        day: currentDate.getDay(),
        month: currentDate.getMonth()
      });
      
      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const heatmapData = generateHeatmapData();

  if (compact) {
    // Compact view for profile/dashboard
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {heatmapData.slice(-10).map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)}`}
                  title={`${day.date}: ${day.count} actions`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          <span className="font-medium text-indigo-500">{currentStreak}</span> day streak
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h3>
          <p className="text-sm text-gray-500">{totalActions} total actions</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-500">{currentStreak}</p>
            <p className="text-xs text-gray-500">Current Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{longestStreak}</p>
            <p className="text-xs text-gray-500">Longest Streak</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {days.map((day, idx) => (
              <div key={idx} className="h-3 text-xs text-gray-400 w-8">
                {idx % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* Weeks */}
          {heatmapData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {/* Month label */}
              {week[0] && (
                <div className="h-3 text-xs text-gray-400">
                  {week[0].day === 0 ? months[week[0].month] : ''}
                </div>
              )}
              
              {/* Days */}
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} cursor-pointer transition-transform hover:scale-125`}
                  title={`${day.date}: ${day.count} actions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-indigo-300 dark:bg-indigo-900" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-700" />
          <div className="w-3 h-3 rounded-sm bg-indigo-700 dark:bg-indigo-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

// Helper function to track activity
export const trackActivity = (type, userId) => {
  const storageKey = userId ? `activity_${userId}` : 'activity_guest';
  const today = new Date().toISOString().split('T')[0];
  
  let data = localStorage.getItem(storageKey);
  if (data) {
    data = JSON.parse(data);
  } else {
    data = { days: {}, total: 0, currentStreak: 0, longestStreak: 0 };
  }
  
  // Increment today's count
  data.days[today] = (data.days[today] || 0) + 1;
  data.total += 1;
  
  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (data.days[yesterdayStr] && data.days[yesterdayStr] > 0) {
    data.currentStreak += 1;
  } else if (!data.days[today] || data.days[today] === 1) {
    data.currentStreak = 1;
  }
  
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  
  localStorage.setItem(storageKey, JSON.stringify(data));
};

