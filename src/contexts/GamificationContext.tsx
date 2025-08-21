import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  GamificationContextType, 
  StreakData, 
  XPData, 
  Badge, 
  ActivityType,
  User
} from '../types';
import { calculateLevel } from '../utils/levelUtils';

// Default values for the context
const defaultStreakData: StreakData = {
  current: 0,
  longest: 0,
  lastUpdated: new Date(),
  milestones: [3, 7, 30, 100],
  milestonesReached: [],
};

const defaultXPData: XPData = {
  today: 0,
  total: 0,
  goal: 100,
  history: [],
  byActivity: {
    flashcard: 0,
    audiobook: 0,
    textbook: 0,
    exercise: 0,
  },
};

// Create the context with default values
const GamificationContext = createContext<GamificationContextType>({
  streak: defaultStreakData,
  xp: defaultXPData,
  badges: [],
  earnXP: () => {},
  updateStreak: () => {},
  checkBadgeEligibility: () => {},
  isNewBadgeEarned: false,
  setIsNewBadgeEarned: () => {},
  newestBadge: null,
  calculateLevel: () => 1,
  getXPNeededForNextLevel: () => ({ current: 0, needed: 100, nextLevel: 2 }),
});

// Custom hook to use the gamification context
export const useGamification = () => useContext(GamificationContext);

