import React from 'react';
import { ActionButtonsProps } from '../types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onKnown, 
  onUnknown, 
  disabled 
}) => {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      {/* "Neznám" Button - Left side, red/orange theme */}
      <button
        onClick={onUnknown}
        disabled={disabled}
        className={`
          flex items-center justify-center
          px-6 py-3 rounded-lg font-medium text-white
          transition-all duration-200 transform
          ${disabled 
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }
          min-w-[140px]
        `}
        aria-label="Označit kartu jako neznámou"
      >
        <span className="text-lg mr-2">❌</span>
        <span className="text-base">Neznám</span>
      </button>

      {/* "Znám" Button - Right side, green theme */}
      <button
        onClick={onKnown}
        disabled={disabled}
        className={`
          flex items-center justify-center
          px-6 py-3 rounded-lg font-medium text-white
          transition-all duration-200 transform
          ${disabled 
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }
          min-w-[140px]
        `}
        aria-label="Označit kartu jako známou"
      >
        <span className="text-lg mr-2">✅</span>
        <span className="text-base">Znám</span>
      </button>
    </div>
  );
};

export default ActionButtons;