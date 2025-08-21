import { progressService } from '../services/progressService';
import { FlashcardProgress, ChapterProgress } from '../types';
import { AudioProgress } from './audiobookStorage';

// Get current user ID from auth context
let currentUserId: string | null = null;

export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
};

// ===== FLASHCARD STORAGE (Firebase-backed) =====

export const saveProgress = async (
  topicId: string, 
  progress: Omit<FlashcardProgress, 'topicId'>
): Promise<void> => {
  if (!currentUserId) {
    console.warn('No user logged in, cannot save progress');
    return;
  }
  
  try {
    await progressService.saveFlashcardProgress(currentUserId, topicId, progress);
  } catch (error) {
    console.error('Failed to save flashcard progress:', error);
    // Fallback to localStorage if Firebase fails
    const existingData = JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
    const updatedData = {
      ...existingData,
      [topicId]: {
        topicId,
        ...progress,
        lastStudied: new Date().toISOString()
      }
    };
    localStorage.setItem('flashcard_progress', JSON.stringify(updatedData));
  }
};

export const loadProgress = async (topicId: string): Promise<FlashcardProgress | null> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    const allProgress = JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
    return allProgress[topicId] || null;
  }
  
  try {
    return await progressService.loadFlashcardProgress(currentUserId, topicId);
  } catch (error) {
    console.error('Failed to load flashcard progress from Firebase, falling back to localStorage:', error);
    const allProgress = JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
    return allProgress[topicId] || null;
  }
};

export const getAllProgress = async (): Promise<{ [topicId: string]: FlashcardProgress }> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    return JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
  }
  
  try {
    return await progressService.getAllFlashcardProgress(currentUserId);
  } catch (error) {
    console.error('Failed to load all flashcard progress from Firebase, falling back to localStorage:', error);
    return JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
  }
};

// ===== TEXTBOOK STORAGE (Firebase-backed) =====

export const saveChapterProgress = async (
  chapterId: string, 
  progress: Omit<ChapterProgress, 'chapterId'>
): Promise<void> => {
  if (!currentUserId) {
    console.warn('No user logged in, cannot save chapter progress');
    return;
  }
  
  try {
    await progressService.saveTextbookProgress(currentUserId, chapterId, progress);
  } catch (error) {
    console.error('Failed to save textbook progress:', error);
    // Fallback to localStorage if Firebase fails
    const existingData = JSON.parse(localStorage.getItem('textbook_progress') || '{}');
    const updatedData = {
      ...existingData,
      [chapterId]: {
        chapterId,
        ...progress,
        completedAt: progress.isCompleted ? new Date() : progress.completedAt
      }
    };
    localStorage.setItem('textbook_progress', JSON.stringify(updatedData));
  }
};

export const loadChapterProgress = async (chapterId: string): Promise<ChapterProgress | null> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    const allProgress = JSON.parse(localStorage.getItem('textbook_progress') || '{}');
    return allProgress[chapterId] || null;
  }
  
  try {
    return await progressService.loadTextbookProgress(currentUserId, chapterId);
  } catch (error) {
    console.error('Failed to load textbook progress from Firebase, falling back to localStorage:', error);
    const allProgress = JSON.parse(localStorage.getItem('textbook_progress') || '{}');
    return allProgress[chapterId] || null;
  }
};

export const getAllChapterProgress = async (): Promise<{ [chapterId: string]: ChapterProgress }> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    return JSON.parse(localStorage.getItem('textbook_progress') || '{}');
  }
  
  try {
    return await progressService.getAllTextbookProgress(currentUserId);
  } catch (error) {
    console.error('Failed to load all textbook progress from Firebase, falling back to localStorage:', error);
    return JSON.parse(localStorage.getItem('textbook_progress') || '{}');
  }
};

// ===== AUDIOBOOK STORAGE (Firebase-backed) =====

export const saveAudioProgress = async (
  chapterId: string, 
  progress: Omit<AudioProgress, 'chapterId'>
): Promise<void> => {
  if (!currentUserId) {
    console.warn('No user logged in, cannot save audio progress');
    return;
  }
  
  try {
    await progressService.saveAudiobookProgress(currentUserId, chapterId, progress);
  } catch (error) {
    console.error('Failed to save audiobook progress:', error);
    // Fallback to localStorage if Firebase fails
    const existingData = JSON.parse(localStorage.getItem('audiobook_progress') || '{}');
    const updatedData = {
      ...existingData,
      [chapterId]: {
        chapterId,
        ...progress
      }
    };
    localStorage.setItem('audiobook_progress', JSON.stringify(updatedData));
  }
};

export const getChapterProgress = async (chapterId: string): Promise<AudioProgress | null> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    const allProgress = JSON.parse(localStorage.getItem('audiobook_progress') || '{}');
    return allProgress[chapterId] || null;
  }
  
  try {
    return await progressService.loadAudiobookProgress(currentUserId, chapterId);
  } catch (error) {
    console.error('Failed to load audiobook progress from Firebase, falling back to localStorage:', error);
    const allProgress = JSON.parse(localStorage.getItem('audiobook_progress') || '{}');
    return allProgress[chapterId] || null;
  }
};

export const getAllAudioProgress = async (): Promise<{ [chapterId: string]: AudioProgress }> => {
  if (!currentUserId) {
    console.warn('No user logged in, loading from localStorage');
    return JSON.parse(localStorage.getItem('audiobook_progress') || '{}');
  }
  
  try {
    return await progressService.getAllAudiobookProgress(currentUserId);
  } catch (error) {
    console.error('Failed to load all audiobook progress from Firebase, falling back to localStorage:', error);
    return JSON.parse(localStorage.getItem('audiobook_progress') || '{}');
  }
};

// ===== UTILITY FUNCTIONS =====

export const getTopicStats = async (topicId: string): Promise<{
  completed: boolean;
  progress: number;
  knownCount: number;
  unknownCount: number;
  totalCards: number;
  isMainRoundComplete: boolean;
  needsRevision: boolean;
} | null> => {
  const progress = await loadProgress(topicId);
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

export const getChapterStats = async (chapterId: string): Promise<{
  completed: boolean;
  readingProgress: number;
  quizScore?: number;
  completedAt?: Date;
  hasQuizScore: boolean;
} | null> => {
  const progress = await loadChapterProgress(chapterId);
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

// ===== MIGRATION UTILITY =====

export const migrateToFirebase = async (): Promise<void> => {
  if (!currentUserId) {
    console.warn('No user logged in, cannot migrate to Firebase');
    return;
  }
  
  try {
    await progressService.migrateFromLocalStorage(currentUserId);
    console.log('Successfully migrated progress data to Firebase');
  } catch (error) {
    console.error('Failed to migrate progress data to Firebase:', error);
  }
};