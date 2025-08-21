import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserStats } from '../components/settings/StatsSection';

interface StudySession {
  userId: string;
  date: string;
  minutes: number;
  xpEarned: number;
  activity: 'flashcard' | 'audiobook' | 'textbook' | 'exercise';
  createdAt: Date;
}

interface UserProgressData {
  flashcardProgress: any[];
  textbookProgress: any[];
  audiobookProgress: any[];
  exerciseProgress: any[];
}

export const getUserStatistics = async (uid: string): Promise<UserStats> => {
  try {
    // Get user's study sessions
    const studySessionsQuery = query(
      collection(db, 'studySessions'),
      where('userId', '==', uid),
      orderBy('date', 'desc'),
      limit(30) // Get last 30 sessions for recent activity
    );
    const studySessionsSnapshot = await getDocs(studySessionsQuery);
    const studySessions: StudySession[] = studySessionsSnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as StudySession[];

    // Get user's gamification data
    const gamificationDocRef = doc(db, 'gamification', uid);
    const gamificationDoc = await getDoc(gamificationDocRef);
    const gamificationData = gamificationDoc.exists() ? gamificationDoc.data() : null;

    // Get user's progress data
    const progressData = await getUserProgressData(uid);

    // Calculate statistics
    const stats = calculateStatistics(studySessions, gamificationData, progressData);

    return stats;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw new Error('Failed to fetch user statistics');
  }
};

const getUserProgressData = async (uid: string): Promise<UserProgressData> => {
  try {
    const progressData: UserProgressData = {
      flashcardProgress: [],
      textbookProgress: [],
      audiobookProgress: [],
      exerciseProgress: []
    };

    // Get flashcard progress
    const flashcardProgressQuery = query(
      collection(db, 'flashcardProgress'),
      where('userId', '==', uid)
    );
    const flashcardProgressSnapshot = await getDocs(flashcardProgressQuery);
    progressData.flashcardProgress = flashcardProgressSnapshot.docs.map(doc => doc.data());

    // Get textbook progress
    const textbookProgressQuery = query(
      collection(db, 'textbookProgress'),
      where('userId', '==', uid)
    );
    const textbookProgressSnapshot = await getDocs(textbookProgressQuery);
    progressData.textbookProgress = textbookProgressSnapshot.docs.map(doc => doc.data());

    // Get audiobook progress
    const audiobookProgressQuery = query(
      collection(db, 'audiobookProgress'),
      where('userId', '==', uid)
    );
    const audiobookProgressSnapshot = await getDocs(audiobookProgressQuery);
    progressData.audiobookProgress = audiobookProgressSnapshot.docs.map(doc => doc.data());

    return progressData;
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return {
      flashcardProgress: [],
      textbookProgress: [],
      audiobookProgress: [],
      exerciseProgress: []
    };
  }
};

const calculateStatistics = (
  studySessions: StudySession[],
  gamificationData: any,
  progressData: UserProgressData
): UserStats => {
  // Calculate total study time
  const totalStudyTime = studySessions.reduce((total, session) => total + session.minutes, 0);

  // Calculate completed modules
  const completedModules = 
    progressData.flashcardProgress.filter(p => p.isCompleted).length +
    progressData.textbookProgress.filter(p => p.isCompleted).length +
    progressData.audiobookProgress.filter(p => p.isCompleted).length;

  // Get streak data from gamification
  const currentStreak = gamificationData?.streak?.current || 0;
  const longestStreak = gamificationData?.streak?.longest || 0;

  // Get XP data from gamification
  const totalXP = gamificationData?.xp?.total || 0;

  // Get badges count from gamification
  const badgesEarned = gamificationData?.badges?.length || 0;

  // Calculate average session time
  const averageSessionTime = studySessions.length > 0 
    ? Math.round(totalStudyTime / studySessions.length)
    : 0;

  // Format study history
  const studyHistory = studySessions.slice(0, 10).map(session => ({
    date: session.date,
    minutes: session.minutes,
    xpEarned: session.xpEarned
  }));

  return {
    totalStudyTime,
    completedModules,
    currentStreak,
    longestStreak,
    totalXP,
    badgesEarned,
    averageSessionTime,
    studyHistory
  };
};

// Cache for statistics to avoid frequent Firestore calls
const statsCache = new Map<string, { data: UserStats; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedUserStatistics = async (uid: string): Promise<UserStats> => {
  const cached = statsCache.get(uid);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const stats = await getUserStatistics(uid);
  statsCache.set(uid, { data: stats, timestamp: now });
  
  return stats;
};

// Function to invalidate cache when user completes activities
export const invalidateStatsCache = (uid: string): void => {
  statsCache.delete(uid);
};

// Mock data generator for development/testing
export const generateMockStats = (): UserStats => {
  const now = new Date();
  const studyHistory = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    studyHistory.push({
      date: date.toISOString(),
      minutes: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
      xpEarned: Math.floor(Math.random() * 200) + 50 // 50-250 XP
    });
  }

  return {
    totalStudyTime: Math.floor(Math.random() * 2000) + 500, // 500-2500 minutes
    completedModules: Math.floor(Math.random() * 20) + 5, // 5-25 modules
    currentStreak: Math.floor(Math.random() * 30) + 1, // 1-30 days
    longestStreak: Math.floor(Math.random() * 50) + 10, // 10-60 days
    totalXP: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 XP
    badgesEarned: Math.floor(Math.random() * 15) + 3, // 3-18 badges
    averageSessionTime: Math.floor(Math.random() * 40) + 20, // 20-60 minutes
    studyHistory
  };
};