import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlashcardDisplayProps } from '../types';

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ 
  card, 
  isFlipped, 
  onFlip,
  onKnown,
  onUnknown
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeState, setSwipeState] = useState({
    isActive: false,
    direction: null as 'left' | 'right' | null,
    distance: 0,
    deltaX: 0,
    deltaY: 0,
    startX: 0,
    startY: 0
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFlip = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onFlip();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, onFlip]);

  const handleCardClick = () => {
    handleFlip();
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Handle spacebar for flipping
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault(); // Prevent page scrolling
      handleFlip();
    }
    
    // Handle arrow keys for known/unknown actions (only when flipped)
    if (isFlipped && onKnown && onUnknown) {
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        onKnown();
      } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
        event.preventDefault();
        onUnknown();
      }
    }
  }, [handleFlip, isFlipped, onKnown, onUnknown]);

  // Touch event handlers for swipe gestures using native events
  const handleTouchStart = useCallback((event: TouchEvent) => {
    // Only handle swipes when card is flipped and actions are available
    if (!isFlipped || !onKnown || !onUnknown || isAnimating) return;
    
    const touch = event.touches[0];
    setSwipeState({
      isActive: true,
      direction: null,
      distance: 0,
      deltaX: 0,
      deltaY: 0,
      startX: touch.clientX,
      startY: touch.clientY
    });
  }, [isFlipped, onKnown, onUnknown, isAnimating]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!swipeState.isActive || !isFlipped) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    
    // Only process horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    
    // Prevent default to avoid scrolling during horizontal swipes
    event.preventDefault();
    
    const distance = Math.abs(deltaX);
    const direction = deltaX > 0 ? 'right' : 'left';
    
    setSwipeState(prev => ({
      ...prev,
      direction,
      distance,
      deltaX,
      deltaY
    }));
  }, [swipeState.isActive, swipeState.startX, swipeState.startY, isFlipped]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!swipeState.isActive || !isFlipped) {
      setSwipeState({
        isActive: false,
        direction: null,
        distance: 0,
        deltaX: 0,
        deltaY: 0,
        startX: 0,
        startY: 0
      });
      return;
    }
    
    const swipeThreshold = 100; // Minimum distance for a valid swipe
    
    if (swipeState.distance > swipeThreshold) {
      // Execute the appropriate action based on swipe direction
      if (swipeState.direction === 'right' && onKnown) {
        onKnown();
      } else if (swipeState.direction === 'left' && onUnknown) {
        onUnknown();
      }
    }
    
    // Reset swipe state
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      deltaX: 0,
      deltaY: 0,
      startX: 0,
      startY: 0
    });
  }, [swipeState.isActive, swipeState.distance, swipeState.direction, isFlipped, onKnown, onUnknown]);

  // Add keyboard and touch event listeners on component mount and cleanup on unmount
  useEffect(() => {
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Add touch event listeners with proper passive settings
    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      cardElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (cardElement) {
        cardElement.removeEventListener('touchstart', handleTouchStart);
        cardElement.removeEventListener('touchmove', handleTouchMove);
        cardElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleKeyPress, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="flex items-center justify-center min-h-96 p-4">
      <div className="relative w-full max-w-2xl">
        {/* Card Container with 3D perspective */}
        <div 
          ref={cardRef}
          className="relative h-80 cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          aria-label={`Flashcard: ${card.question}. ${isFlipped ? 'Showing answer' : 'Click to reveal answer'}`}
          aria-pressed={isFlipped}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick();
            }
          }}
        >
          {/* Swipe Visual Feedback Overlay */}
          {swipeState.isActive && swipeState.direction && swipeState.distance > 5 && (
            <div 
              className={`
                absolute inset-0 z-10 flex items-center justify-center
                rounded-xl transition-all duration-100 ease-out
                ${swipeState.direction === 'right' 
                  ? 'bg-green-500/20 border-2 border-green-500/50' 
                  : 'bg-red-500/20 border-2 border-red-500/50'
                }
              `}
              style={{
                opacity: Math.min(swipeState.distance / 80, 0.8)
              }}
            >
              <div 
                className={`
                  text-6xl transition-all duration-100 ease-out
                  ${swipeState.direction === 'right' ? 'text-green-500' : 'text-red-500'}
                `}
                style={{
                  transform: `scale(${Math.min(0.5 + (swipeState.distance / 100), 1.2)})`,
                  opacity: Math.min(swipeState.distance / 60, 1)
                }}
              >
                {swipeState.direction === 'right' ? '✅' : '❌'}
              </div>
            </div>
          )}
          
          {/* Flip Container */}
          <div
            className={`
              relative w-full h-full
              ${!swipeState.isActive ? 'transition-transform duration-300 ease-in-out' : ''}
              ${isFlipped ? 'rotate-y-180' : ''}
            `}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `
                rotateY(${isFlipped ? '180deg' : '0deg'}) 
                translateX(${swipeState.isActive && swipeState.deltaX ? `${(isFlipped ? -1 : 1) * swipeState.deltaX * 0.8}px` : '0px'}) 
                rotateZ(${swipeState.isActive && swipeState.deltaX ? `${(isFlipped ? -1 : 1) * swipeState.deltaX * 0.1}deg` : '0deg'})
                scale(${swipeState.isActive && swipeState.distance > 10 ? Math.max(0.95, 1 - (swipeState.distance * 0.0005)) : '1'})
              `,
              transition: swipeState.isActive ? 'none' : 'transform 0.3s ease-in-out'
            }}
          >
            {/* Front Side (Question) */}
            <div
              className={`
                absolute inset-0 w-full h-full
                bg-white dark:bg-gray-800 
                border-2 border-gray-200 dark:border-gray-700
                rounded-xl shadow-lg
                flex items-center justify-center p-8
                backface-hidden
              `}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">
                  Otázka
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {card.question}
                </h2>
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  Klikni nebo stiskni mezerník pro zobrazení odpovědi
                </div>
              </div>
            </div>

            {/* Back Side (Answer) */}
            <div
              className={`
                absolute inset-0 w-full h-full
                bg-green-50 dark:bg-green-900/20 
                border-2 border-green-200 dark:border-green-700
                rounded-xl shadow-lg
                flex items-center justify-center p-8
                backface-hidden
              `}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-4 uppercase tracking-wide">
                  Odpověď
                </div>
                <p className="text-lg md:text-xl text-gray-900 dark:text-white leading-relaxed">
                  {card.answer}
                </p>
                {card.category && (
                  <div className="mt-6 inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {card.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Instructions */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" 
              />
            </svg>
            {!isFlipped ? (
              'Klikni nebo stiskni mezerník pro otočení karty'
            ) : (
              <span className="text-center">
                <span className="block">⌨️ → nebo Enter pro ✅ Znám | ← nebo Esc pro ❌ Neznám</span>
                <span className="text-xs mt-1 block md:hidden">
                  📱 Swipe doprava pro ✅ Znám, doleva pro ❌ Neznám
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDisplay;