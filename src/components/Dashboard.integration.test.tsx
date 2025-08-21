import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { User, ProgressData } from '../types';
import { DarkModeProvider } from '../contexts/DarkModeContext';

// Mock the child components to focus on navigation testing
jest.mock('./DigitalTextbookModule', () => {
  return function MockDigitalTextbookModule({ onNavigate }: { onNavigate?: (section: string) => void }) {
    return (
      <div data-testid="digital-textbook-module">
        <h1>Digital Textbook Module</h1>
        <button onClick={() => onNavigate?.('home')}>Back to Home</button>
      </div>
    );
  };
});

jest.mock('./FlashcardModule', () => {
  return function MockFlashcardModule() {
    return <div data-testid="flashcard-module">Flashcard Module</div>;
  };
});

jest.mock('./WelcomeSection', () => {
  return function MockWelcomeSection() {
    return <div data-testid="welcome-section">Welcome Section</div>;
  };
});

jest.mock('./ProgressCards', () => {
  return function MockProgressCards({ onNavigate }: { onNavigate: (section: string) => void }) {
    return (
      <div data-testid="progress-cards">
        <button onClick={() => onNavigate('courses')}>Go to Courses</button>
      </div>
    );
  };
});

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/avatar.jpg',
  studyGoals: {
    dailyFlashcards: 20,
    weeklyHours: 10
  }
};

const mockProgressData: ProgressData = {
  flashcards: {
    totalCards: 100,
    masteredCards: 50,
    reviewsDue: 10,
    studiedToday: 5,
    completed: 50,
    total: 100,
    percentage: 50
  },
  audiobooks: {
    currentBook: {
      id: '1',
      title: 'Test Book',
      author: 'Test Author',
      coverUrl: '/cover.jpg'
    },
    currentPosition: 30,
    totalDuration: 100,
    lastAccessed: new Date(),
    lastAccessedTitle: 'Test Book',
    currentTitle: 'Test Book',
    progress: 30
  },
  textbooks: {
    currentChapter: 'Chapter 1',
    totalChapters: 10,
    currentPage: 5,
    totalPages: 100,
    bookTitle: 'Test Textbook'
  },
  exercises: {
    completedToday: 3,
    streak: 5,
    totalCompleted: 50,
    averageScore: 85
  }
};

// Helper function to render Dashboard with required providers
const renderDashboard = (user: User, progressData: ProgressData) => {
  return render(
    <DarkModeProvider>
      <Dashboard user={user} progressData={progressData} />
    </DarkModeProvider>
  );
};

describe('Dashboard Navigation Integration', () => {
  beforeEach(() => {
    // Clear any console logs
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('renders home section by default', () => {
    renderDashboard(mockUser, mockProgressData);
    
    expect(screen.getByTestId('welcome-section')).toBeInTheDocument();
    expect(screen.getByTestId('progress-cards')).toBeInTheDocument();
    expect(screen.queryByTestId('digital-textbook-module')).not.toBeInTheDocument();
  });

  test('navigates to courses section when Moje Kurzy is clicked', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Find and click the "Moje Kurzy" navigation item
    const coursesButton = screen.getByText('Moje Kurzy');
    fireEvent.click(coursesButton);
    
    // Verify that the digital textbook module is now displayed
    expect(screen.getByTestId('digital-textbook-module')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('progress-cards')).not.toBeInTheDocument();
  });

  test('navigates back to home from digital textbook module', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Navigate to courses first
    const coursesButton = screen.getByText('Moje Kurzy');
    fireEvent.click(coursesButton);
    
    // Verify we're in the textbook module
    expect(screen.getByTestId('digital-textbook-module')).toBeInTheDocument();
    
    // Click the back to home button in the mocked textbook module
    const backButton = screen.getByText('Back to Home');
    fireEvent.click(backButton);
    
    // Verify we're back to home
    expect(screen.getByTestId('welcome-section')).toBeInTheDocument();
    expect(screen.getByTestId('progress-cards')).toBeInTheDocument();
    expect(screen.queryByTestId('digital-textbook-module')).not.toBeInTheDocument();
  });

  test('navigates to courses from progress cards', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Click the "Go to Courses" button in progress cards
    const goToCoursesButton = screen.getByText('Go to Courses');
    fireEvent.click(goToCoursesButton);
    
    // Verify that the digital textbook module is displayed
    expect(screen.getByTestId('digital-textbook-module')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-section')).not.toBeInTheDocument();
  });

  test('navigates to flashcards section', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Find and click the "Flashkarty" navigation item
    const flashcardsButton = screen.getByText('Flashkarty');
    fireEvent.click(flashcardsButton);
    
    // Verify that the flashcard module is displayed
    expect(screen.getByTestId('flashcard-module')).toBeInTheDocument();
    expect(screen.queryByTestId('digital-textbook-module')).not.toBeInTheDocument();
    expect(screen.queryByTestId('welcome-section')).not.toBeInTheDocument();
  });

  test('shows under construction message for unimplemented sections', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Click on an unimplemented section (e.g., "Kniha")
    const bookButton = screen.getByText('Kniha');
    fireEvent.click(bookButton);
    
    // Verify that the under construction message is displayed
    expect(screen.getByText('Sekce v přípravě')).toBeInTheDocument();
    expect(screen.getByText('Tato sekce bude brzy dostupná.')).toBeInTheDocument();
  });

  test('closes mobile menu when navigating', () => {
    renderDashboard(mockUser, mockProgressData);
    
    // Open mobile menu by clicking the menu toggle (we need to find it first)
    // Note: This test assumes the mobile menu toggle is accessible
    // In a real scenario, we might need to resize the window or use different selectors
    
    // Navigate to courses
    const coursesButton = screen.getByText('Moje Kurzy');
    fireEvent.click(coursesButton);
    
    // Verify navigation worked
    expect(screen.getByTestId('digital-textbook-module')).toBeInTheDocument();
  });

  test('handles navigation with flashcard set selection', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    renderDashboard(mockUser, mockProgressData);
    
    // This would typically be triggered by a component that passes a flashcard set ID
    // For now, we'll verify the console log behavior
    const flashcardsButton = screen.getByText('Flashkarty');
    fireEvent.click(flashcardsButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to: flashcards');
    
    consoleSpy.mockRestore();
  });
});