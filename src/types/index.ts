export type ActivityType = 'flashcard' | 'audiobook' | 'textbook' | 'exercise';
export type BadgeCategory = 'flashcard' | 'audiobook' | 'textbook' | 'exercise' | 'streak' | 'general';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  level: number;
  maxLevel: number;
  category: BadgeCategory;
  isNew?: boolean;
  requirements: {
    type: 'streak' | 'xp' | 'completion' | 'accuracy';
    threshold: number;
    activity?: ActivityType;
  };
}

export interface StreakData {
  current: number;
  longest: number;
  lastUpdated: Date;
  milestones: number[]; // e.g., [7, 30, 100]
  milestonesReached: number[]; // e.g., [7, 30]
}

export interface XPData {
  today: number;
  total: number;
  goal: number;
  history: {
    date: string; // ISO date string
    amount: number;
  }[];
  byActivity: {
    flashcard: number;
    audiobook: number;
    textbook: number;
    exercise: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  studyGoals: {
    dailyFlashcards: number;
    weeklyHours: number;
  };
  gamification?: {
    streak: StreakData;
    xp: XPData;
    badges: Badge[];
  };
}

export interface ProgressData {
  flashcards: {
    totalCards: number;
    masteredCards: number;
    reviewsDue: number;
    studiedToday: number;
    completed: number;
    total: number;
    percentage: number;
  };
  audiobooks: {
    currentBook: {
      id: string;
      title: string;
      author: string;
      coverUrl: string;
    };
    currentPosition: number;
    totalDuration: number;
    lastAccessed: Date;
    lastAccessedTitle: string;
    currentTitle: string;
    progress: number;
  };
  textbooks: {
    currentChapter: string;
    totalChapters: number;
    currentPage: number;
    totalPages: number;
    bookTitle: string;
  };
  exercises: {
    completedToday: number;
    streak: number;
    totalCompleted: number;
    averageScore: number;
  };
}

export interface DashboardProps {
  user: User;
  progressData: ProgressData;
}

export interface ProgressCardsProps {
  progressData: ProgressData;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface SidebarProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
}

export interface TopBarProps {
  user: User;
  onSettingsClick?: () => void;
}

export interface WelcomeSectionProps {
  userName: string;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
}

// Gamification component interfaces
export interface GamificationContextType {
  streak: StreakData;
  xp: XPData;
  badges: Badge[];
  earnXP: (amount: number, activity: ActivityType) => void;
  updateStreak: () => void;
  checkBadgeEligibility: () => void;
  isNewBadgeEarned: boolean;
  setIsNewBadgeEarned: (value: boolean) => void;
  newestBadge: Badge | null;
  calculateLevel: (totalXP: number) => number;
  getXPNeededForNextLevel: (currentXP: number) => { current: number; needed: number; nextLevel: number };
}

export interface StreakDisplayProps {
  streak: number;
  className?: string;
}

export interface XPCounterProps {
  xpToday: number;
  xpGoal: number;
  className?: string;
}

export interface BadgeDisplayProps {
  badges: Badge[];
  onBadgeClick: (badge: Badge) => void;
  className?: string;
}

export interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

// Flashcard module types
export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  cards: Flashcard[];
}

export interface StudySession {
  selectedTopic: FlashcardSet | null;
  cards: Flashcard[];
  currentIndex: number;
  knownCards: number[];
  unknownCards: number[];
  isComplete: boolean;
  isRevisionMode: boolean;
}

export interface FlashcardState {
  isFlipped: boolean;
  isAnimating: boolean;
  swipeDirection?: 'left' | 'right';
}

export interface FlashcardDisplayProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onKnown?: () => void;
  onUnknown?: () => void;
}

export interface ActionButtonsProps {
  onKnown: () => void;
  onUnknown: () => void;
  disabled: boolean;
}

export interface StudySummaryProps {
  knownCount: number;
  unknownCount: number;
  onStartRevision: () => void;
  selectedTopic?: FlashcardSet;
  onBackToTopics?: () => void;
}

export interface TopicSelectionProps {
  flashcardSets: FlashcardSet[];
  onTopicSelect: (set: FlashcardSet) => void;
  className?: string;
}

export interface TopicHeaderProps {
  selectedTopic: FlashcardSet;
  isRevisionMode: boolean;
  onBackToTopics: () => void;
  className?: string;
}

// LocalStorage persistence types
export interface FlashcardProgress {
  topicId: string;
  currentIndex: number;
  knownCards: number[];
  unknownCards: number[];
  isCompleted: boolean;
  lastStudied: string; // ISO date string
  totalCards: number;
}

export interface FlashcardStorage {
  [topicId: string]: FlashcardProgress;
}

// Digital Textbook Module types
export interface TextbookChapter {
  id: string;
  title: string;
  description: string;
  content: string[]; // Array of paragraphs
  questions: QuizQuestion[];
  estimatedReadingTime: number; // in minutes
  pages?: ChapterPage[]; // Optional multi-page structure
  isMultiPage?: boolean; // Flag to indicate if chapter uses pages
}

export interface ChapterPage {
  id: string;
  title: string;
  content: string[]; // Array of paragraphs for this page
  questions: QuizQuestion[]; // Quiz questions for this page
  estimatedReadingTime: number; // in minutes for this page
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface ChapterProgress {
  chapterId: string;
  isCompleted: boolean;
  quizScore?: number;
  completedAt?: Date;
  readingProgress: number; // percentage of content read
}

export interface TextbookProgress {
  [chapterId: string]: ChapterProgress;
}

export interface DigitalTextbookModuleProps {
  onNavigate?: (section: string) => void;
}

// Audiobook Module types
export interface AudioChapter {
  id: string;
  title: string;
  src: string;
  duration?: number; // in seconds, optional until loaded
}

export interface AudiobooksSectionProps {
  className?: string;
}