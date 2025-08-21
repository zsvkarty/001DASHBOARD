import { FlashcardProgress, FlashcardStorage } from '../types';

// LocalStorage key for flashcard progress
const FLASHCARD_PROGRESS_KEY = 'flashcard_progress';

/**
 * Save progress for a specific flashcard topic to localStorage
 */
export const saveProgress = (
  topicId: string, 
  progress: Omit<FlashcardProgress, 'topicId'>
): void => {
  try {
    const existingData = getAllProgress();
    const updatedData: FlashcardStorage = {
      ...existingData,
      [topicId]: {
        topicId,
        ...progress,
        lastStudied: new Date().toISOString()
      }
    };
    
    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to save flashcard progress:', error);
    // Handle localStorage quota exceeded or other errors gracefully
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Consider clearing old data.');
    }
  }
};

/**
 * Load progress for a specific flashcard topic from localStorage
 */
export const loadProgress = (topicId: string): FlashcardProgress | null => {
  try {
    const allProgress = getAllProgress();
    return allProgress[topicId] || null;
  } catch (error) {
    console.error('Failed to load flashcard progress:', error);
    return null;
  }
};

/**
 * Get all flashcard progress data from localStorage
 */
export const getAllProgress = (): FlashcardStorage => {
  try {
    const data = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
    if (!data) {
      return {};
    }
    
    const parsed = JSON.parse(data);
    
    // Validate the structure of loaded data
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('Invalid flashcard progress data structure, resetting...');
      return {};
    }
    
    // Validate each progress entry
    const validatedData: FlashcardStorage = {};
    Object.entries(parsed).forEach(([topicId, progress]) => {
      if (isValidProgress(progress)) {
        validatedData[topicId] = progress as FlashcardProgress;
      } else {
        console.warn(`Invalid progress data for topic ${topicId}, skipping...`);
      }
    });
    
    return validatedData;
  } catch (error) {
    console.error('Failed to parse flashcard progress data:', error);
    return {};
  }
};

/**
 * Clear progress for a specific flashcard topic
 */
export const clearProgress = (topicId: string): void => {
  try {
    const existingData = getAllProgress();
    delete existingData[topicId];
    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(existingData));
  } catch (error) {
    console.error('Failed to clear flashcard progress:', error);
  }
};

/**
 * Check if a topic is completed
 */
export const isTopicCompleted = (topicId: string): boolean => {
  const progress = loadProgress(topicId);
  return progress?.isCompleted || false;
};

/**
 * Get completion status for all topics
 */
export const getTopicCompletionStatus = (): Record<string, boolean> => {
  const allProgress = getAllProgress();
  const completionStatus: Record<string, boolean> = {};
  
  Object.entries(allProgress).forEach(([topicId, progress]) => {
    completionStatus[topicId] = progress.isCompleted;
  });
  
  return completionStatus;
};

/**
 * Reset all flashcard progress (useful for testing or user preference)
 */
export const resetAllProgress = (): void => {
  try {
    localStorage.removeItem(FLASHCARD_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to reset flashcard progress:', error);
  }
};

/**
 * Get progress statistics for a topic
 */
export const getTopicStats = (topicId: string): {
  completed: boolean;
  progress: number;
  knownCount: number;
  unknownCount: number;
  totalCards: number;
  isMainRoundComplete: boolean;
  needsRevision: boolean;
} | null => {
  const progress = loadProgress(topicId);
  if (!progress) {
    return null;
  }
  
  const knownCount = progress.knownCards.length;
  const unknownCount = progress.unknownCards.length;
  const totalAnswered = knownCount + unknownCount;
  
  // Check if main round is complete (all cards have been answered once)
  const isMainRoundComplete = totalAnswered >= progress.totalCards;
  
  // Check if revision is needed (there are unknown cards from the main round)
  const needsRevision = unknownCount > 0 && isMainRoundComplete;
  
  // Calculate progress percentage
  let progressPercentage: number;
  if (progress.isCompleted) {
    // If the set is marked as completed, show 100%
    progressPercentage = 100;
  } else if (isMainRoundComplete) {
    // If main round is complete but not fully completed, show 100% (ready for revision)
    progressPercentage = 100;
  } else {
    // Still in progress through the main round
    progressPercentage = progress.totalCards > 0 
      ? (totalAnswered / progress.totalCards) * 100 
      : 0;
  }
  
  return {
    completed: progress.isCompleted,
    progress: Math.round(progressPercentage),
    knownCount,
    unknownCount,
    totalCards: progress.totalCards,
    isMainRoundComplete,
    needsRevision
  };
};

/**
 * Validate if a progress object has the correct structure
 */
const isValidProgress = (progress: any): progress is FlashcardProgress => {
  return (
    progress &&
    typeof progress === 'object' &&
    typeof progress.topicId === 'string' &&
    typeof progress.currentIndex === 'number' &&
    Array.isArray(progress.knownCards) &&
    Array.isArray(progress.unknownCards) &&
    typeof progress.isCompleted === 'boolean' &&
    typeof progress.lastStudied === 'string' &&
    typeof progress.totalCards === 'number' &&
    progress.currentIndex >= 0 &&
    progress.totalCards >= 0 &&
    progress.knownCards.every((id: any) => typeof id === 'number') &&
    progress.unknownCards.every((id: any) => typeof id === 'number')
  );
};

/**
 * Migrate old data format if needed (for future compatibility)
 */
export const migrateProgressData = (): void => {
  try {
    const data = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
    if (!data) return;
    
    const parsed = JSON.parse(data);
    
    // Add migration logic here if data format changes in the future
    // For now, just validate and clean up invalid entries
    const validatedData: FlashcardStorage = {};
    Object.entries(parsed).forEach(([topicId, progress]) => {
      if (isValidProgress(progress)) {
        validatedData[topicId] = progress as FlashcardProgress;
      }
    });
    
    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(validatedData));
  } catch (error) {
    console.error('Failed to migrate flashcard progress data:', error);
  }
};