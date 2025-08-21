import React, { useState, useEffect } from 'react';
import { ChapterProgress } from '../types';
import { Chapter } from '../types/content';
import ChapterContent from './ChapterContent';
import ChapterQuiz from './ChapterQuiz';

export interface ChapterReaderProps {
  chapter: Chapter;
  progress: ChapterProgress;
  onProgressUpdate: (progress: ChapterProgress) => void;
  onBackToList: () => void;
}

type ReaderSection = 'content' | 'quiz';

const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  progress,
  onProgressUpdate,
  onBackToList
}) => {
  const [currentSection, setCurrentSection] = useState<ReaderSection>('content');
  const [contentCompleted, setContentCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(progress?.isCompleted || false);

  // Initialize content completion state based on progress
  useEffect(() => {
    setContentCompleted((progress?.readingProgress || 0) >= 90);
    setQuizCompleted(progress?.isCompleted || false);
  }, [progress?.readingProgress, progress?.isCompleted]);

  const handleContentComplete = () => {
    setContentCompleted(true);
    
    // Update progress with reading completion
    const updatedProgress: ChapterProgress = {
      ...progress,
      readingProgress: 100
    };
    
    onProgressUpdate(updatedProgress);
  };

  const handleContentProgressUpdate = (readingProgress: number) => {
    // Only update if progress actually changed to prevent loops
    if (!progress || Math.abs((progress.readingProgress || 0) - readingProgress) > 1) {
      const updatedProgress: ChapterProgress = {
        chapterId: chapter.id,
        isCompleted: progress?.isCompleted || false,
        quizScore: progress?.quizScore,
        completedAt: progress?.completedAt,
        readingProgress
      };
      
      onProgressUpdate(updatedProgress);
    }
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizCompleted(true);
    
    // Calculate percentage score
    const percentageScore = Math.round((score / totalQuestions) * 100);
    
    // Update progress with quiz completion
    const updatedProgress: ChapterProgress = {
      ...progress,
      isCompleted: true,
      quizScore: percentageScore,
      completedAt: new Date(),
      readingProgress: 100 // Ensure reading is marked as complete
    };
    
    onProgressUpdate(updatedProgress);
  };

  const handleNavigateToQuiz = () => {
    setCurrentSection('quiz');
  };

  const handleBackToContent = () => {
    setCurrentSection('content');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" role="main" aria-labelledby="chapter-reader-heading">
      {/* Navigation Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Back Button */}
          <button
            onClick={onBackToList}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                     focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg
                     transition-colors duration-200 min-h-[44px] touch-manipulation
                     sm:self-start"
            data-testid="back-to-list-button"
            aria-label="Vrátit se na seznam kapitol"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Zpět na seznam</span>
          </button>

          {/* Section Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1" role="tablist" aria-label="Navigace mezi obsahem a kvízem">
            <button
              onClick={handleBackToContent}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                currentSection === 'content'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              data-testid="content-tab"
              role="tab"
              aria-selected={currentSection === 'content'}
              aria-controls="content-panel"
              aria-label={`Obsah kapitoly${contentCompleted ? ' - dokončeno' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span>Obsah</span>
                {contentCompleted && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={handleNavigateToQuiz}
              disabled={!contentCompleted}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:focus:ring-0 ${
                currentSection === 'quiz'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : contentCompleted
                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              data-testid="quiz-tab"
              role="tab"
              aria-selected={currentSection === 'quiz'}
              aria-controls="quiz-panel"
              aria-label={`Kvíz${!contentCompleted ? ' - nejprve dokončete obsah' : quizCompleted ? ' - dokončeno' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span>Kvíz</span>
                {quizCompleted && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
          <div className="h-full relative" id="content-panel" role="tabpanel" aria-labelledby="content-tab">
            <ChapterContent
              content={chapter.content}
              title={chapter.title}
              onContentComplete={handleContentComplete}
              onProgressUpdate={handleContentProgressUpdate}
            />
            
            {/* Continue to Quiz Button - Fixed positioning */}
            {contentCompleted && (
              <div className="fixed bottom-6 right-4 sm:right-6 z-50">
                <button
                  onClick={handleNavigateToQuiz}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg 
                           hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-all duration-200 flex items-center gap-2 font-medium
                           min-h-[48px] touch-manipulation text-sm sm:text-base"
                  data-testid="continue-to-quiz-button"
                  aria-label="Pokračovat na kvíz kapitoly"
                >
                  <span>Pokračovat na kvíz</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 sm:p-6" id="quiz-panel" role="tabpanel" aria-labelledby="quiz-tab">
            <ChapterQuiz
              questions={chapter.quiz || []}
              onQuizComplete={handleQuizComplete}
              onBackToContent={handleBackToContent}
            />
          </div>
        )}
      </div>

      {/* Chapter Completion Status */}
      {quizCompleted && (
        <footer 
          className="flex-shrink-0 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 px-4 sm:px-6 py-3"
          role="status"
          aria-live="polite"
          aria-label="Stav dokončení kapitoly"
        >
          <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium text-sm sm:text-base">
              Kapitola dokončena! Skóre: {progress.quizScore}%
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ChapterReader;