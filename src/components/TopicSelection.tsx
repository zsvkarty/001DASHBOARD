import React, { useState, useEffect } from 'react';
import { FlashcardSet } from '../types';
import { getTopicStats } from '../utils/firebaseStorage';

interface TopicSelectionProps {
  flashcardSets: FlashcardSet[];
  onTopicSelect: (set: FlashcardSet) => void;
  className?: string;
}

interface TopicProgress {
  [topicId: string]: {
    completed: boolean;
    progress: number;
    knownCount: number;
    unknownCount: number;
    totalCards: number;
  };
}

const TopicSelection: React.FC<TopicSelectionProps> = ({ 
  flashcardSets, 
  onTopicSelect, 
  className = '' 
}) => {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress>({});

  // Load progress data for all topics on component mount
  useEffect(() => {
    const loadAllProgress = async () => {
      const progressData: TopicProgress = {};
      
      // Use Promise.all to load all progress data concurrently
      await Promise.all(
        flashcardSets.map(async (set) => {
          const stats = await getTopicStats(set.id);
          if (stats) {
            progressData[set.id] = stats;
          } else {
            // No progress data, set defaults
            progressData[set.id] = {
              completed: false,
              progress: 0,
              knownCount: 0,
              unknownCount: 0,
              totalCards: set.cards.length
            };
          }
        })
      );
      
      setTopicProgress(progressData);
    };

    loadAllProgress();
  }, [flashcardSets]);

  const handleTopicClick = (set: FlashcardSet) => {
    setSelectedTopic(set.id);
    // Add a small delay for visual feedback before navigating
    setTimeout(() => {
      onTopicSelect(set);
    }, 150);
  };

  const handleMouseEnter = (topicId: string) => {
    setHoveredTopic(topicId);
  };

  const handleMouseLeave = () => {
    setHoveredTopic(null);
  };

  const getTopicIcon = (set: FlashcardSet): string => {
    return set.emoji || '📝';
  };

  const getTopicColor = (topicId: string): string => {
    const colorMap: { [key: string]: string } = {
      'filosofie': 'from-indigo-400 to-indigo-600',
      'psychologie': 'from-pink-400 to-pink-600',
      'constitutional-law': 'from-blue-400 to-blue-600',
      'economics': 'from-green-400 to-green-600',
      'european-union': 'from-purple-400 to-purple-600',
      'legal-terms': 'from-orange-400 to-orange-600'
    };
    return colorMap[topicId] || 'from-gray-400 to-gray-600';
  };

  const getHoverColor = (topicId: string): string => {
    const hoverColorMap: { [key: string]: string } = {
      'filosofie': 'hover:from-indigo-500 hover:to-indigo-700',
      'psychologie': 'hover:from-pink-500 hover:to-pink-700',
      'constitutional-law': 'hover:from-blue-500 hover:to-blue-700',
      'economics': 'hover:from-green-500 hover:to-green-700',
      'european-union': 'hover:from-purple-500 hover:to-purple-700',
      'legal-terms': 'hover:from-orange-500 hover:to-orange-700'
    };
    return hoverColorMap[topicId] || 'hover:from-gray-500 hover:to-gray-700';
  };

  if (flashcardSets.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Žádná témata nejsou k dispozici
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Flashkarty se načítají nebo nejsou dostupné.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`topic-selection ${className}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vyberte téma pro studium
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Zvolte si oblast, kterou chcete studovat pomocí flashkaret
          </p>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flashcardSets.map((set) => (
            <div
              key={set.id}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(set.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleTopicClick(set)}
                disabled={selectedTopic === set.id}
                className={`
                  w-full h-48 rounded-xl shadow-lg
                  bg-gradient-to-br ${getTopicColor(set.id)} ${getHoverColor(set.id)}
                  text-white font-semibold
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105 hover:shadow-xl
                  focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                  disabled:opacity-75 disabled:cursor-not-allowed
                  ${hoveredTopic === set.id ? 'scale-105 shadow-xl' : ''}
                  ${selectedTopic === set.id ? 'animate-pulse' : ''}
                `}
                aria-label={`Select topic: ${set.title}`}
              >
                {/* Topic Card Content */}
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  {/* Topic Icon */}
                  <div className={`
                    text-5xl mb-4 
                    transition-transform duration-300 ease-in-out
                    ${hoveredTopic === set.id ? 'scale-110 rotate-3' : ''}
                    ${selectedTopic === set.id ? 'animate-bounce' : ''}
                  `}>
                    {getTopicIcon(set)}
                  </div>

                  {/* Topic Title */}
                  <h3 className="text-xl font-bold mb-2 leading-tight">
                    {set.title}
                  </h3>

                  {/* Topic Description */}
                  {set.description && (
                    <p className="text-sm opacity-90 mb-3 leading-relaxed">
                      {set.description}
                    </p>
                  )}

                  {/* Progress Information */}
                  {topicProgress[set.id] && topicProgress[set.id].progress > 0 ? (
                    <div className="w-full mt-2">
                      {/* Progress Bar */}
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mb-2">
                        <div
                          className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${topicProgress[set.id].progress}%` }}
                        />
                      </div>
                      
                      {/* Progress Stats */}
                      <div className="flex items-center justify-between text-xs opacity-90">
                        <span>{topicProgress[set.id].progress}% dokončeno</span>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <span className="text-green-200">✓</span>
                            <span className="ml-1">{topicProgress[set.id].knownCount}</span>
                          </span>
                          {topicProgress[set.id].unknownCount > 0 && (
                            <span className="flex items-center">
                              <span className="text-red-200">✗</span>
                              <span className="ml-1">{topicProgress[set.id].unknownCount}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-1 text-sm opacity-80 mt-2">
                      <span>📇</span>
                      <span>{set.cards.length} karet</span>
                    </div>
                  )}

                  {/* Completion Badge */}
                  {topicProgress[set.id]?.completed && (
                    <div className="absolute top-3 left-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg 
                          className="w-5 h-5 text-white" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedTopic === set.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <svg 
                          className="w-4 h-4 text-green-600" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Overlay Effect */}
                <div className={`
                  absolute inset-0 rounded-xl
                  bg-white bg-opacity-10
                  transition-opacity duration-300 ease-in-out
                  ${hoveredTopic === set.id ? 'opacity-100' : 'opacity-0'}
                `} />
              </button>

              {/* Floating Card Count Badge */}
              <div className={`
                absolute -top-2 -right-2 
                bg-white dark:bg-gray-800 
                text-gray-700 dark:text-gray-300
                text-xs font-bold
                px-2 py-1 rounded-full shadow-md
                transition-all duration-300 ease-in-out
                ${hoveredTopic === set.id ? 'scale-110' : ''}
              `}>
                {set.cards.length}
              </div>
            </div>
          ))}
        </div>

        {/* Loading State for Selected Topic */}
        {selectedTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Načítám téma...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicSelection;