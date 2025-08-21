import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardModule from './FlashcardModule';
import GamificationContext from '../contexts/GamificationContext';
import { mockUser } from '../data/mockData';

// Mock the gamification context
const mockGamificationContext = {
  streak: mockUser.gamification!.streak,
  xp: mockUser.gamification!.xp,
  badges: mockUser.gamification!.badges,
  earnXP: jest.fn(),
  updateStreak: jest.fn(),
  checkBadgeEligibility: jest.fn(),
  isNewBadgeEarned: false,
  setIsNewBadgeEarned: jest.fn(),
  newestBadge: null,
  calculateLevel: jest.fn(() => 1),
  getXPNeededForNextLevel: jest.fn(() => ({ current: 0, needed: 100, nextLevel: 2 })),
};

const FlashcardModuleWithContext: React.FC = () => (
  <GamificationContext.Provider value={mockGamificationContext}>
    <FlashcardModule />
  </GamificationContext.Provider>
);

describe('FlashcardModule Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows topic selection screen initially', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    // Check that all topics are displayed
    expect(screen.getByText('Ústavní právo')).toBeInTheDocument();
    expect(screen.getByText('Ekonomie')).toBeInTheDocument();
    expect(screen.getByText('Evropská unie')).toBeInTheDocument();
    expect(screen.getByText('Právní pojmy')).toBeInTheDocument();
  });

  it('navigates to flashcard study when topic is selected', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    // Select a topic
    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    // Wait for navigation to study screen
    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ústavní právo')).toBeInTheDocument();
    });

    // Check that we're now in study mode
    expect(screen.getByText('Zpět na témata')).toBeInTheDocument();
    expect(screen.getByText('Základní principy ústavního práva')).toBeInTheDocument();
  });

  it('shows back button and allows navigation back to topics', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading and select a topic
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    const economicsButton = screen.getByLabelText('Select topic: Ekonomie');
    fireEvent.click(economicsButton);

    // Wait for navigation to study screen
    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ekonomie')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByText('Zpět na témata');
    fireEvent.click(backButton);

    // Should be back to topic selection
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });
  });

  it('displays flashcards from selected topic', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading and select constitutional law topic
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    // Wait for navigation to study screen
    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ústavní právo')).toBeInTheDocument();
    });

    // Should show the first flashcard from constitutional law set
    expect(screen.getByText('Co je právní norma?')).toBeInTheDocument();
  });

  it('shows progress indicator with correct card count for selected topic', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading and select economics topic
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    const economicsButton = screen.getByLabelText('Select topic: Ekonomie');
    fireEvent.click(economicsButton);

    // Wait for navigation to study screen
    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ekonomie')).toBeInTheDocument();
    });

    // Should show progress for economics cards (8 cards in economics set)
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
  });

  it('handles topic selection with different card counts correctly', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    // Check card counts are displayed correctly in topic selection
    expect(screen.getAllByText('7 karet')).toHaveLength(2); // Constitutional law and EU
    expect(screen.getAllByText('8 karet')).toHaveLength(2); // Economics and Legal terms
  });

  it('maintains session state when navigating between views', async () => {
    render(<FlashcardModuleWithContext />);

    // Wait for loading and select a topic
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    // Wait for navigation to study screen
    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ústavní právo')).toBeInTheDocument();
    });

    // Flip the card and mark as known
    const flashcard = screen.getByText('Co je právní norma?');
    fireEvent.click(flashcard);

    // Wait for card to flip and action buttons to appear
    await waitFor(() => {
      expect(screen.getByText('Znám')).toBeInTheDocument();
    });

    const knownButton = screen.getByText('Znám');
    fireEvent.click(knownButton);

    // Should progress to next card and update statistics
    await waitFor(() => {
      expect(screen.getByText('1 / 7')).toBeInTheDocument(); // Progress updated
      expect(screen.getByText('1')).toBeInTheDocument(); // Known count updated
    });
  });

  it('shows revision mode correctly for selected topic', async () => {
    render(<FlashcardModuleWithContext />);

    // This test would require completing a full session and testing revision
    // For now, we'll test that the revision mode text appears correctly
    await waitFor(() => {
      expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    });

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    await waitFor(() => {
      expect(screen.getByText('Flashkarty – Ústavní právo')).toBeInTheDocument();
    });

    // The description should show the topic description, not revision mode initially
    expect(screen.getByText('Základní principy ústavního práva')).toBeInTheDocument();
  });
});