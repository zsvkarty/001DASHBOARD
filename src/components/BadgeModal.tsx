import React, { useEffect, useState } from 'react';
import { Badge, BadgeModalProps } from '../types';

const BadgeModal: React.FC<BadgeModalProps> = ({ badge, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen && badge?.isNew) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, badge?.isNew]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'streak':
        return 'from-red-400 to-orange-500';
      case 'flashcard':
        return 'from-blue-400 to-indigo-500';
      case 'audiobook':
        return 'from-purple-400 to-pink-500';
      case 'textbook':
        return 'from-green-400 to-teal-500';
      case 'exercise':
        return 'from-yellow-400 to-orange-500';
      case 'general':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'streak':
        return 'Série';
      case 'flashcard':
        return 'Kartičky';
      case 'audiobook':
        return 'Audioknihy';
      case 'textbook':
        return 'Učebnice';
      case 'exercise':
        return 'Cvičení';
      case 'general':
        return 'Obecné';
      default:
        return 'Neznámé';
    }
  };

  if (!isOpen || !badge) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 backdrop-blur-sm
        transition-opacity duration-200
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Confetti particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-2 h-2 rounded-full
                animate-bounce
                ${i % 4 === 0 ? 'bg-yellow-400' : ''}
                ${i % 4 === 1 ? 'bg-blue-400' : ''}
                ${i % 4 === 2 ? 'bg-red-400' : ''}
                ${i % 4 === 3 ? 'bg-green-400' : ''}
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl
          max-w-md w-full mx-4 p-6
          transform transition-all duration-200
          ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
          ${showCelebration ? 'animate-pulse' : ''}
        `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Zavřít"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* New Badge Indicator */}
        {badge.isNew && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            NOVÝ!
          </div>
        )}

        {/* Badge Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`
              w-24 h-24 rounded-3xl shadow-lg flex items-center justify-center
              bg-gradient-to-br ${getCategoryColor(badge.category)}
              transform transition-transform duration-300
              ${showCelebration ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
            `}
          >
            <span className="text-5xl filter drop-shadow-lg">
              {badge.icon}
            </span>
            
            {/* Level Indicator */}
            {badge.maxLevel > 1 && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {badge.level}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Badge Information */}
        <div className="text-center space-y-4">
          {/* Badge Name */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {badge.name}
          </h2>

          {/* Badge Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {badge.description}
          </p>

          {/* Badge Category */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getCategoryName(badge.category)}
            </span>
          </div>

          {/* Level Progress */}
          {badge.maxLevel > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Úroveň {badge.level} z {badge.maxLevel}</span>
                <span>{Math.round((badge.level / badge.maxLevel) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(badge.category)} transition-all duration-500`}
                  style={{ width: `${(badge.level / badge.maxLevel) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Získáno: {new Date(badge.earnedDate).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Požadavky:
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {badge.requirements.type === 'streak' && `Udržet sérii ${badge.requirements.threshold} dní`}
              {badge.requirements.type === 'xp' && `Získat ${badge.requirements.threshold} XP`}
              {badge.requirements.type === 'completion' && badge.requirements.activity && 
                `Dokončit ${badge.requirements.threshold} aktivit typu ${getCategoryName(badge.requirements.activity || '')}`}
              {badge.requirements.type === 'accuracy' && `Dosáhnout ${badge.requirements.threshold}% přesnosti`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleClose}
            className={`
              px-6 py-3 rounded-2xl font-semibold text-white
              bg-gradient-to-r ${getCategoryColor(badge.category)}
              hover:shadow-lg transform hover:scale-105
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            {badge.isNew ? 'Skvělé!' : 'Zavřít'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;