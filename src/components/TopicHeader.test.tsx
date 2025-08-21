import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicHeader from './TopicHeader';
import { FlashcardSet } from '../types';

// Mock flashcard set for testing
const mockFlashcardSet: FlashcardSet = {
  id: 'constitutional-law',
  title: 'Ústavní právo',
  description: 'Základní principy ústavního práva',
  cards: [
    { id: 1, question: 'Test question', answer: 'Test answer' }
  ]
};

describe('TopicHeader', () => {
  const mockOnBackToTopics = jest.fn();

  beforeEach(() => {
    mockOnBackToTopics.mockClear();
  });

  it('renders topic title correctly', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Flashkarty – Ústavní právo')).toBeInTheDocument();
  });

  it('displays topic description when not in revision mode', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Základní principy ústavního práva')).toBeInTheDocument();
  });

  it('displays revision mode message when in revision mode', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={true}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Opakování neznámých karet')).toBeInTheDocument();
  });

  it('displays fallback description when topic has no description', () => {
    const topicWithoutDescription: FlashcardSet = {
      ...mockFlashcardSet,
      description: undefined
    };

    render(
      <TopicHeader
        selectedTopic={topicWithoutDescription}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Studuj pomocí interaktivních karet')).toBeInTheDocument();
  });

  it('renders back button with correct text', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Zpět na témata')).toBeInTheDocument();
  });

  it('calls onBackToTopics when back button is clicked', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    const backButton = screen.getByText('Zpět na témata');
    fireEvent.click(backButton);

    expect(mockOnBackToTopics).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    const backButton = screen.getByLabelText('Zpět na výběr témat');
    expect(backButton).toBeInTheDocument();
    
    const svgIcon = backButton.querySelector('svg');
    expect(svgIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
        className="custom-class"
      />
    );

    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass('custom-class');
  });

  it('has proper styling classes for dark mode support', () => {
    render(
      <TopicHeader
        selectedTopic={mockFlashcardSet}
        isRevisionMode={false}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    // Check title has dark mode classes
    const title = screen.getByText('Flashkarty – Ústavní právo');
    expect(title).toHaveClass('text-gray-900', 'dark:text-white');

    // Check description has dark mode classes
    const description = screen.getByText('Základní principy ústavního práva');
    expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400');

    // Check back button has dark mode classes
    const backButton = screen.getByText('Zpět na témata');
    expect(backButton).toHaveClass('dark:bg-gray-700', 'dark:hover:bg-gray-600', 'dark:text-gray-300');
  });
});