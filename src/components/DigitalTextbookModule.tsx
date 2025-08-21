import React, { useState, useEffect } from 'react';
import { DigitalTextbookModuleProps, TextbookProgress, ChapterProgress } from '../types';
import { Chapter } from '../types/content';
import { chaptersIndex } from '../data/chaptersIndex';
import { loadChapter } from '../lib/loaders';
import ChapterList from './ChapterList';
import ChapterReader from './ChapterReader';
import MultiPageChapterReader from './MultiPageChapterReader';
import ChapterErrorBoundary from './ChapterErrorBoundary';
import {
  getAllChapterProgress,
  saveChapterProgress
} from '../utils/firebaseStorage';

const DigitalTextbookModule: React.FC<DigitalTextbookModuleProps> = ({ onNavigate }) => {
  // State management for overall module
  const [currentView, setCurrentView] = useState<'list' | 'reader'>('list');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterProgress, setChapterProgress] = useState<TextbookProgress>({});
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterLoadError, setChapterLoadError] = useState<string | null>(null);

  // Initialize component and load progress from localStorage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load all chapter progress from Firebase
        const loadedProgress = await getAllChapterProgress();
        setChapterProgress(loadedProgress);
      } catch (error) {
        console.error('Failed to initialize textbook progress:', error);
        // Continue with empty progress if Firebase fails
        setChapterProgress({});
      }
    };

    loadProgress();
  }, []);

  // Handle chapter selection and navigation to reader view
  const handleChapterSelect = async (chapterId: string) => {
    setIsLoadingChapter(true);
    setChapterLoadError(null);
    
    try {
      const chapter = await loadChapter(chapterId);
      setSelectedChapter(chapter);
      setCurrentView('reader');
    } catch (error) {
      console.error('Failed to load chapter:', error);
      setChapterLoadError(error instanceof Error ? error.message : 'Failed to load chapter');
    } finally {
      setIsLoadingChapter(false);
    }
  };

  // Handle navigation back to chapter list
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedChapter(null);
    setChapterLoadError(null);
  };

  // Handle progress updates from ChapterReader
  const handleProgressUpdate = (updatedProgress: ChapterProgress) => {
    // Update local state
    setChapterProgress(prev => ({
      ...prev,
      [updatedProgress.chapterId]: updatedProgress
    }));

    // Persist to Firebase
    try {
      saveChapterProgress(updatedProgress.chapterId, {
        isCompleted: updatedProgress.isCompleted,
        quizScore: updatedProgress.quizScore,
        completedAt: updatedProgress.completedAt,
        readingProgress: updatedProgress.readingProgress
      }).catch(error => console.error('Failed to save chapter progress:', error));
    } catch (error) {
      console.error('Failed to save chapter progress:', error);
      // Local state is already updated, so UI will still work
    }
  };



  // Render loading state
  if (isLoadingChapter) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Načítám kapitolu...</p>
        </div>
      </div>
    );
  }

  // Handle retry functionality
  const handleRetryChapterLoad = async () => {
    if (selectedChapter) {
      await handleChapterSelect(selectedChapter.id);
    }
  };

  // Render error state
  if (chapterLoadError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Chyba při načítání kapitoly
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {chapterLoadError}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetryChapterLoad}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Zkusit znovu
            </button>
            <button
              onClick={handleBackToList}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Zpět na seznam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render chapter reader view
  if (currentView === 'reader' && selectedChapter) {
    const currentProgress = chapterProgress[selectedChapter.id] || {
      chapterId: selectedChapter.id,
      isCompleted: false,
      readingProgress: 0
    };

    return (
      <div className="h-full">
        <ChapterErrorBoundary
          onError={(error) => {
            console.error('Chapter reader error:', error);
            setChapterLoadError('Chyba při zobrazování kapitoly');
          }}
        >
          {selectedChapter.isMultiPage ? (
            <MultiPageChapterReader
              chapter={selectedChapter}
              progress={currentProgress}
              onProgressUpdate={handleProgressUpdate}
              onBackToList={handleBackToList}
            />
          ) : (
            <ChapterReader
              chapter={selectedChapter}
              progress={currentProgress}
              onProgressUpdate={handleProgressUpdate}
              onBackToList={handleBackToList}
            />
          )}
        </ChapterErrorBoundary>
      </div>
    );
  }

  // Render chapter list view (default)
  return (
    <main role="main" aria-label="Digitální učebnice">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Digitální učebnice
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Studujte strukturovaný obsah a procvičujte si znalosti pomocí kvízů
        </p>
      </header>

      {/* Chapter List */}
      <ChapterList
        chapters={chaptersIndex}
        progress={chapterProgress}
        onChapterSelect={handleChapterSelect}
      />

      {/* Progress overview */}
      <section
        className="mt-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        aria-labelledby="progress-heading"
      >
        <div className="flex items-start gap-3">
          <div className="text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 id="progress-heading" className="font-medium text-blue-900 dark:text-blue-100 mb-1">Váš pokrok</h3>
            <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 mb-2">
              Dokončené kapitoly: {Object.values(chapterProgress).filter(p => p.isCompleted).length} z {chaptersIndex.length}
            </p>
            {Object.values(chapterProgress).filter(p => p.isCompleted).length > 0 && (
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                Průměrné skóre kvízů: {Math.round(
                  Object.values(chapterProgress)
                    .filter(p => p.isCompleted && p.quizScore !== undefined)
                    .reduce((sum, p) => sum + (p.quizScore || 0), 0) /
                  Object.values(chapterProgress).filter(p => p.isCompleted && p.quizScore !== undefined).length
                )}%
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default DigitalTextbookModule;