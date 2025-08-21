import React, { useState, useEffect } from 'react';
import { StudySession, FlashcardSet } from '../types';
import { mockFlashcardSets } from '../data/mockData';
import FlashcardDisplay from './FlashcardDisplay';
import ActionButtons from './ActionButtons';
import StudySummary from './StudySummary';
import TopicSelection from './TopicSelection';
import TopicHeader from './TopicHeader';
import { useGamification } from '../contexts/GamificationContext';
import { 
  saveProgress, 
  loadProgress
} from '../utils/firebaseStorage';

interface FlashcardModuleProps {
  className?: string;
  preSelectedTopicId?: string | null;
}

const FlashcardModule: React.FC<FlashcardModuleProps> = ({ className = '', preSelectedTopicId }) => {
  const { earnXP } = useGamification();
  
  const [session, setSession] = useState<StudySession>({
    selectedTopic: null,
    cards: [],
    currentIndex: 0,
    knownCards: [],
    unknownCards: [],
    isComplete: false,
    isRevisionMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'known' | 'unknown' | null>(null);

  useEffect(() => {
    // Initialize session - start with topic selection or pre-selected topic
    const initializeSession = () => {
      try {
        // Firebase storage is now ready for cross-device sync

        // Validate flashcard sets data
        if (!mockFlashcardSets || mockFlashcardSets.length === 0) {
          throw new Error('Žádná témata nejsou k dispozici');
        }

        // Validate flashcard sets structure
        const invalidSets = mockFlashcardSets.filter(set => 
          !set.id || !set.title || !set.cards || set.cards.length === 0
        );
        
        if (invalidSets.length > 0) {
          throw new Error('Některá témata obsahují neplatná data');
        }

        // If a topic is pre-selected, automatically select it
        if (preSelectedTopicId) {
          const selectedSet = mockFlashcardSets.find(set => set.id === preSelectedTopicId);
          if (selectedSet) {
            console.log(`Auto-selecting pre-selected topic: ${selectedSet.title}`);
            handleTopicSelect(selectedSet);
            setIsLoading(false);
            return;
          } else {
            console.warn(`Pre-selected topic ID "${preSelectedTopicId}" not found, showing topic selection`);
          }
        }

        // Start with no topic selected - show topic selection
        setSession({
          selectedTopic: null,
          cards: [],
          currentIndex: 0,
          knownCards: [],
          unknownCards: [],
          isComplete: false,
          isRevisionMode: false,
        });
        setError(null);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala neočekávaná chyba');
        setIsLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(initializeSession, 500);
  }, [preSelectedTopicId]);

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Save current progress before component unmounts
      if (session.selectedTopic && (session.knownCards.length > 0 || session.unknownCards.length > 0)) {
        saveSessionProgress(session);
      }
    };
  }, [session]);

  // Auto-save progress periodically and when currentIndex changes
  useEffect(() => {
    if (session.selectedTopic && session.currentIndex > 0) {
      // Save progress when user moves through cards (even without answering)
      const timeoutId = setTimeout(() => {
        saveSessionProgress(session);
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [session.currentIndex, session.selectedTopic, session]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const moveToNextCard = (direction: 'known' | 'unknown') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Add current card to appropriate array based on direction
    const currentCardId = session.cards[session.currentIndex].id;
    const updatedKnownCards = direction === 'known' 
      ? [...session.knownCards, currentCardId]
      : session.knownCards;
    const updatedUnknownCards = direction === 'unknown'
      ? [...session.unknownCards, currentCardId]
      : session.unknownCards;
    
    // Start transition animation
    setTimeout(() => {
      if (session.currentIndex < session.cards.length - 1) {
        const updatedSession = {
          ...session,
          currentIndex: session.currentIndex + 1,
          knownCards: updatedKnownCards,
          unknownCards: updatedUnknownCards
        };
        setSession(updatedSession);
        
        // Save progress after moving to next card
        saveSessionProgress(updatedSession);
        
        setIsFlipped(false); // Reset flip state for next card
      } else {
        // Session completed
        const completedSession = {
          ...session,
          currentIndex: session.currentIndex + 1,
          knownCards: updatedKnownCards,
          unknownCards: updatedUnknownCards,
          isComplete: true
        };
        setSession(completedSession);
        
        // Save completion status to localStorage
        saveSessionProgress(completedSession);
      }
      
      // Complete transition
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionDirection(null);
      }, 150);
    }, 150);
  };

  // Save progress to localStorage
  const saveSessionProgress = (updatedSession: StudySession) => {
    if (!updatedSession.selectedTopic) return;
    
    const progress = {
      currentIndex: updatedSession.currentIndex,
      knownCards: updatedSession.knownCards,
      unknownCards: updatedSession.unknownCards,
      isCompleted: updatedSession.isComplete,
      lastStudied: new Date().toISOString(),
      totalCards: updatedSession.selectedTopic.cards.length
    };
    
    saveProgress(updatedSession.selectedTopic.id, progress).catch(error => 
      console.error('Failed to save flashcard progress:', error)
    );
  };

  const handleKnown = () => {
    if (isTransitioning) return;
    
    // Award XP for known cards
    earnXP(5, 'flashcard');
    
    moveToNextCard('known');
  };

  const handleUnknown = () => {
    if (isTransitioning) return;
    
    // Award XP for unknown cards (less XP, but still reward engagement)
    earnXP(5, 'flashcard');
    
    moveToNextCard('unknown');
  };

  const handleTopicSelect = async (selectedSet: FlashcardSet) => {
    try {
      // Validate selected flashcard set
      if (!selectedSet) {
        throw new Error('Neplatné téma bylo vybráno');
      }
      
      if (!selectedSet.id || !selectedSet.title) {
        throw new Error('Vybrané téma obsahuje neplatná data');
      }
      
      if (!selectedSet.cards || selectedSet.cards.length === 0) {
        throw new Error('Vybrané téma neobsahuje žádné flashkarty');
      }

      // Validate flashcard structure
      const invalidCards = selectedSet.cards.filter(card => 
        !card.id || !card.question || !card.answer
      );
      
      if (invalidCards.length > 0) {
        throw new Error('Některé flashkarty v tomto tématu obsahují neplatná data');
      }

      // Load saved progress from Firebase
      const savedProgress = await loadProgress(selectedSet.id);
      
      let sessionState: StudySession;
      
      if (savedProgress && !savedProgress.isCompleted) {
        // Resume from saved progress
        console.log(`Resuming topic: ${selectedSet.title} from card ${savedProgress.currentIndex + 1}/${savedProgress.totalCards}`);
        
        sessionState = {
          selectedTopic: selectedSet,
          cards: selectedSet.cards,
          currentIndex: Math.min(savedProgress.currentIndex, selectedSet.cards.length - 1), // Ensure index is valid
          knownCards: savedProgress.knownCards,
          unknownCards: savedProgress.unknownCards,
          isComplete: savedProgress.isCompleted,
          isRevisionMode: false,
        };
      } else if (savedProgress && savedProgress.isCompleted) {
        // Topic was completed, but allow restart or revision
        console.log(`Topic ${selectedSet.title} was previously completed. Starting fresh session.`);
        
        sessionState = {
          selectedTopic: selectedSet,
          cards: selectedSet.cards,
          currentIndex: 0,
          knownCards: [],
          unknownCards: [],
          isComplete: false,
          isRevisionMode: false,
        };
      } else {
        // No saved progress, start fresh
        console.log(`Starting new session with topic: ${selectedSet.title} (${selectedSet.cards.length} cards)`);
        
        sessionState = {
          selectedTopic: selectedSet,
          cards: selectedSet.cards,
          currentIndex: 0,
          knownCards: [],
          unknownCards: [],
          isComplete: false,
          isRevisionMode: false,
        };
      }
      
      setSession(sessionState);
      
      // Reset UI state
      setIsFlipped(false);
      setIsTransitioning(false);
      setTransitionDirection(null);
      setError(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání tématu');
      console.error('Error selecting topic:', err);
    }
  };

  const handleBackToTopics = () => {
    // Save current progress before leaving
    if (session.selectedTopic && (session.knownCards.length > 0 || session.unknownCards.length > 0)) {
      saveSessionProgress(session);
    }
    
    // Reset session state completely
    setSession({
      selectedTopic: null,
      cards: [],
      currentIndex: 0,
      knownCards: [],
      unknownCards: [],
      isComplete: false,
      isRevisionMode: false,
    });
    
    // Reset UI state
    setIsFlipped(false);
    setIsTransitioning(false);
    setTransitionDirection(null);
    setError(null);
    
    console.log('Returned to topic selection');
  };

  const handleStartRevision = async () => {
    try {
      // Get saved progress to access the original unknown cards
      const savedProgress = session.selectedTopic ? await loadProgress(session.selectedTopic.id) : null;
      const unknownCardIds = new Set(savedProgress?.unknownCards || session.unknownCards);
      const revisionCards = session.selectedTopic?.cards.filter(card => unknownCardIds.has(card.id)) || [];
      
      // Handle edge case where no unknown cards exist
      if (revisionCards.length === 0) {
        setError('Žádné karty k opakování nejsou k dispozici');
        return;
      }
      
      const revisionSession = {
        ...session,
        cards: revisionCards,
        currentIndex: 0,
        knownCards: [],
        unknownCards: [],
        isComplete: false,
        isRevisionMode: true,
      };
      
      setSession(revisionSession);
      
      setIsFlipped(false);
      setError(null); // Clear any previous errors
      
      console.log(`Starting revision with ${revisionCards.length} unknown cards`);
    } catch (err) {
      setError('Chyba při spuštění opakování');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Načítám flashkarty...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Chyba při načítání
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="
              inline-flex items-center justify-center
              px-6 py-3 
              bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white font-semibold rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            "
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flashcard-module ${className}`}>
      {/* Topic Selection Screen */}
      {!session.selectedTopic && (
        <TopicSelection
          flashcardSets={mockFlashcardSets}
          onTopicSelect={handleTopicSelect}
        />
      )}

      {/* Flashcard Study Screen */}
      {session.selectedTopic && (
        <div className="max-w-4xl mx-auto p-6">
          {/* Topic Header with Back Button */}
          <TopicHeader
            selectedTopic={session.selectedTopic}
            isRevisionMode={session.isRevisionMode}
            onBackToTopics={handleBackToTopics}
          />

          {/* Flashcard Display with Enhanced Transition Animation */}
          {session.cards.length > 0 && !session.isComplete && (
            <>
              <div className="relative overflow-hidden">
                <div
                  className={`
                    transition-all duration-300 ease-in-out transform
                    ${isTransitioning && transitionDirection === 'known' 
                      ? 'animate-slide-out-right' 
                      : isTransitioning && transitionDirection === 'unknown'
                      ? 'animate-slide-out-left'
                      : 'animate-fade-in-up'
                    }
                  `}
                  key={`card-${session.currentIndex}`}
                >
                  <FlashcardDisplay
                    card={session.cards[session.currentIndex]}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    onKnown={handleKnown}
                    onUnknown={handleUnknown}
                  />
                </div>
              </div>
              
              {/* Action Buttons - only show when card is flipped */}
              {isFlipped && (
                <div className={`
                  transition-all duration-200 ease-in-out
                  ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                `}>
                  <ActionButtons
                    onKnown={handleKnown}
                    onUnknown={handleUnknown}
                    disabled={isTransitioning}
                  />
                </div>
              )}
            </>
          )}

          {/* Study Summary */}
          {session.isComplete && (
            <StudySummary
              knownCount={session.knownCards.length}
              unknownCount={session.unknownCards.length}
              onStartRevision={handleStartRevision}
              selectedTopic={session.selectedTopic}
              onBackToTopics={handleBackToTopics}
            />
          )}

          {/* Enhanced Progress Indicator */}
          {session.cards.length > 0 && !session.isComplete && (
            <div className="mt-8 max-w-md mx-auto">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pokrok
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {session.currentIndex} / {session.cards.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(session.currentIndex / session.cards.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Session Statistics */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 transform transition-all duration-200 hover:scale-105">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400 transition-all duration-300">
                    {session.knownCards.length}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✅ Známé
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 transform transition-all duration-200 hover:scale-105">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400 transition-all duration-300">
                    {session.unknownCards.length}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                    ❌ Neznámé
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardModule;