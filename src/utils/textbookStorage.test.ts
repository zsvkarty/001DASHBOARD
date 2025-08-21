import {
  saveChapterProgress,
  loadChapterProgress,
  getAllChapterProgress,
  clearChapterProgress,
  isChapterCompleted,
  getChapterCompletionStatus,
  resetAllChapterProgress,
  getChapterStats,
  updateReadingProgress,
  completeChapter,
  migrateChapterProgressData
} from './textbookStorage';
import { ChapterProgress } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('textbookStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveChapterProgress and loadChapterProgress', () => {
    it('should save and load chapter progress correctly', () => {
      const chapterId = 'test-chapter';
      const progress = {
        isCompleted: false,
        readingProgress: 50,
        quizScore: undefined,
        completedAt: undefined
      };

      saveChapterProgress(chapterId, progress);
      const loaded = loadChapterProgress(chapterId);

      expect(loaded).toEqual({
        chapterId,
        ...progress
      });
    });

    it('should return null for non-existent chapter', () => {
      const loaded = loadChapterProgress('non-existent');
      expect(loaded).toBeNull();
    });

    it('should handle completed chapter with quiz score', () => {
      const chapterId = 'completed-chapter';
      const completedAt = new Date();
      const progress = {
        isCompleted: true,
        readingProgress: 100,
        quizScore: 85,
        completedAt
      };

      saveChapterProgress(chapterId, progress);
      const loaded = loadChapterProgress(chapterId);

      expect(loaded).toEqual({
        chapterId,
        ...progress
      });
    });
  });

  describe('getAllChapterProgress', () => {
    it('should return empty object when no data exists', () => {
      const allProgress = getAllChapterProgress();
      expect(allProgress).toEqual({});
    });

    it('should return all saved progress', () => {
      const chapter1Progress = {
        isCompleted: true,
        readingProgress: 100,
        quizScore: 90,
        completedAt: new Date()
      };
      const chapter2Progress = {
        isCompleted: false,
        readingProgress: 30,
        quizScore: undefined,
        completedAt: undefined
      };

      saveChapterProgress('chapter1', chapter1Progress);
      saveChapterProgress('chapter2', chapter2Progress);

      const allProgress = getAllChapterProgress();
      expect(Object.keys(allProgress)).toHaveLength(2);
      expect(allProgress['chapter1']).toEqual({
        chapterId: 'chapter1',
        ...chapter1Progress
      });
      expect(allProgress['chapter2']).toEqual({
        chapterId: 'chapter2',
        ...chapter2Progress
      });
    });
  });

  describe('clearChapterProgress', () => {
    it('should remove specific chapter progress', () => {
      saveChapterProgress('chapter1', { isCompleted: false, readingProgress: 50 });
      saveChapterProgress('chapter2', { isCompleted: true, readingProgress: 100 });

      clearChapterProgress('chapter1');

      expect(loadChapterProgress('chapter1')).toBeNull();
      expect(loadChapterProgress('chapter2')).not.toBeNull();
    });
  });

  describe('isChapterCompleted', () => {
    it('should return true for completed chapter', () => {
      saveChapterProgress('completed', { isCompleted: true, readingProgress: 100 });
      expect(isChapterCompleted('completed')).toBe(true);
    });

    it('should return false for incomplete chapter', () => {
      saveChapterProgress('incomplete', { isCompleted: false, readingProgress: 50 });
      expect(isChapterCompleted('incomplete')).toBe(false);
    });

    it('should return false for non-existent chapter', () => {
      expect(isChapterCompleted('non-existent')).toBe(false);
    });
  });

  describe('getChapterCompletionStatus', () => {
    it('should return completion status for all chapters', () => {
      saveChapterProgress('chapter1', { isCompleted: true, readingProgress: 100 });
      saveChapterProgress('chapter2', { isCompleted: false, readingProgress: 30 });

      const status = getChapterCompletionStatus();
      expect(status).toEqual({
        chapter1: true,
        chapter2: false
      });
    });
  });

  describe('resetAllChapterProgress', () => {
    it('should clear all progress data', () => {
      saveChapterProgress('chapter1', { isCompleted: true, readingProgress: 100 });
      saveChapterProgress('chapter2', { isCompleted: false, readingProgress: 50 });

      resetAllChapterProgress();

      expect(getAllChapterProgress()).toEqual({});
    });
  });

  describe('getChapterStats', () => {
    it('should return null for non-existent chapter', () => {
      const stats = getChapterStats('non-existent');
      expect(stats).toBeNull();
    });

    it('should return correct stats for chapter with quiz score', () => {
      const completedAt = new Date();
      saveChapterProgress('chapter1', {
        isCompleted: true,
        readingProgress: 100,
        quizScore: 85,
        completedAt
      });

      const stats = getChapterStats('chapter1');
      expect(stats).toEqual({
        completed: true,
        readingProgress: 100,
        quizScore: 85,
        completedAt,
        hasQuizScore: true
      });
    });

    it('should return correct stats for chapter without quiz score', () => {
      saveChapterProgress('chapter2', {
        isCompleted: false,
        readingProgress: 60,
        quizScore: undefined,
        completedAt: undefined
      });

      const stats = getChapterStats('chapter2');
      expect(stats).toEqual({
        completed: false,
        readingProgress: 60,
        quizScore: undefined,
        completedAt: undefined,
        hasQuizScore: false
      });
    });
  });

  describe('updateReadingProgress', () => {
    it('should update reading progress for existing chapter', () => {
      saveChapterProgress('chapter1', { isCompleted: false, readingProgress: 30 });
      
      updateReadingProgress('chapter1', 75);
      
      const progress = loadChapterProgress('chapter1');
      expect(progress?.readingProgress).toBe(75);
      expect(progress?.isCompleted).toBe(false);
    });

    it('should create new progress entry for new chapter', () => {
      updateReadingProgress('new-chapter', 25);
      
      const progress = loadChapterProgress('new-chapter');
      expect(progress?.readingProgress).toBe(25);
      expect(progress?.isCompleted).toBe(false);
    });

    it('should clamp reading progress between 0 and 100', () => {
      updateReadingProgress('chapter1', -10);
      expect(loadChapterProgress('chapter1')?.readingProgress).toBe(0);

      updateReadingProgress('chapter1', 150);
      expect(loadChapterProgress('chapter1')?.readingProgress).toBe(100);
    });
  });

  describe('completeChapter', () => {
    it('should mark chapter as completed with quiz score', () => {
      completeChapter('chapter1', 90);
      
      const progress = loadChapterProgress('chapter1');
      expect(progress?.isCompleted).toBe(true);
      expect(progress?.quizScore).toBe(90);
      expect(progress?.readingProgress).toBe(100);
      expect(progress?.completedAt).toBeInstanceOf(Date);
    });

    it('should preserve existing reading progress when completing', () => {
      saveChapterProgress('chapter1', { isCompleted: false, readingProgress: 80 });
      
      completeChapter('chapter1', 85);
      
      const progress = loadChapterProgress('chapter1');
      expect(progress?.readingProgress).toBe(80);
      expect(progress?.isCompleted).toBe(true);
      expect(progress?.quizScore).toBe(85);
    });

    it('should clamp quiz score between 0 and 100', () => {
      completeChapter('chapter1', -5);
      expect(loadChapterProgress('chapter1')?.quizScore).toBe(0);

      completeChapter('chapter2', 150);
      expect(loadChapterProgress('chapter2')?.quizScore).toBe(100);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => {
        saveChapterProgress('test', { isCompleted: false, readingProgress: 50 });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('should handle invalid JSON data', () => {
      localStorage.setItem('textbook_progress', 'invalid json');
      
      const progress = getAllChapterProgress();
      expect(progress).toEqual({});
    });
  });
});