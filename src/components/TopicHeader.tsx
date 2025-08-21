import React from 'react';
import { FlashcardSet } from '../types';

interface TopicHeaderProps {
  selectedTopic: FlashcardSet;
  isRevisionMode: boolean;
  onBackToTopics: () => void;
  className?: string;
}

const TopicHeader: React.FC<TopicHeaderProps> = ({
  selectedTopic,
  isRevisionMode,
  onBackToTopics,
  className = ''
}) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {/* Back Button Row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToTopics}
          className="
            inline-flex items-center
            px-4 py-2 
            bg-gray-100 hover:bg-gray-200 
            dark:bg-gray-700 dark:hover:bg-gray-600
            text-gray-700 dark:text-gray-300
            font-medium rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-800
          "
          aria-label="Zpět na výběr témat"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        <div className="flex-1" />
      </div>
      
      {/* Topic Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Flashkarty – {selectedTopic.title}
      </h1>
      
      {/* Topic Description */}
      <p className="text-gray-600 dark:text-gray-400">
        {isRevisionMode 
          ? 'Opakování neznámých karet' 
          : selectedTopic.description || 'Studuj pomocí interaktivních karet'
        }
      </p>
    </div>
  );
};

export default TopicHeader;