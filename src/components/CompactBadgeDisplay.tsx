import React, { useState } from 'react';
import { Badge } from '../types';
import BadgeModal from './BadgeModal';

interface CompactBadgeDisplayProps {
  badges: Badge[];
  className?: string;
}

const CompactBadgeDisplay: React.FC<CompactBadgeDisplayProps> = ({ 
  badges, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the latest badge (most recent)
  const latestBadge = badges.length > 0 
    ? badges.reduce((latest, badge) => 
        new Date(badge.earnedDate) > new Date(latest.earnedDate) ? badge : latest
      )
    : null;

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
    setIsExpanded(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBadge(null);
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Compact Badge Icon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        title={`${badges.length} odznaky`}
      >
        <span className="sr-only">Badges</span>
        
        {/* Badge Icon */}
        <div className="relative">
          {latestBadge ? (
            <span className="text-lg">{latestBadge.icon}</span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )}
          
          {/* Badge Count */}
          {badges.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {badges.length > 9 ? '9+' : badges.length}
            </span>
          )}
        </div>
      </button>

      {/* Expanded Badge List */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vaše odznaky
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className="group relative p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  title={badge.name}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {badge.name}
                  </div>
                  
                  {/* New badge indicator */}
                  {badge.isNew && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            {badges.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm">Zatím nemáte žádné odznaky</p>
                <p className="text-xs mt-1">Studujte a získejte své první odznaky!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge Modal */}
      <BadgeModal
        badge={selectedBadge}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CompactBadgeDisplay;