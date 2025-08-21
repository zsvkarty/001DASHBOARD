import React, { useEffect, useState } from 'react';
import { StreakDisplayProps } from '../types';

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, className = '' }) => {
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(streak);

  // Check for milestone achievements and trigger animation
  useEffect(() => {
    const milestones = [3, 7, 30, 100];
    const wasMilestone = milestones.includes(previousStreak);
    const isMilestone = milestones.includes(streak);
    
    // Trigger animation if we just reached a milestone
    if (streak > previousStreak && isMilestone && !wasMilestone) {
      setShowMilestoneAnimation(true);
      setTimeout(() => setShowMilestoneAnimation(false), 2000);
    }
    
    setPreviousStreak(streak);
  }, [streak, previousStreak]);



  const getStreakMessage = () => {
    if (streak === 0) return 'Začni svou sérii!';
    if (streak === 1) return '1 den v řadě!';
    if (streak < 5) return `${streak} dny v řadě!`;
    return `${streak} dní v řadě!`;
  };

  const getMilestoneMessage = () => {
    if (streak >= 100) return '🏆 Neuvěřitelná série!';
    if (streak >= 30) return '🎉 Měsíční série!';
    if (streak >= 7) return '✨ Týdenní série!';
    if (streak >= 3) return '🔥 Skvělý začátek!';
    return '';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Animated flame emoji */}
      <div className="relative">
        <div 
          className={`
            text-3xl md:text-4xl transition-all duration-500 transform
            ${showMilestoneAnimation ? 'scale-125 animate-bounce' : 'scale-100'}
            ${streak === 0 ? 'grayscale opacity-50' : ''}
            hover:scale-110
          `}
          style={{
            animation: streak > 0 
              ? 'fadeInScale 1.2s ease-out, breathe 2s ease-in-out infinite 1.2s'
              : 'fadeInScale 1.2s ease-out'
          }}
        >
          🔥
        </div>
        
        {/* Milestone celebration animation */}
        {showMilestoneAnimation && (
          <div className="absolute -top-2 -right-2 animate-ping">
            <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-75"></div>
          </div>
        )}
      </div>

      {/* Streak information */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span 
            className={`
              font-bold text-lg md:text-xl transition-colors duration-300
              ${streak >= 7 ? 'text-orange-100' : 
                streak >= 3 ? 'text-yellow-100' : 
                'text-white'}
            `}
          >
            {getStreakMessage()}
          </span>
          
          {/* Milestone badge */}
          {streak >= 3 && (
            <span 
              className={`
                px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 border border-yellow-200 border-opacity-60
                ${showMilestoneAnimation ? 'animate-pulse scale-110' : 'scale-100'}
                bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 backdrop-blur-sm shadow-lg
              `}
            >
              {getMilestoneMessage()}
            </span>
          )}
        </div>
        
        {/* Encouragement text for low streaks */}
        {streak < 3 && (
          <span className="text-sm text-blue-100 font-medium">
            {streak === 0 ? 'Dokončete aktivitu pro začátek série' : 'Pokračujte každý den!'}
          </span>
        )}
        
        {/* Next milestone indicator */}
        {streak > 0 && streak < 100 && (
          <span className="text-xs text-blue-200 font-medium">
            {streak < 3 ? `${3 - streak} dní do první odznaky` :
             streak < 7 ? `${7 - streak} dní do týdenní série` :
             streak < 30 ? `${30 - streak} dní do měsíční série` :
             `${100 - streak} dní do stoleté série`}
          </span>
        )}
      </div>
    </div>
  );
};

export default StreakDisplay;