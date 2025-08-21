import React, { useState, useEffect } from 'react';
import { ProgressCardsProps, FlashcardSet } from '../types';
import { getAllProgress, getAllChapterProgress, getTopicStats, getChapterStats } from '../utils/firebaseStorage';
import { getAudioStats } from '../utils/audiobookStorage';
import { mockFlashcardSets, mockAudioChapters } from '../data/mockData';
import { chaptersIndex, ChapterIndexItem } from '../data/chaptersIndex';

interface ProgressCardsPropsWithNavigation extends ProgressCardsProps {
  onNavigate?: (section: string, flashcardSetId?: string) => void;
}

const ProgressCards: React.FC<ProgressCardsPropsWithNavigation> = ({ progressData, onNavigate }) => {
  const [realFlashcardProgress, setRealFlashcardProgress] = useState<{
    selectedSet: FlashcardSet | null;
    progress: number;
    completed: number;
    total: number;
    knownCount: number;
    unknownCount: number;
    isMainRoundComplete: boolean;
    needsRevision: boolean;
    isFullyCompleted: boolean;
  } | null>(null);

  const [realChapterProgress, setRealChapterProgress] = useState<{
    selectedChapter: ChapterIndexItem | null;
    progress: number;
    completedChapters: number;
    totalChapters: number;
    isCompleted: boolean;
    quizScore: number | null;
  } | null>(null);

  const [realAudioProgress, setRealAudioProgress] = useState<{
    currentChapter: string | null;
    currentTime: number;
    duration: number;
    progress: number;
    lastPlayed: Date | null;
  } | null>(null);

  // Load real flashcard progress from Firebase
  useEffect(() => {
    const loadRealFlashcardProgress = async () => {
      try {
        const allProgress = await getAllProgress();

        // Find the first unfinished set, or any set if all are finished
        let selectedSet: FlashcardSet | null = null;
        let bestProgress = {
          progress: 0,
          completed: false,
          knownCount: 0,
          unknownCount: 0,
          totalCards: 0,
          isMainRoundComplete: false,
          needsRevision: false
        };

        // First, try to find an unfinished set
        for (const set of mockFlashcardSets) {
          const stats = await getTopicStats(set.id);
          if (stats && !stats.completed) {
            selectedSet = set;
            bestProgress = stats;
            break;
          }
        }

        // If all sets are completed, pick the most recently studied one
        if (!selectedSet) {
          let mostRecentDate = 0;
          for (const set of mockFlashcardSets) {
            const progress = allProgress[set.id];
            if (progress) {
              const lastStudiedTime = new Date(progress.lastStudied).getTime();
              if (lastStudiedTime > mostRecentDate) {
                mostRecentDate = lastStudiedTime;
                selectedSet = set;
                const stats = await getTopicStats(set.id);
                if (stats) {
                  bestProgress = stats;
                }
              }
            }
          }
        }

        // If no progress exists at all, pick the first set
        if (!selectedSet) {
          selectedSet = mockFlashcardSets[0];
          bestProgress = {
            progress: 0,
            completed: false,
            knownCount: 0,
            unknownCount: 0,
            totalCards: selectedSet.cards.length,
            isMainRoundComplete: false,
            needsRevision: false
          };
        }

        setRealFlashcardProgress({
          selectedSet,
          progress: bestProgress.progress,
          completed: bestProgress.knownCount + bestProgress.unknownCount,
          total: bestProgress.totalCards,
          knownCount: bestProgress.knownCount,
          unknownCount: bestProgress.unknownCount,
          isMainRoundComplete: bestProgress.isMainRoundComplete,
          needsRevision: bestProgress.needsRevision,
          isFullyCompleted: bestProgress.completed
        });
      } catch (error) {
        console.error('Error loading flashcard progress:', error);
        // Fallback to first set if there's an error
        setRealFlashcardProgress({
          selectedSet: mockFlashcardSets[0],
          progress: 0,
          completed: 0,
          total: mockFlashcardSets[0].cards.length,
          knownCount: 0,
          unknownCount: 0,
          isMainRoundComplete: false,
          needsRevision: false,
          isFullyCompleted: false
        });
      }
    };

    loadRealFlashcardProgress();

    // Load real chapter progress from Firebase
    const loadRealChapterProgress = async () => {
      try {
        const allChapterProgress = await getAllChapterProgress();

        // Find the first unfinished chapter, or any chapter if all are finished
        let selectedChapter: ChapterIndexItem | null = null;
        let completedCount = 0;

        // First, try to find an unfinished chapter
        for (const chapter of chaptersIndex) {
          const stats = await getChapterStats(chapter.id);
          if (stats && stats.completed) {
            completedCount++;
          } else if (!selectedChapter) {
            selectedChapter = chapter;
          }
        }

        // If all chapters are completed, pick the most recently studied one
        if (!selectedChapter) {
          let mostRecentDate = 0;
          for (const chapter of chaptersIndex) {
            const progress = allChapterProgress[chapter.id];
            if (progress && progress.completedAt) {
              const completedTime = new Date(progress.completedAt).getTime();
              if (completedTime > mostRecentDate) {
                mostRecentDate = completedTime;
                selectedChapter = chapter;
              }
            }
          }
        }

        // If no progress exists at all, pick the first chapter
        if (!selectedChapter) {
          selectedChapter = chaptersIndex[0];
        }

        const selectedStats = selectedChapter ? await getChapterStats(selectedChapter.id) : null;

        setRealChapterProgress({
          selectedChapter,
          progress: selectedStats?.readingProgress || 0,
          completedChapters: completedCount,
          totalChapters: chaptersIndex.length,
          isCompleted: selectedStats?.completed || false,
          quizScore: selectedStats?.quizScore || null
        });
      } catch (error) {
        console.error('Error loading chapter progress:', error);
        // Fallback to first chapter if there's an error
        setRealChapterProgress({
          selectedChapter: chaptersIndex[0],
          progress: 0,
          completedChapters: 0,
          totalChapters: chaptersIndex.length,
          isCompleted: false,
          quizScore: null
        });
      }
    };

    loadRealChapterProgress();

    // Load real audio progress from localStorage
    const loadRealAudioProgress = () => {
      try {
        const audioStats = getAudioStats();
        setRealAudioProgress(audioStats);
      } catch (error) {
        console.error('Error loading audio progress:', error);
        setRealAudioProgress({
          currentChapter: null,
          currentTime: 0,
          duration: 0,
          progress: 0,
          lastPlayed: null
        });
      }
    };

    loadRealAudioProgress();
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {/* Flashcards Progress Card */}
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group flex flex-col"
        onClick={() => onNavigate?.('flashcards', realFlashcardProgress?.selectedSet?.id)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">Flashkarty</h3>
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🃏</span>
        </div>

        {realFlashcardProgress ? (
          <>
            {/* Current Set Info */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktuální téma</div>
              <div className="font-medium text-gray-900 dark:text-white mb-2">
                {realFlashcardProgress.selectedSet?.title || 'Žádné téma'}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${realFlashcardProgress.progress}%` }}
                ></div>
              </div>

              {/* Progress Status */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                {realFlashcardProgress.isFullyCompleted ? (
                  // Fully completed (both main round and revision done)
                  <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                    <span className="mr-1">✔</span>
                    Dokončeno
                  </span>
                ) : realFlashcardProgress.isMainRoundComplete ? (
                  // Main round complete, but may need revision
                  <div className="flex flex-col space-y-1">
                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                      <span className="mr-1">✔</span>
                      Dokončeno
                    </span>
                    {realFlashcardProgress.needsRevision && (
                      <span className="flex items-center text-orange-600 dark:text-orange-400 text-xs">
                        <span className="mr-1">🔁</span>
                        Ještě k opakování: {realFlashcardProgress.unknownCount} {realFlashcardProgress.unknownCount === 1 ? 'karta' : realFlashcardProgress.unknownCount < 5 ? 'karty' : 'karet'}
                      </span>
                    )}
                  </div>
                ) : (
                  // Still in progress through main round
                  <span>{realFlashcardProgress.completed}/{realFlashcardProgress.total} hotovo</span>
                )}
                <span>{realFlashcardProgress.progress}%</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Známé karty:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{realFlashcardProgress.knownCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">K opakování:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">{realFlashcardProgress.unknownCount}</span>
              </div>
            </div>
          </>
        ) : (
          /* Loading state */
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="flex-1"></div>
        <button
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!realFlashcardProgress}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onNavigate?.('flashcards', realFlashcardProgress?.selectedSet?.id);
          }}
        >
          {realFlashcardProgress?.progress === 100 ? 'Opakovat téma' : 'Pokračovat ve studiu'}
        </button>
      </div>

      {/* Audiobook Progress Card */}
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group flex flex-col"
        onClick={() => onNavigate?.('audiobook')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-200">Audiokniha</h3>
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🎧</span>
        </div>

        {realAudioProgress && realAudioProgress.currentChapter ? (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktuálně posloucháš</div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">
              {mockAudioChapters.find(ch => ch.id === realAudioProgress.currentChapter)?.title || 'Neznámá kapitola'}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${realAudioProgress.progress}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>{formatTime(realAudioProgress.currentTime)}</span>
              <span>{formatTime(realAudioProgress.duration)}</span>
            </div>

            {/* Current chapter info */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Kapitola: {mockAudioChapters.find(ch => ch.id === realAudioProgress.currentChapter)?.title || 'Historie evropské integrace'}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Žádný poslech</div>
            <div className="font-medium text-gray-900 dark:text-white mb-2">
              Začni poslouchat první kapitolu
            </div>

            {/* Empty progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>0:00</span>
              <span>--:--</span>
            </div>

            {/* Current chapter info */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Kapitola: Historie evropské integrace
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {realAudioProgress?.lastPlayed ? (
            <>Naposledy: {realAudioProgress.lastPlayed.toLocaleDateString('cs-CZ')}</>
          ) : (
            <>Ještě jsi neposlouchal žádnou kapitolu</>
          )}
        </div>

        <div className="flex-1"></div>
        <button 
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onNavigate?.('audiobook');
          }}
        >
          Pokračovat v poslechu
        </button>
      </div>

      {/* Digital Textbook Progress Card */}
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group flex flex-col"
        onClick={() => onNavigate?.('courses')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-200">Kapitoly</h3>
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📚</span>
        </div>

        {realChapterProgress ? (
          <>
            {/* Current Chapter Info */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktuální kapitola</div>
              <div className="font-medium text-gray-900 dark:text-white mb-2">
                {realChapterProgress.selectedChapter?.title || 'Žádná kapitola'}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${realChapterProgress.progress}%` }}
                ></div>
              </div>

              {/* Progress Status */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                {realChapterProgress.isCompleted ? (
                  <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                    <span className="mr-1">✔</span>
                    Dokončeno
                    {realChapterProgress.quizScore && (
                      <span className="ml-2 text-purple-600 dark:text-purple-400">
                        ({realChapterProgress.quizScore}%)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>Čtení: {realChapterProgress.progress}%</span>
                )}
                <span>{realChapterProgress.progress}%</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Dokončené kapitoly:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{realChapterProgress.completedChapters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Celkem kapitol:</span>
                <span className="font-medium text-gray-900 dark:text-white">{realChapterProgress.totalChapters}</span>
              </div>
            </div>
          </>
        ) : (
          /* Loading state */
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="flex-1"></div>
        <button
          className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!realChapterProgress}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when button is clicked
            onNavigate?.('courses');
          }}
        >
          {realChapterProgress?.isCompleted ? 'Procházet kapitoly' : 'Pokračovat ve čtení'}
        </button>
      </div>

      {/* Exercises Progress Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors duration-200">Cvičení</h3>
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">✏️</span>
        </div>

        <div className="space-y-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {progressData.exercises.completedToday}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dokončeno dnes</div>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{progressData.exercises.streak}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Dní v řadě</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{progressData.exercises.averageScore}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Průměr</div>
            </div>
          </div>
        </div>

        <div className="flex-1"></div>
        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors duration-200">
          Začít cvičení
        </button>
      </div>
    </div>
  );
};

export default ProgressCards;