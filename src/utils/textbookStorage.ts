import { ChapterProgress, TextbookProgress } from '../types';

// LocalStorage key for textbook progress
const TEXTBOOK_PROGRESS_KEY = 'textbook_progress';

/**
 * Save progress for a specific textbook chapter to localStorage
 */
export const saveChapterProgress = (
  chapterId: string, 
  progress: Omit<ChapterProgress, 'chapterId'>
): void => {
  try {
    const existingData = getAllChapterProgress();
    const updatedData: TextbookProgress = {
      ...existingData,
      [chapterId]: {
        chapterId,
        ...progress,
        completedAt: progress.isCompleted ? new Date() : progress.completedAt
      }
    };
    
    localStorage.setItem(TEXTBOOK_PROGRESS_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to save textbook progress:', error);
    // Handle localStorage quota exceeded or other errors gracefully
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Consider clearing old data.');
    }
  }
};

/**
 * Load progress for a specific textbook chapter from localStorage
 */
export const loadChapterProgress = (chapterId: string): ChapterProgress | null => {
  try {
    const allProgress = getAllChapterProgress();
    return allProgress[chapterId] || null;
  } catch (error) {
    console.error('Failed to load textbook progress:', error);
    return null;
  }
};

/**
 * Get all textbook progress data from localStorage
 */
export const getAllChapterProgress = (): TextbookProgress => {
  try {
    const data = localStorage.getItem(TEXTBOOK_PROGRESS_KEY);
    if (!data) {
      return {};
    }
    
    const parsed = JSON.parse(data);
    
    // Validate the structure of loaded data
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('Invalid textbook progress data structure, resetting...');
      return {};
    }
    
    // Validate each progress entry
    const validatedData: TextbookProgress = {};
    Object.entries(parsed).forEach(([chapterId, progress]) => {
      if (isValidChapterProgress(progress)) {
        const validProgress = progress as ChapterProgress;
        // Convert string dates back to Date objects if needed
        if (validProgress.completedAt && typeof validProgress.completedAt === 'string') {
          validProgress.completedAt = new Date(validProgress.completedAt);
        }
        validatedData[chapterId] = validProgress;
      } else {
        console.warn(`Invalid progress data for chapter ${chapterId}, skipping...`);
      }
    });
    
    return validatedData;
  } catch (error) {
    console.error('Failed to parse textbook progress data:', error);
    return {};
  }
};

/**
 * Clear progress for a specific textbook chapter
 */
export const clearChapterProgress = (chapterId: string): void => {
  try {
    const existingData = getAllChapterProgress();
    delete existingData[chapterId];
    localStorage.setItem(TEXTBOOK_PROGRESS_KEY, JSON.stringify(existingData));
  } catch (error) {
    console.error('Failed to clear textbook progress:', error);
  }
};

/**
 * Check if a chapter is completed
 */
export const isChapterCompleted = (chapterId: string): boolean => {
  const progress = loadChapterProgress(chapterId);
  return progress?.isCompleted || false;
};

/**
 * Get completion status for all chapters
 */
export const getChapterCompletionStatus = (): Record<string, boolean> => {
  const allProgress = getAllChapterProgress();
  const completionStatus: Record<string, boolean> = {};
  
  Object.entries(allProgress).forEach(([chapterId, progress]) => {
    completionStatus[chapterId] = progress.isCompleted;
  });
  
  return completionStatus;
};

/**
 * Reset all textbook progress (useful for testing or user preference)
 */
export const resetAllChapterProgress = (): void => {
  try {
    localStorage.removeItem(TEXTBOOK_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to reset textbook progress:', error);
  }
};

/**
 * Get progress statistics for a chapter
 */
export const getChapterStats = (chapterId: string): {
  completed: boolean;
  readingProgress: number;
  quizScore?: number;
  completedAt?: Date;
  hasQuizScore: boolean;
} | null => {
  const progress = loadChapterProgress(chapterId);
  if (!progress) {
    return null;
  }
  
  return {
    completed: progress.isCompleted,
    readingProgress: progress.readingProgress,
    quizScore: progress.quizScore,
    completedAt: progress.completedAt,
    hasQuizScore: progress.quizScore !== undefined
  };
};

/**
 * Update reading progress for a chapter
 */
export const updateReadingProgress = (chapterId: string, readingProgress: number): void => {
  const existingProgress = loadChapterProgress(chapterId);
  const updatedProgress: Omit<ChapterProgress, 'chapterId'> = {
    isCompleted: existingProgress?.isCompleted || false,
    quizScore: existingProgress?.quizScore,
    completedAt: existingProgress?.completedAt,
    readingProgress: Math.max(0, Math.min(100, readingProgress)) // Clamp between 0-100
  };
  
  saveChapterProgress(chapterId, updatedProgress);
};

/**
 * Complete a chapter with quiz score
 */
export const completeChapter = (chapterId: string, quizScore: number): void => {
  const existingProgress = loadChapterProgress(chapterId);
  const updatedProgress: Omit<ChapterProgress, 'chapterId'> = {
    isCompleted: true,
    quizScore: Math.max(0, Math.min(100, quizScore)), // Clamp between 0-100
    completedAt: new Date(),
    readingProgress: existingProgress?.readingProgress || 100 // Assume reading is complete
  };
  
  saveChapterProgress(chapterId, updatedProgress);
};

/**
 * Validate if a chapter progress object has the correct structure
 */
const isValidChapterProgress = (progress: any): progress is ChapterProgress => {
  return (
    progress &&
    typeof progress === 'object' &&
    typeof progress.chapterId === 'string' &&
    typeof progress.isCompleted === 'boolean' &&
    typeof progress.readingProgress === 'number' &&
    progress.readingProgress >= 0 &&
    progress.readingProgress <= 100 &&
    (progress.quizScore === undefined || 
     (typeof progress.quizScore === 'number' && progress.quizScore >= 0 && progress.quizScore <= 100)) &&
    (progress.completedAt === undefined || progress.completedAt instanceof Date || typeof progress.completedAt === 'string')
  );
};

/**
 * Migrate old data format if needed (for future compatibility)
 */
export const migrateChapterProgressData = (): void => {
  try {
    const data = localStorage.getItem(TEXTBOOK_PROGRESS_KEY);
    if (!data) return;
    
    const parsed = JSON.parse(data);
    
    // Add migration logic here if data format changes in the future
    // For now, just validate and clean up invalid entries
    const validatedData: TextbookProgress = {};
    Object.entries(parsed).forEach(([chapterId, progress]) => {
      if (isValidChapterProgress(progress)) {
        // Convert string dates back to Date objects if needed
        const validProgress = progress as ChapterProgress;
        if (validProgress.completedAt && typeof validProgress.completedAt === 'string') {
          validProgress.completedAt = new Date(validProgress.completedAt);
        }
        validatedData[chapterId] = validProgress;
      }
    });
    
    localStorage.setItem(TEXTBOOK_PROGRESS_KEY, JSON.stringify(validatedData));
  } catch (error) {
    console.error('Failed to migrate textbook progress data:', error);
  }
};