interface GamificationProviderProps {
  children: ReactNode;
  initialUser?: User;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ 
  children,
  initialUser
}) => {
  // Initialize state from user data if available, otherwise use defaults
  const [streak, setStreak] = useState<StreakData>(
    initialUser?.gamification?.streak || defaultStreakData
  );
  
  const [xp, setXP] = useState<XPData>(
    initialUser?.gamification?.xp || defaultXPData
  );
  
  const [badges, setBadges] = useState<Badge[]>(
    initialUser?.gamification?.badges || []
  );

  const [isNewBadgeEarned, setIsNewBadgeEarned] = useState<boolean>(false);
  const [newestBadge, setNewestBadge] = useState<Badge | null>(null);

  // Check if the streak needs to be reset (if last activity was more than a day ago)
  useEffect(() => {
    const checkStreakReset = () => {
      const now = new Date();
      const lastUpdated = new Date(streak.lastUpdated);
      
      // Reset streak if last activity was more than a day ago
      // Get the date part only (ignore time) for comparison
      const lastDate = new Date(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last update was before yesterday, reset streak
      if (lastDate < yesterday) {
        setStreak(prev => ({
          ...prev,
          current: 0,
          lastUpdated: now,
        }));
      }
    };
    
    checkStreakReset();
    
    // Check streak reset at midnight
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        checkStreakReset();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(midnightCheck);
  }, [streak.lastUpdated]);

  // Reset XP today at midnight
  useEffect(() => {
    const resetDailyXP = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      // Check if we already have an entry for today
      const hasTodayEntry = xp.history.some(entry => entry.date === todayStr);
      
      // Only reset if there's no entry for today AND we don't have initial user data with today's XP
      if (!hasTodayEntry && xp.today === 0) {
        // Add yesterday's XP to history if it exists
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        setXP(prev => {
          const updatedHistory = [...prev.history];
          
          // Add yesterday's XP to history if there was any
          if (prev.today > 0) {
            updatedHistory.push({
              date: yesterdayStr,
              amount: prev.today,
            });
          }
          
          return {
            ...prev,
            today: 0,
            history: updatedHistory,
          };
        });
      }
    };
    
    // Don't reset on initial mount, only set up the midnight check
    // resetDailyXP();
    
    // Check for day change at midnight
    const midnightCheck = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetDailyXP();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(midnightCheck);
  }, [xp.history, xp.today]);

  // Function to update streak when user completes an activity
  const updateStreak = () => {
    const now = new Date();
    const lastUpdated = new Date(streak.lastUpdated);
    
    // Get the date part only (ignore time) for comparison
    const lastDate = new Date(lastUpdated.getFullYear(), lastUpdated.getMonth(), lastUpdated.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Only update streak if it hasn't been updated today
    if (lastDate.getTime() !== today.getTime()) {
      setStreak(prev => {
        const newCurrent = prev.current + 1;
        const newLongest = Math.max(prev.longest, newCurrent);
        
        // Check if any new milestones have been reached
        const newMilestonesReached = [...prev.milestonesReached];
        prev.milestones.forEach(milestone => {
          if (newCurrent >= milestone && !newMilestonesReached.includes(milestone)) {
            newMilestonesReached.push(milestone);
          }
        });
        
        return {
          ...prev,
          current: newCurrent,
          longest: newLongest,
          lastUpdated: now,
          milestonesReached: newMilestonesReached,
        };
      });
    }
  };



  // Function to earn XP from activities
  const earnXP = (amount: number, activity: ActivityType) => {
    if (amount <= 0) return;
    
    setXP(prev => {
      const oldLevelInfo = calculateLevel(prev.total);
      const newToday = prev.today + amount;
      const newTotal = prev.total + amount;
      const newLevelInfo = calculateLevel(newTotal);
      const newByActivity = {
        ...prev.byActivity,
        [activity]: prev.byActivity[activity] + amount,
      };
      
      // Check for level up
      if (newLevelInfo.currentLevel > oldLevelInfo.currentLevel) {
        // Show level up notification
        alert(`🎉 Gratulujeme! Dosáhl jsi úroveň ${newLevelInfo.currentLevel}!`);
      }
      
      return {
        ...prev,
        today: newToday,
        total: newTotal,
        byActivity: newByActivity,
      };
    });
    
    // Update streak when XP is earned
    updateStreak();
    
    // Check for badge eligibility after earning XP
    checkBadgeEligibility();
  };

  // Badge definitions with their requirements
  const badgeDefinitions: Omit<Badge, 'earnedDate' | 'isNew'>[] = [
    // Streak badges
    {
      id: 'streak-1',
      name: 'Flame Starter',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      level: 1,
      maxLevel: 1,
      category: 'streak',
      requirements: {
        type: 'streak',
        threshold: 3,
      },
    },
    {
      id: 'streak-2',
      name: 'Consistent Learner',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      level: 1,
      maxLevel: 1,
      category: 'streak',
      requirements: {
        type: 'streak',
        threshold: 7,
      },
    },
    {
      id: 'streak-3',
      name: 'Dedicated Student',
      description: 'Maintain a 30-day streak',
      icon: '🔥',
      level: 1,
      maxLevel: 1,
      category: 'streak',
      requirements: {
        type: 'streak',
        threshold: 30,
      },
    },
    {
      id: 'streak-4',
      name: 'Language Warrior',
      description: 'Maintain a 100-day streak',
      icon: '🔥',
      level: 1,
      maxLevel: 1,
      category: 'streak',
      requirements: {
        type: 'streak',
        threshold: 100,
      },
    },
    
    // Flashcard badges
    {
      id: 'flashcard-1',
      name: 'Flashcard Novice',
      description: 'Study 100 flashcards',
      icon: '📇',
      level: 1,
      maxLevel: 3,
      category: 'flashcard',
      requirements: {
        type: 'completion',
        threshold: 100,
        activity: 'flashcard',
      },
    },
    {
      id: 'flashcard-2',
      name: 'Flashcard Adept',
      description: 'Study 500 flashcards',
      icon: '📇',
      level: 2,
      maxLevel: 3,
      category: 'flashcard',
      requirements: {
        type: 'completion',
        threshold: 500,
        activity: 'flashcard',
      },
    },
    {
      id: 'flashcard-3',
      name: 'Flashcard Master',
      description: 'Study 1000 flashcards',
      icon: '📇',
      level: 3,
      maxLevel: 3,
      category: 'flashcard',
      requirements: {
        type: 'completion',
        threshold: 1000,
        activity: 'flashcard',
      },
    },
    
    // Audiobook badges
    {
      id: 'audiobook-1',
      name: 'Audio Beginner',
      description: 'Listen to 1 hour of audiobooks',
      icon: '🎧',
      level: 1,
      maxLevel: 3,
      category: 'audiobook',
      requirements: {
        type: 'completion',
        threshold: 60, // 60 minutes
        activity: 'audiobook',
      },
    },
    {
      id: 'audiobook-2',
      name: 'Audio Explorer',
      description: 'Listen to 5 hours of audiobooks',
      icon: '🎧',
      level: 2,
      maxLevel: 3,
      category: 'audiobook',
      requirements: {
        type: 'completion',
        threshold: 300, // 300 minutes
        activity: 'audiobook',
      },
    },
    {
      id: 'audiobook-3',
      name: 'Audio Expert',
      description: 'Listen to 20 hours of audiobooks',
      icon: '🎧',
      level: 3,
      maxLevel: 3,
      category: 'audiobook',
      requirements: {
        type: 'completion',
        threshold: 1200, // 1200 minutes
        activity: 'audiobook',
      },
    },
    
    // Textbook badges
    {
      id: 'textbook-1',
      name: 'Reader Initiate',
      description: 'Read 50 pages',
      icon: '📚',
      level: 1,
      maxLevel: 3,
      category: 'textbook',
      requirements: {
        type: 'completion',
        threshold: 50,
        activity: 'textbook',
      },
    },
    {
      id: 'textbook-2',
      name: 'Book Enthusiast',
      description: 'Read 200 pages',
      icon: '📚',
      level: 2,
      maxLevel: 3,
      category: 'textbook',
      requirements: {
        type: 'completion',
        threshold: 200,
        activity: 'textbook',
      },
    },
    {
      id: 'textbook-3',
      name: 'Literature Scholar',
      description: 'Read 500 pages',
      icon: '📚',
      level: 3,
      maxLevel: 3,
      category: 'textbook',
      requirements: {
        type: 'completion',
        threshold: 500,
        activity: 'textbook',
      },
    },
    
    // Exercise badges
    {
      id: 'exercise-1',
      name: 'Exercise Rookie',
      description: 'Complete 10 exercises',
      icon: '✏️',
      level: 1,
      maxLevel: 3,
      category: 'exercise',
      requirements: {
        type: 'completion',
        threshold: 10,
        activity: 'exercise',
      },
    },
    {
      id: 'exercise-2',
      name: 'Exercise Pro',
      description: 'Complete 50 exercises',
      icon: '✏️',
      level: 2,
      maxLevel: 3,
      category: 'exercise',
      requirements: {
        type: 'completion',
        threshold: 50,
        activity: 'exercise',
      },
    },
    {
      id: 'exercise-3',
      name: 'Exercise Champion',
      description: 'Complete 100 exercises',
      icon: '✏️',
      level: 3,
      maxLevel: 3,
      category: 'exercise',
      requirements: {
        type: 'completion',
        threshold: 100,
        activity: 'exercise',
      },
    },
    
    // XP badges
    {
      id: 'xp-1',
      name: 'XP Collector',
      description: 'Earn 500 XP',
      icon: '⭐',
      level: 1,
      maxLevel: 3,
      category: 'general',
      requirements: {
        type: 'xp',
        threshold: 500,
      },
    },
    {
      id: 'xp-2',
      name: 'XP Hoarder',
      description: 'Earn 2000 XP',
      icon: '⭐',
      level: 2,
      maxLevel: 3,
      category: 'general',
      requirements: {
        type: 'xp',
        threshold: 2000,
      },
    },
    {
      id: 'xp-3',
      name: 'XP Master',
      description: 'Earn 5000 XP',
      icon: '⭐',
      level: 3,
      maxLevel: 3,
      category: 'general',
      requirements: {
        type: 'xp',
        threshold: 5000,
      },
    },
  ];

  // Function to check if user is eligible for any badges
  const checkBadgeEligibility = () => {
    let newBadgeEarned = false;
    let latestBadge: Badge | null = null;
    
    // Check each badge definition against current user stats
    badgeDefinitions.forEach(badgeDef => {
      // Skip if badge is already earned
      const alreadyEarned = badges.some(badge => badge.id === badgeDef.id);
      if (alreadyEarned) return;
      
      let isEligible = false;
      
      // Check eligibility based on requirement type
      switch (badgeDef.requirements.type) {
        case 'streak':
          isEligible = streak.current >= badgeDef.requirements.threshold;
          break;
        case 'xp':
          isEligible = xp.total >= badgeDef.requirements.threshold;
          break;
        case 'completion':
          if (badgeDef.requirements.activity) {
            // For activity-specific completion requirements
            switch (badgeDef.requirements.activity) {
              case 'flashcard':
                // This would need to be connected to actual flashcard data
                isEligible = xp.byActivity.flashcard >= badgeDef.requirements.threshold;
                break;
              case 'audiobook':
                // This would need to be connected to actual audiobook data
                isEligible = xp.byActivity.audiobook >= badgeDef.requirements.threshold;
                break;
              case 'textbook':
                // This would need to be connected to actual textbook data
                isEligible = xp.byActivity.textbook >= badgeDef.requirements.threshold;
                break;
              case 'exercise':
                // This would need to be connected to actual exercise data
                isEligible = xp.byActivity.exercise >= badgeDef.requirements.threshold;
                break;
            }
          }
          break;
        case 'accuracy':
          // This would need to be connected to actual accuracy data
          // Not implemented in this version
          break;
      }
      
      // If eligible, award the badge
      if (isEligible) {
        const newBadge: Badge = {
          ...badgeDef,
          earnedDate: new Date(),
          isNew: true,
        };
        
        setBadges(prev => [...prev, newBadge]);
        newBadgeEarned = true;
        latestBadge = newBadge;
      }
    });
    
    if (newBadgeEarned) {
      setIsNewBadgeEarned(true);
      setNewestBadge(latestBadge);
    }
  };

  const contextValue: GamificationContextType = {
    streak,
    xp,
    badges,
    earnXP,
    updateStreak,
    checkBadgeEligibility,
    isNewBadgeEarned,
    setIsNewBadgeEarned,
    newestBadge,
    calculateLevel: (totalXP: number) => calculateLevel(totalXP).currentLevel,
    getXPNeededForNextLevel: (currentXP: number) => {
      const levelInfo = calculateLevel(currentXP);
      return {
        current: levelInfo.currentLevelXP,
        needed: levelInfo.xpNeededForNext,
        nextLevel: levelInfo.currentLevel + 1
      };
    },
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationContext;