import React from 'react';
import { StudySummaryProps } from '../types';

const StudySummary: React.FC<StudySummaryProps> = ({
  knownCount,
  unknownCount,
  onStartRevision,
  selectedTopic,
  onBackToTopics
}) => {
  const totalCards = knownCount + unknownCount;
  const hasUnknownCards = unknownCount > 0;

  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      {/* Celebration Icon */}
      <div className="text-6xl mb-6">🎉</div>
      
      {/* Main Completion Message */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Hotovo!
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
        Dokončil jsi studium všech {totalCards} karet
        {selectedTopic && (
          <span className="block text-base font-medium text-blue-600 dark:text-blue-400 mt-1">
            z tématu "{selectedTopic.title}"
          </span>
        )}
      </p>

      {/* Results Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Výsledky studia
        </h3>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Known Cards */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {knownCount}
            </div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              ✅ Známé karty
            </div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70">
              {totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0}% úspěšnost
            </div>
          </div>

          {/* Unknown Cards */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {unknownCount}
            </div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
              ❌ Neznámé karty
            </div>
            <div className="text-xs text-red-600/70 dark:text-red-400/70">
              {totalCards > 0 ? Math.round((unknownCount / totalCards) * 100) : 0}% k opakování
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Celkový pokrok
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {knownCount} / {totalCards}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${totalCards > 0 ? (knownCount / totalCards) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        {/* Conditional Message and Action */}
        {hasUnknownCards ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Zopakuj si {unknownCount} neznámých karet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onStartRevision}
                className="
                  inline-flex items-center justify-center
                  px-6 py-3 
                  bg-blue-600 hover:bg-blue-700 
                  dark:bg-blue-500 dark:hover:bg-blue-600
                  text-white font-semibold rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-800
                  shadow-md hover:shadow-lg
                "
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Začít opakování
              </button>
              {onBackToTopics && (
                <button
                  onClick={onBackToTopics}
                  className="
                    inline-flex items-center justify-center
                    px-6 py-3 
                    bg-gray-100 hover:bg-gray-200 
                    dark:bg-gray-700 dark:hover:bg-gray-600
                    text-gray-700 dark:text-gray-300
                    font-semibold rounded-lg
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800
                    shadow-md hover:shadow-lg
                  "
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
                  </svg>
                  Zpět na témata
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-2xl">🌟</div>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
              Perfektní! Všechny karty znáš!
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Skvělá práce! Můžeš pokračovat v dalším studiu.
            </p>
            {onBackToTopics && (
              <button
                onClick={onBackToTopics}
                className="
                  inline-flex items-center justify-center
                  px-6 py-3 mt-4
                  bg-gray-100 hover:bg-gray-200 
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-300
                  font-semibold rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  dark:focus:ring-offset-gray-800
                  shadow-md hover:shadow-lg
                "
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
                Zpět na témata
              </button>
            )}
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
          💡 Tip: Pravidelné opakování pomáhá lépe si zapamatovat nové informace!
        </p>
      </div>
    </div>
  );
};

export default StudySummary;