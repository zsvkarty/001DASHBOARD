import React, { useState, useEffect } from 'react';
import { ChapterProgress } from '../types';
import { Chapter } from '../types/content';
import ChapterContent from './ChapterContent';
import ChapterQuiz from './ChapterQuiz';

export interface MultiPageChapterReaderProps {
  chapter: Chapter;
  progress: ChapterProgress;
  onProgressUpdate: (progress: ChapterProgress) => void;
  onBackToList: () => void;
}

type ReaderSection = 'content' | 'quiz';

const MultiPageChapterReader: React.FC<MultiPageChapterReaderProps> = ({
  chapter,
  progress,
  onProgressUpdate,
  onBackToList
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<ReaderSection>('content');
  const [pageCompletionStatus, setPageCompletionStatus] = useState<boolean[]>([]);
  const [pageQuizStatus, setPageQuizStatus] = useState<boolean[]>([]);

  const [showAutoAdvance, setShowAutoAdvance] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  const pages = chapter.pages || [];
  const currentPage = pages[currentPageIndex];

  // Initialize completion status for all pages
  useEffect(() => {
    // Restore quiz completion status from saved progress
    const currentReadingProgress = progress?.readingProgress || 0;
    // Since progress is based on completed quizzes: completedQuizzes / totalPages * 100
    const completedQuizzesCount = Math.round((currentReadingProgress / 100) * pages.length);
    
    const initialPageCompletion = pages.map(() => false); // Reading completion is not persisted
    const initialQuizCompletion = pages.map((_, index) => index < completedQuizzesCount);
    
    setPageCompletionStatus(initialPageCompletion);
    setPageQuizStatus(initialQuizCompletion);
    
    // Debug logging to help troubleshoot
    console.log('Initializing chapter progress:', {
      chapterId: chapter.id,
      readingProgress: currentReadingProgress,
      completedQuizzesCount,
      totalPages: pages.length,
      initialQuizCompletion
    });
  }, [pages.length, progress?.readingProgress, progress?.isCompleted, chapter.id]);

  const handlePageContentComplete = () => {
    const updatedStatus = [...pageCompletionStatus];
    updatedStatus[currentPageIndex] = true;
    setPageCompletionStatus(updatedStatus);
    // Don't update progress here - only when quizzes are completed
  };

  const handlePageContentProgressUpdate = (pageReadingProgress: number) => {
    // Simplified progress tracking - mark page as complete when user scrolls to 80%
    if (pageReadingProgress >= 80 && !pageCompletionStatus[currentPageIndex]) {
      handlePageContentComplete();
    }
  };

  const startAutoAdvance = () => {
    if (currentPageIndex < pages.length - 1) {
      console.log('Starting auto-advance countdown');
      setShowAutoAdvance(true);
      setCountdown(10);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAutoAdvance(false);
            handleNextPage();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      
      setAutoAdvanceTimer(timer);
    } else {
      console.log('Not starting auto-advance - on last page');
    }
  };

  const cancelAutoAdvance = () => {
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
    setShowAutoAdvance(false);
    setCountdown(10);
  };

  const handlePageQuizComplete = (score: number, totalQuestions: number) => {
    const updatedQuizStatus = [...pageQuizStatus];
    updatedQuizStatus[currentPageIndex] = true;
    setPageQuizStatus(updatedQuizStatus);
    
    // Calculate progress based on completed quizzes only
    const completedQuizzes = updatedQuizStatus.filter(Boolean).length;
    const readingProgress = Math.round((completedQuizzes / pages.length) * 100);
    
    // Check if all quizzes are completed
    const allQuizzesCompleted = updatedQuizStatus.every(Boolean);
    
    const currentPageScore = Math.round((score / totalQuestions) * 100);
    
    const updatedProgress: ChapterProgress = {
      chapterId: chapter.id,
      isCompleted: allQuizzesCompleted,
      quizScore: currentPageScore,
      completedAt: allQuizzesCompleted ? new Date() : progress?.completedAt,
      readingProgress
    };
    
    onProgressUpdate(updatedProgress);
    
    // Chapter completion is now tracked in the progress state
    
    // Start auto-advance countdown immediately after quiz completion (only if not on last page)
    if (currentPageIndex < pages.length - 1) {
      startAutoAdvance();
    } else {
      // If on last page, just go back to content view after a short delay
      setTimeout(() => {
        setCurrentSection('content');
      }, 1000);
    }
  };

  const handleNavigateToQuiz = () => {
    setCurrentSection('quiz');
  };

  const handleBackToContent = () => {
    setCurrentSection('content');
  };

  const handleNextPage = () => {
    cancelAutoAdvance(); // Cancel any active countdown
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setCurrentSection('content');
    }
  };

  const handlePreviousPage = () => {
    cancelAutoAdvance(); // Cancel any active countdown
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setCurrentSection('content');
    }
  };

  const handlePageSelect = (pageIndex: number) => {
    cancelAutoAdvance(); // Cancel any active countdown
    setCurrentPageIndex(pageIndex);
    setCurrentSection('content');
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  // Keyboard support for auto-advance overlay
  useEffect(() => {
    if (showAutoAdvance) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          cancelAutoAdvance();
        } else if (event.key === 'Enter') {
          cancelAutoAdvance();
          handleNextPage();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAutoAdvance]);

  const isCurrentPageContentCompleted = pageCompletionStatus[currentPageIndex] || false;
  const isCurrentPageQuizCompleted = pageQuizStatus[currentPageIndex] || false;

  if (!currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Kapitola nenalezena</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" role="main" aria-labelledby="chapter-reader-heading">
      {/* Navigation Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Back Button and Chapter Title */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToList}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                       focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg
                       transition-colors duration-200 min-h-[44px] touch-manipulation"
              aria-label="Vrátit se na seznam kapitol"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Zpět na seznam</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white text-center flex-1 mx-4">
              {chapter.title}
            </h1>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Stránka {currentPageIndex + 1} z {pages.length}:
              </span>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                {currentPage.title}
              </h2>
            </div>
            
            {/* Page Progress Indicators */}
            <div className="flex items-center gap-1">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageSelect(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    index === currentPageIndex
                      ? 'bg-blue-600 text-white'
                      : pageQuizStatus[index]
                      ? 'bg-green-500 text-white'
                      : pageCompletionStatus[index]
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Přejít na stránku ${index + 1}${pageQuizStatus[index] ? ' - dokončeno' : pageCompletionStatus[index] ? ' - přečteno' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Section Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1" role="tablist">
            <button
              onClick={handleBackToContent}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                currentSection === 'content'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="tab"
              aria-selected={currentSection === 'content'}
            >
              <div className="flex items-center gap-2">
                <span>Obsah</span>
                {isCurrentPageContentCompleted && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={handleNavigateToQuiz}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                currentSection === 'quiz'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              role="tab"
              aria-selected={currentSection === 'quiz'}
            >
              <div className="flex items-center gap-2">
                <span>Kvíz</span>
                {isCurrentPageQuizCompleted && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentSection === 'content' ? (
          <div className="h-full relative">
            <ChapterContent
              content={currentPage.content}
              title={currentPage.title}
              onContentComplete={handlePageContentComplete}
              onProgressUpdate={handlePageContentProgressUpdate}
            />
            
            {/* Navigation Buttons - Fixed positioning with better z-index */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent p-6 pointer-events-none">
              <div className="flex items-center justify-center gap-4 pointer-events-auto">
                {/* Previous Page Button - Only show if not on first page */}
                {currentPageIndex > 0 && (
                  <button
                    onClick={handlePreviousPage}
                    className="px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-lg 
                             hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-all duration-200 flex items-center gap-2 font-medium min-h-[48px] touch-manipulation"
                    aria-label="Předchozí stránka"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Předchozí</span>
                  </button>
                )}

                {/* Main Action Button */}
                {!isCurrentPageQuizCompleted ? (
                  // Show Quiz button when quiz is not completed
                  <button
                    onClick={handleNavigateToQuiz}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg 
                             hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             transition-all duration-200 flex items-center gap-2 font-medium
                             min-h-[48px] touch-manipulation"
                    aria-label="Pokračovat na kvíz stránky"
                  >
                    <span>Pokračovat na kvíz</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </button>
                ) : currentPageIndex < pages.length - 1 ? (
                  // Show Next Page button when quiz is completed and there are more pages
                  <button
                    onClick={handleNextPage}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg 
                             hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                             transition-all duration-200 flex items-center gap-2 font-medium
                             min-h-[48px] touch-manipulation"
                    aria-label="Další stránka"
                  >
                    <span>Další stránka</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <ChapterQuiz
              questions={currentPage.questions}
              onQuizComplete={handlePageQuizComplete}
              onBackToContent={handleBackToContent}
              showAutoAdvance={showAutoAdvance}
              countdown={countdown}
              nextPageTitle={currentPageIndex < pages.length - 1 ? pages[currentPageIndex + 1]?.title : undefined}
              onCancelAutoAdvance={cancelAutoAdvance}
              onContinueNow={() => {
                cancelAutoAdvance();
                handleNextPage();
              }}
            />
          </div>
        )}
      </div>


    </div>
  );
};

export default MultiPageChapterReader;