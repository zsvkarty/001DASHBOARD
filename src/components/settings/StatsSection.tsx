import React from 'react';

export interface UserStats {
  totalStudyTime: number; // in minutes
  completedModules: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  badgesEarned: number;
  averageSessionTime: number;
  studyHistory: {
    date: string;
    minutes: number;
    xpEarned: number;
  }[];
}

interface StatsSectionProps {
  stats: UserStats;
  isLoading: boolean;
  onRetry?: () => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats, isLoading, onRetry }) => {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('cs-CZ');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Přehled pokroku
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⏱️</span>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Celkový čas studia
                </p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatTime(stats.totalStudyTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📚</span>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Dokončené moduly
                </p>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatNumber(stats.completedModules)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔥</span>
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Aktuální série
                </p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {formatNumber(stats.currentStreak)} dní
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⭐</span>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Celkové XP
                </p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatNumber(stats.totalXP)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Detailní statistiky
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nejdelší série:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.longestStreak)} dní
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Získané odznaky:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.badgesEarned)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Průměrná délka sezení:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatTime(stats.averageSessionTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Nedávná aktivita
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
          {stats.studyHistory.length > 0 ? (
            <div className="space-y-3">
              {stats.studyHistory.slice(0, 5).map((session, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.date).toLocaleDateString('cs-CZ')}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatTime(session.minutes)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    +{formatNumber(session.xpEarned)} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-gray-500 dark:text-gray-400">
                Zatím žádná aktivita
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Začněte studovat a vaše statistiky se zde zobrazí
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Retry button for error state */}
      {onRetry && (
        <div className="text-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Zkusit znovu
          </button>
        </div>
      )}
    </div>
  );
};

export default StatsSection;