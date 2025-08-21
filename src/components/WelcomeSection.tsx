import React, { useState, useEffect } from 'react';
import { WelcomeSectionProps } from '../types';
import StreakDisplay from './StreakDisplay';
import { useGamification } from '../contexts/GamificationContext';
import { getAllProgress, getAllChapterProgress, getTopicStats, getChapterStats } from '../utils/firebaseStorage';
import { getAudioStats } from '../utils/audiobookStorage';
import { mockFlashcardSets, mockAudioChapters } from '../data/mockData';
import { chaptersIndex } from '../data/chaptersIndex';

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number }> = ({ progress, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
          }}
        />
      </svg>
      {/* Progress text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-2xl font-bold font-space-grotesk drop-shadow-sm">
          {Math.round(progress)}%
        </div>
        <div className="text-xs font-medium opacity-90 drop-shadow-sm">
          dokončeno
        </div>
      </div>
    </div>
  );
};

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  const { streak } = useGamification();
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobré ráno';
    if (hour < 17) return 'Dobré odpoledne';
    return 'Dobrý večer';
  };

  // Calculate overall progress from all modules
  useEffect(() => {
    const calculateOverallProgress = async () => {
      try {
        setIsLoading(true);
        
        // Get flashcard progress
        let flashcardProgress = 0;
        let completedFlashcardSets = 0;
        for (const set of mockFlashcardSets) {
          const stats = await getTopicStats(set.id);
          if (stats && stats.completed) {
            completedFlashcardSets++;
          }
        }
        flashcardProgress = (completedFlashcardSets / mockFlashcardSets.length) * 100;

        // Get textbook progress
        let textbookProgress = 0;
        let completedChapters = 0;
        for (const chapter of chaptersIndex) {
          const stats = await getChapterStats(chapter.id);
          if (stats && stats.completed) {
            completedChapters++;
          }
        }
        textbookProgress = (completedChapters / chaptersIndex.length) * 100;

        // Get audio progress (simplified - based on if any chapter was started)
        const audioStats = getAudioStats();
        const audioProgress = audioStats.currentChapter ? audioStats.progress : 0;

        // Calculate weighted average (equal weight for each module)
        const overall = (flashcardProgress + textbookProgress + audioProgress) / 3;
        setOverallProgress(overall);
        
      } catch (error) {
        console.error('Error calculating overall progress:', error);
        setOverallProgress(0);
      } finally {
        setIsLoading(false);
      }
    };

    calculateOverallProgress();
  }, []);

  return (
    <div className="mb-8">
      <div 
        className="relative overflow-hidden shadow-lg"
        style={{
          backgroundColor: '#2F4F4F',
          borderRadius: '1.5rem'
        }}
      >
        {/* Frosted glass overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-[20px] saturate-[180%]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '1.5rem'
          }}
        />
        
        {/* Content layer */}
        <div className="relative z-10 p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Left side - Welcome message and streak */}
            <div className="flex-1 space-y-6">
              {/* Welcome message */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-shadow-lg">
                  Vítej zpět, {userName}! 👋
                </h1>
                <p className="text-white text-opacity-95 text-lg font-medium">
                  {getTimeBasedGreeting()}, jsi ready na další studium?
                </p>
              </div>

              {/* Streak Display */}
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm border border-white border-opacity-30">
                <StreakDisplay streak={streak.current} className="text-white" />
              </div>

              {/* Quick stats or call to action */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2 text-white text-opacity-95">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm font-medium">Pokračuj ve svém pokroku!</span>
                </div>
                <div className="flex items-center space-x-2 text-white text-opacity-95">
                  <span className="text-lg">📚</span>
                  <span className="text-sm font-medium">Každý den se naučíš něco nového</span>
                </div>
              </div>
            </div>

            {/* Right side - Progress Ring */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center lg:ml-4 lg:mr-4">
              {isLoading ? (
                <div className="flex items-center justify-center" style={{ width: 120, height: 120 }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <ProgressRing progress={overallProgress} />
                  <div className="mt-3 text-sm font-medium text-white text-opacity-90 drop-shadow-sm text-center">
                    Celkový pokrok kurzu
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
