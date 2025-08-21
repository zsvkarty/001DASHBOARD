// Level system utilities

export interface LevelInfo {
  currentLevel: number;
  currentLevelXP: number; // XP within current level (0 to xpNeededForNext)
  xpNeededForNext: number; // XP needed to reach next level
  totalXPForCurrentLevel: number; // Total XP needed to reach current level
  totalXPForNextLevel: number; // Total XP needed to reach next level
  progressPercentage: number; // Progress within current level (0-100%)
}

/**
 * Calculate level information based on total XP
 * Level progression: 100, 150, 200, 250, 300, 350, 400... (+50 each level)
 */
export function calculateLevel(totalXP: number): LevelInfo {
  if (totalXP < 100) {
    // Level 1: 0-99 XP
    return {
      currentLevel: 1,
      currentLevelXP: totalXP,
      xpNeededForNext: 100 - totalXP,
      totalXPForCurrentLevel: 0,
      totalXPForNextLevel: 100,
      progressPercentage: (totalXP / 100) * 100
    };
  }

  // For levels 2+, calculate based on increasing XP requirements
  let level = 2;
  let totalXPForLevel = 100; // XP needed to reach level 2
  let xpForNextLevel = 150; // XP needed to go from level 2 to level 3
  
  // Find the current level
  while (totalXP >= totalXPForLevel + xpForNextLevel) {
    totalXPForLevel += xpForNextLevel;
    level++;
    xpForNextLevel += 50; // Each level requires 50 more XP than the previous gap
  }
  
  // Calculate current level progress
  const currentLevelXP = totalXP - totalXPForLevel;
  const xpNeededForNext = xpForNextLevel - currentLevelXP;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;
  
  return {
    currentLevel: level,
    currentLevelXP,
    xpNeededForNext,
    totalXPForCurrentLevel: totalXPForLevel,
    totalXPForNextLevel: totalXPForLevel + xpForNextLevel,
    progressPercentage
  };
}

/**
 * Get level badge/icon based on level
 */
export function getLevelBadge(level: number): string {
  if (level >= 50) return '👑'; // King
  if (level >= 40) return '💎'; // Diamond
  if (level >= 30) return '🏆'; // Trophy
  if (level >= 20) return '🥇'; // Gold medal
  if (level >= 15) return '🥈'; // Silver medal
  if (level >= 10) return '🥉'; // Bronze medal
  if (level >= 5) return '⭐'; // Star
  return '🌟'; // Sparkle for levels 1-4
}

/**
 * Get level color theme based on level
 */
export function getLevelColors(level: number): { from: string; to: string } {
  if (level >= 50) return { from: 'from-purple-500', to: 'to-pink-500' };
  if (level >= 40) return { from: 'from-blue-500', to: 'to-cyan-500' };
  if (level >= 30) return { from: 'from-yellow-400', to: 'to-orange-500' };
  if (level >= 20) return { from: 'from-green-400', to: 'to-blue-500' };
  if (level >= 15) return { from: 'from-gray-400', to: 'to-gray-600' };
  if (level >= 10) return { from: 'from-orange-400', to: 'to-red-500' };
  if (level >= 5) return { from: 'from-yellow-400', to: 'to-orange-500' };
  return { from: 'from-blue-400', to: 'to-purple-500' };
}