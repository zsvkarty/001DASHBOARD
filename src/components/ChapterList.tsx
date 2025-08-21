import React from 'react';
import { TextbookProgress } from '../types';
import { ChapterIndexItem } from '../data/chaptersIndex';

interface ChapterListProps {
  chapters: ChapterIndexItem[];
  progress: TextbookProgress;
  onChapterSelect: (chapterId: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  progress,
  onChapterSelect,
}) => {
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, chapterId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChapterSelect(chapterId);
    }
  };

  return (
    <section className="p-4 sm:p-6" aria-labelledby="chapter-list-heading">
      <div className="mb-6">
        <h2 id="chapter-list-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dostupné kapitoly
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Vyberte kapitolu pro studium a následné testování
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
        {chapters.map((chapter) => {
          const chapterProgress = progress[chapter.id];
          const isCompleted = chapterProgress?.isCompleted || false;

          return (
            <div
              key={chapter.id}
              role="listitem"
              tabIndex={0}
              onClick={() => onChapterSelect(chapter.id)}
              onKeyDown={(e) => handleKeyDown(e, chapter.id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg 
                       focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-all duration-300 cursor-pointer transform hover:scale-105 
                       focus:scale-105 border border-gray-200 dark:border-gray-700
                       min-h-[140px] touch-manipulation
                       active:scale-95 active:shadow-sm"
              aria-label={`${chapter.title} - ${isCompleted ? 'Dokončeno' : 'Nedokončeno'}`}
            >
              <div className="p-6">
                {/* Header with title and completion indicator */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-3">
                    {chapter.title}
                  </h3>
                  <div className="flex-shrink-0" aria-hidden="true">
                    {isCompleted ? (
                      <div 
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        title="Kapitola dokončena"
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div 
                        className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"
                        title="Kapitola nedokončena"
                      ></div>
                    )}
                  </div>
                </div>

                {/* Placeholder for description - will be loaded when chapter is selected */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Klikněte pro načtení obsahu kapitoly
                </p>

                {/* Progress indicator for completed chapters */}
                {isCompleted && chapterProgress?.quizScore !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Dokončeno
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        Skóre: {chapterProgress.quizScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {chapters.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Žádné kapitoly nejsou k dispozici
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Kapitoly budou přidány brzy.
          </p>
        </div>
      )}
    </section>
  );
};

export default ChapterList;