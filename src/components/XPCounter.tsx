import React from 'react';
import { useGamification } from '../contexts/GamificationContext';

interface XPCounterProps {
  className?: string;
}

const XPCounter: React.FC<XPCounterProps> = ({ className = '' }) => {
  const { xp, calculateLevel, getXPNeededForNextLevel } = useGamification();
  
  const currentLevel = calculateLevel(xp.total);
  const levelProgress = getXPNeededForNextLevel(xp.total);
  const progressPercentage = Math.min((levelProgress.current / levelProgress.needed) * 100, 100);
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Level Display */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
          <span className="text-white font-bold text-xs">{currentLevel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Lvl {currentLevel}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {levelProgress.current} / {levelProgress.needed} XP
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="flex-1 min-w-0">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/* Progress text for larger screens */}
        <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {levelProgress.needed - levelProgress.current} XP to Lvl {levelProgress.nextLevel}
        </div>
      </div>
    </div>
  );
};

export default XPCounter;