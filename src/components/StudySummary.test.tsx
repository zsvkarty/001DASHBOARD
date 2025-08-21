import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudySummary from './StudySummary';
import { FlashcardSet } from '../types';

// Mock flashcard set for testing
const mockFlashcardSet: FlashcardSet = {
  id: 'constitutional-law',
  title: 'Ústavní právo',
  description: 'Základní principy ústavního práva',
  cards: [
    { id: 1, question: 'Test question 1', answer: 'Test answer 1' },
    { id: 2, question: 'Test question 2', answer: 'Test answer 2' }
  ]
};

describe('StudySummary', () => {
  const mockOnStartRevision = jest.fn();
  const mockOnBackToTopics = jest.fn();

  beforeEach(() => {
    mockOnStartRevision.mockClear();
    mockOnBackToTopics.mockClear();
  });

  it('renders completion message and statistics', () => {
    render(
      <StudySummary
        knownCount={8}
        unknownCount={2}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText('Hotovo!')).toBeInTheDocument();
    expect(screen.getByText(/Dokončil jsi studium všech 10 karet/)).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('✅ Známé karty')).toBeInTheDocument();
    expect(screen.getByText('❌ Neznámé karty')).toBeInTheDocument();
  });

  it('shows revision button when there are unknown cards', () => {
    render(
      <StudySummary
        knownCount={7}
        unknownCount={3}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText('Zopakuj si 3 neznámých karet.')).toBeInTheDocument();
    expect(screen.getByText('Začít opakování')).toBeInTheDocument();
  });

  it('shows perfect score message when no unknown cards', () => {
    render(
      <StudySummary
        knownCount={10}
        unknownCount={0}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText('Perfektní! Všechny karty znáš!')).toBeInTheDocument();
    expect(screen.queryByText('Začít opakování')).not.toBeInTheDocument();
  });

  it('calls onStartRevision when revision button is clicked', () => {
    render(
      <StudySummary
        knownCount={6}
        unknownCount={4}
        onStartRevision={mockOnStartRevision}
      />
    );

    const revisionButton = screen.getByText('Začít opakování');
    fireEvent.click(revisionButton);

    expect(mockOnStartRevision).toHaveBeenCalledTimes(1);
  });

  it('calculates percentages correctly', () => {
    render(
      <StudySummary
        knownCount={8}
        unknownCount={2}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText('80% úspěšnost')).toBeInTheDocument();
    expect(screen.getByText('20% k opakování')).toBeInTheDocument();
  });

  it('handles edge case with zero cards', () => {
    render(
      <StudySummary
        knownCount={0}
        unknownCount={0}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText(/Dokončil jsi studium všech 0 karet/)).toBeInTheDocument();
    expect(screen.getByText('0% úspěšnost')).toBeInTheDocument();
    expect(screen.getByText('0% k opakování')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <StudySummary
        knownCount={5}
        unknownCount={5}
        onStartRevision={mockOnStartRevision}
      />
    );

    const revisionButton = screen.getByRole('button', { name: /začít opakování/i });
    expect(revisionButton).toBeInTheDocument();
    expect(revisionButton).toBeEnabled();
  });

  // Topic support tests
  it('displays topic name when selectedTopic is provided', () => {
    render(
      <StudySummary
        knownCount={8}
        unknownCount={2}
        onStartRevision={mockOnStartRevision}
        selectedTopic={mockFlashcardSet}
      />
    );

    expect(screen.getByText('Dokončil jsi studium všech 10 karet')).toBeInTheDocument();
    expect(screen.getByText('z tématu "Ústavní právo"')).toBeInTheDocument();
  });

  it('shows back to topics button when onBackToTopics is provided and there are unknown cards', () => {
    render(
      <StudySummary
        knownCount={7}
        unknownCount={3}
        onStartRevision={mockOnStartRevision}
        selectedTopic={mockFlashcardSet}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Zpět na témata')).toBeInTheDocument();
  });

  it('shows back to topics button when onBackToTopics is provided and no unknown cards', () => {
    render(
      <StudySummary
        knownCount={10}
        unknownCount={0}
        onStartRevision={mockOnStartRevision}
        selectedTopic={mockFlashcardSet}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    expect(screen.getByText('Zpět na témata')).toBeInTheDocument();
  });

  it('calls onBackToTopics when back to topics button is clicked', () => {
    render(
      <StudySummary
        knownCount={6}
        unknownCount={4}
        onStartRevision={mockOnStartRevision}
        selectedTopic={mockFlashcardSet}
        onBackToTopics={mockOnBackToTopics}
      />
    );

    const backButton = screen.getByText('Zpět na témata');
    fireEvent.click(backButton);

    expect(mockOnBackToTopics).toHaveBeenCalledTimes(1);
  });

  it('does not show back to topics button when onBackToTopics is not provided', () => {
    render(
      <StudySummary
        knownCount={7}
        unknownCount={3}
        onStartRevision={mockOnStartRevision}
        selectedTopic={mockFlashcardSet}
      />
    );

    expect(screen.queryByText('Zpět na témata')).not.toBeInTheDocument();
  });

  it('works without selectedTopic (backward compatibility)', () => {
    render(
      <StudySummary
        knownCount={8}
        unknownCount={2}
        onStartRevision={mockOnStartRevision}
      />
    );

    expect(screen.getByText('Dokončil jsi studium všech 10 karet')).toBeInTheDocument();
    expect(screen.queryByText(/z tématu/)).not.toBeInTheDocument();
  });
});