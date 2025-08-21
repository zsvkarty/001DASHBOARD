import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicSelection from './TopicSelection';
import { FlashcardSet } from '../types';

// Mock flashcard sets for testing
const mockFlashcardSets: FlashcardSet[] = [
  {
    id: 'constitutional-law',
    title: 'Ústavní právo',
    description: 'Základní principy ústavního práva',
    cards: [
      { id: 1, question: 'Test question 1', answer: 'Test answer 1' },
      { id: 2, question: 'Test question 2', answer: 'Test answer 2' },
    ]
  },
  {
    id: 'economics',
    title: 'Ekonomie',
    description: 'Základní ekonomické pojmy',
    cards: [
      { id: 3, question: 'Test question 3', answer: 'Test answer 3' },
      { id: 4, question: 'Test question 4', answer: 'Test answer 4' },
      { id: 5, question: 'Test question 5', answer: 'Test answer 5' },
    ]
  }
];

describe('TopicSelection', () => {
  const mockOnTopicSelect = jest.fn();

  beforeEach(() => {
    mockOnTopicSelect.mockClear();
  });

  it('renders topic selection header correctly', () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    expect(screen.getByText('Vyberte téma pro studium')).toBeInTheDocument();
    expect(screen.getByText('Zvolte si oblast, kterou chcete studovat pomocí flashkaret')).toBeInTheDocument();
  });

  it('renders all flashcard sets as topic cards', () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    expect(screen.getByText('Ústavní právo')).toBeInTheDocument();
    expect(screen.getByText('Ekonomie')).toBeInTheDocument();
    expect(screen.getByText('Základní principy ústavního práva')).toBeInTheDocument();
    expect(screen.getByText('Základní ekonomické pojmy')).toBeInTheDocument();
  });

  it('displays correct card count for each topic', () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    expect(screen.getByText('2 karet')).toBeInTheDocument();
    expect(screen.getByText('3 karet')).toBeInTheDocument();
  });

  it('calls onTopicSelect when a topic is clicked', async () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    await waitFor(() => {
      expect(mockOnTopicSelect).toHaveBeenCalledWith(mockFlashcardSets[0]);
    });
  });

  it('shows loading state when topic is selected', async () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    const economicsButton = screen.getByLabelText('Select topic: Ekonomie');
    fireEvent.click(economicsButton);

    expect(screen.getByText('Načítám téma...')).toBeInTheDocument();
  });

  it('renders empty state when no flashcard sets are provided', () => {
    render(
      <TopicSelection 
        flashcardSets={[]} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    expect(screen.getByText('Žádná témata nejsou k dispozici')).toBeInTheDocument();
    expect(screen.getByText('Flashkarty se načítají nebo nejsou dostupné.')).toBeInTheDocument();
  });

  it('applies hover effects correctly', () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    
    fireEvent.mouseEnter(constitutionalLawButton);
    expect(constitutionalLawButton).toHaveClass('scale-105');
    
    fireEvent.mouseLeave(constitutionalLawButton);
    expect(constitutionalLawButton).not.toHaveClass('scale-105');
  });

  it('disables button after selection', async () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    expect(constitutionalLawButton).toBeDisabled();
  });

  it('shows selection indicator when topic is selected', async () => {
    render(
      <TopicSelection 
        flashcardSets={mockFlashcardSets} 
        onTopicSelect={mockOnTopicSelect} 
      />
    );

    const constitutionalLawButton = screen.getByLabelText('Select topic: Ústavní právo');
    fireEvent.click(constitutionalLawButton);

    // Check for checkmark icon (SVG path)
    const checkmark = screen.getByRole('button', { name: /Select topic: Ústavní právo/i })
      .querySelector('svg path');
    expect(checkmark).toBeInTheDocument();
  });
});