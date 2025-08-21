import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FlashcardProgress, ChapterProgress } from '../types';
import { AudioProgress } from '../utils/audiobookStorage';

export interface UserProgress {
    userId: string;
    flashcards: { [topicId: string]: FlashcardProgress };
    textbooks: { [chapterId: string]: ChapterProgress };
    audiobooks: { [chapterId: string]: AudioProgress };
    lastUpdated: Date;
}

export const progressService = {
    // ===== FLASHCARD PROGRESS =====

    async saveFlashcardProgress(userId: string, topicId: string, progress: Omit<FlashcardProgress, 'topicId'>): Promise<void> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            const flashcardProgress: FlashcardProgress = {
                topicId,
                ...progress,
                lastStudied: new Date().toISOString()
            };

            if (progressDoc.exists()) {
                const existingData = progressDoc.data() as UserProgress;
                await updateDoc(progressRef, {
                    [`flashcards.${topicId}`]: flashcardProgress,
                    lastUpdated: new Date()
                });
            } else {
                const newProgressData: UserProgress = {
                    userId,
                    flashcards: { [topicId]: flashcardProgress },
                    textbooks: {},
                    audiobooks: {},
                    lastUpdated: new Date()
                };
                await setDoc(progressRef, newProgressData);
            }
        } catch (error) {
            console.error('Error saving flashcard progress:', error);
            throw error;
        }
    },

    async loadFlashcardProgress(userId: string, topicId: string): Promise<FlashcardProgress | null> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.flashcards?.[topicId] || null;
            }
            return null;
        } catch (error) {
            console.error('Error loading flashcard progress:', error);
            return null;
        }
    },

    async getAllFlashcardProgress(userId: string): Promise<{ [topicId: string]: FlashcardProgress }> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.flashcards || {};
            }
            return {};
        } catch (error) {
            console.error('Error loading all flashcard progress:', error);
            return {};
        }
    },

    // ===== TEXTBOOK PROGRESS =====

    async saveTextbookProgress(userId: string, chapterId: string, progress: Omit<ChapterProgress, 'chapterId'>): Promise<void> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            const chapterProgress: ChapterProgress = {
                chapterId,
                ...progress,
                completedAt: progress.isCompleted ? new Date() : progress.completedAt
            };

            if (progressDoc.exists()) {
                await updateDoc(progressRef, {
                    [`textbooks.${chapterId}`]: chapterProgress,
                    lastUpdated: new Date()
                });
            } else {
                const newProgressData: UserProgress = {
                    userId,
                    flashcards: {},
                    textbooks: { [chapterId]: chapterProgress },
                    audiobooks: {},
                    lastUpdated: new Date()
                };
                await setDoc(progressRef, newProgressData);
            }
        } catch (error) {
            console.error('Error saving textbook progress:', error);
            throw error;
        }
    },

    async loadTextbookProgress(userId: string, chapterId: string): Promise<ChapterProgress | null> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.textbooks?.[chapterId] || null;
            }
            return null;
        } catch (error) {
            console.error('Error loading textbook progress:', error);
            return null;
        }
    },

    async getAllTextbookProgress(userId: string): Promise<{ [chapterId: string]: ChapterProgress }> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.textbooks || {};
            }
            return {};
        } catch (error) {
            console.error('Error loading all textbook progress:', error);
            return {};
        }
    },

    // ===== AUDIOBOOK PROGRESS =====

    async saveAudiobookProgress(userId: string, chapterId: string, progress: Omit<AudioProgress, 'chapterId'>): Promise<void> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            const audioProgress: AudioProgress = {
                chapterId,
                ...progress
            };

            if (progressDoc.exists()) {
                await updateDoc(progressRef, {
                    [`audiobooks.${chapterId}`]: audioProgress,
                    lastUpdated: new Date()
                });
            } else {
                const newProgressData: UserProgress = {
                    userId,
                    flashcards: {},
                    textbooks: {},
                    audiobooks: { [chapterId]: audioProgress },
                    lastUpdated: new Date()
                };
                await setDoc(progressRef, newProgressData);
            }
        } catch (error) {
            console.error('Error saving audiobook progress:', error);
            throw error;
        }
    },

    async loadAudiobookProgress(userId: string, chapterId: string): Promise<AudioProgress | null> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.audiobooks?.[chapterId] || null;
            }
            return null;
        } catch (error) {
            console.error('Error loading audiobook progress:', error);
            return null;
        }
    },

    async getAllAudiobookProgress(userId: string): Promise<{ [chapterId: string]: AudioProgress }> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const data = progressDoc.data() as UserProgress;
                return data.audiobooks || {};
            }
            return {};
        } catch (error) {
            console.error('Error loading all audiobook progress:', error);
            return {};
        }
    },

    // ===== MIGRATION UTILITIES =====

    async migrateFromLocalStorage(userId: string): Promise<void> {
        try {
            console.log('Starting migration from localStorage to Firebase...');

            // Get existing localStorage data
            const flashcardData = JSON.parse(localStorage.getItem('flashcard_progress') || '{}');
            const textbookData = JSON.parse(localStorage.getItem('textbook_progress') || '{}');
            const audiobookData = JSON.parse(localStorage.getItem('audiobook_progress') || '{}');

            // Check if there's any data to migrate
            const hasFlashcardData = Object.keys(flashcardData).length > 0;
            const hasTextbookData = Object.keys(textbookData).length > 0;
            const hasAudiobookData = Object.keys(audiobookData).length > 0;

            if (!hasFlashcardData && !hasTextbookData && !hasAudiobookData) {
                console.log('No localStorage data to migrate');
                return;
            }

            // Create the progress document
            const progressData: UserProgress = {
                userId,
                flashcards: flashcardData,
                textbooks: textbookData,
                audiobooks: audiobookData,
                lastUpdated: new Date()
            };

            const progressRef = doc(db, 'userProgress', userId);
            await setDoc(progressRef, progressData);

            console.log('Migration completed successfully');

            // Optionally clear localStorage after successful migration
            // localStorage.removeItem('flashcard_progress');
            // localStorage.removeItem('textbook_progress');
            // localStorage.removeItem('audiobook_progress');

        } catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    },

    // ===== UTILITY FUNCTIONS =====

    async getUserProgressSummary(userId: string): Promise<{
        totalFlashcardTopics: number;
        completedFlashcardTopics: number;
        totalTextbookChapters: number;
        completedTextbookChapters: number;
        totalAudiobookChapters: number;
        completedAudiobookChapters: number;
        lastActivity: Date | null;
    }> {
        try {
            const progressRef = doc(db, 'userProgress', userId);
            const progressDoc = await getDoc(progressRef);

            if (!progressDoc.exists()) {
                return {
                    totalFlashcardTopics: 0,
                    completedFlashcardTopics: 0,
                    totalTextbookChapters: 0,
                    completedTextbookChapters: 0,
                    totalAudiobookChapters: 0,
                    completedAudiobookChapters: 0,
                    lastActivity: null
                };
            }

            const data = progressDoc.data() as UserProgress;

            const flashcards = Object.values(data.flashcards || {});
            const textbooks = Object.values(data.textbooks || {});
            const audiobooks = Object.values(data.audiobooks || {});

            return {
                totalFlashcardTopics: flashcards.length,
                completedFlashcardTopics: flashcards.filter(f => f.isCompleted).length,
                totalTextbookChapters: textbooks.length,
                completedTextbookChapters: textbooks.filter(t => t.isCompleted).length,
                totalAudiobookChapters: audiobooks.length,
                completedAudiobookChapters: audiobooks.filter(a => a.isCompleted).length,
                lastActivity: data.lastUpdated
            };
        } catch (error) {
            console.error('Error getting progress summary:', error);
            throw error;
        }
    }
};