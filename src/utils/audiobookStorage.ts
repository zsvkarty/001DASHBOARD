// Audio progress storage utilities
export interface AudioProgress {
  chapterId: string;
  currentTime: number;
  duration: number;
  lastPlayed: string; // ISO date string
  isCompleted: boolean;
}

export interface AudioStorage {
  [chapterId: string]: AudioProgress;
}

const AUDIO_STORAGE_KEY = 'audiobook_progress';

// Get all audio progress from localStorage
export const getAllAudioProgress = (): AudioStorage => {
  try {
    const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading audio progress:', error);
    return {};
  }
};

// Save audio progress to localStorage
export const saveAudioProgress = (chapterId: string, progress: Omit<AudioProgress, 'chapterId'>): void => {
  try {
    const allProgress = getAllAudioProgress();
    allProgress[chapterId] = {
      chapterId,
      ...progress
    };
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving audio progress:', error);
  }
};

// Get progress for a specific chapter
export const getChapterProgress = (chapterId: string): AudioProgress | null => {
  const allProgress = getAllAudioProgress();
  return allProgress[chapterId] || null;
};

// Get the most recently played chapter
export const getMostRecentChapter = (): AudioProgress | null => {
  const allProgress = getAllAudioProgress();
  const chapters = Object.values(allProgress);
  
  if (chapters.length === 0) return null;
  
  return chapters.reduce((mostRecent, current) => {
    const currentTime = new Date(current.lastPlayed).getTime();
    const mostRecentTime = new Date(mostRecent.lastPlayed).getTime();
    return currentTime > mostRecentTime ? current : mostRecent;
  });
};

// Get audio stats for progress display
export const getAudioStats = () => {
  const allProgress = getAllAudioProgress();
  const chapters = Object.values(allProgress);
  
  if (chapters.length === 0) {
    return {
      currentChapter: null,
      currentTime: 0,
      duration: 0,
      progress: 0,
      lastPlayed: null
    };
  }
  
  const mostRecent = getMostRecentChapter();
  if (!mostRecent) {
    return {
      currentChapter: null,
      currentTime: 0,
      duration: 0,
      progress: 0,
      lastPlayed: null
    };
  }
  
  return {
    currentChapter: mostRecent.chapterId,
    currentTime: mostRecent.currentTime,
    duration: mostRecent.duration,
    progress: mostRecent.duration > 0 ? (mostRecent.currentTime / mostRecent.duration) * 100 : 0,
    lastPlayed: new Date(mostRecent.lastPlayed)
  };
};