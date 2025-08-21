import React, { useState } from 'react';
import { Badge, BadgeDisplayProps } from '../types';

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  badges, 
  onBadgeClick, 
  className = '' 
}) => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Sort badges by earned date (newest first) and limit to display
  const displayBadges = badges
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    .slice(0, 6); // Show max 6 badges

  const handleBadgeClick = (badge: Badge) => {
    onBadgeClick(badge);
  };

  const handleMouseEnter = (badgeId: string) => {
    setHoveredBadge(badgeId);
  };

  const handleMouseLeave = () => {
    setHoveredBadge(null);
  };

  if (badges.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          Získejte své první odznaky dokončením aktivit!
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="relative group"
          onMouseEnter={() => handleMouseEnter(badge.id)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Badge Button */}
          <button
            onClick={() => handleBadgeClick(badge)}
            className={`
              relative flex items-center justify-center
              w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
              rounded-2xl shadow-lg
              transition-all duration-200 ease-in-out
              transform hover:scale-110 hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${badge.isNew 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' 
                : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }
              ${hoveredBadge === badge.id ? 'rotate-3' : ''}
            `}
            aria-label={`Badge: ${badge.name}`}
          >
            {/* Badge Icon */}
            <span className="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-sm">
              {badge.icon}
            </span>
            
            {/* New Badge Indicator */}
            {badge.isNew && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
            
            {/* Level Indicator for multi-level badges */}
            {badge.maxLevel > 1 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {badge.level}
                </span>
              </div>
            )}
          </button>

          {/* Tooltip */}
          {hoveredBadge === badge.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-48 text-center">
                <div className="font-semibold">{badge.name}</div>
                <div className="text-gray-300 dark:text-gray-400 mt-1">
                  {badge.description}
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Získáno: {new Date(badge.earnedDate).toLocaleDateString('cs-CZ')}
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Show more indicator if there are more badges */}
      {badges.length > 6 && (
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 shadow-lg">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            +{badges.length - 6}
          </span>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;