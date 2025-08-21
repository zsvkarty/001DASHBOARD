import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChapterQuiz from './ChapterQuiz';
import { QuizQuestion } from '../types';

describe('ChapterQuiz', () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin'],
      correctAnswer: 1,
      explanation: 'Paris is the capital and largest city of France.'
    },
    {
      id: 'q2',
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth'],
      correctAnswer: 1,
      explanation: 'Mercury is the smallest planet and the one closest to the Sun.'
    }
  ];

  const mockOnQuizComplete = jest.fn();
  const mockOnBackToContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders quiz header with question counter', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    expect(screen.getByText('Kvíz')).toBeInTheDocument();
    expect(screen.getByText('Otázka 1 z 2')).toBeInTheDocument();
  });

  it('displays progress bar with correct progress', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Find the progress bar by its styling classes
    const progressBar = document.querySelector('.bg-blue-600.h-2.rounded-full');
    expect(progressBar).toHaveStyle('width: 50%'); // First question = 50% of 2 questions
  });

  it('renders first question and answer options', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
  });

  it('allows selecting an answer option', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);

    expect(parisOption).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('disables check answer button when no answer is selected', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    const checkButton = screen.getByTestId('check-answer-button');
    expect(checkButton).toBeDisabled();
  });

  it('enables check answer button when answer is selected', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);

    const checkButton = screen.getByTestId('check-answer-button');
    expect(checkButton).not.toBeDisabled();
  });

  it('shows feedback and explanation when answer is checked', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Select correct answer
    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);

    // Check answer
    const checkButton = screen.getByTestId('check-answer-button');
    fireEvent.click(checkButton);

    // Should show explanation
    expect(screen.getByText('Vysvětlení')).toBeInTheDocument();
    expect(screen.getByText('Paris is the capital and largest city of France.')).toBeInTheDocument();

    // Should show next question button
    expect(screen.getByTestId('next-question-button')).toBeInTheDocument();
  });

  it('highlights correct answer in green when feedback is shown', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Select correct answer
    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);

    // Check answer
    const checkButton = screen.getByTestId('check-answer-button');
    fireEvent.click(checkButton);

    // Correct answer should be highlighted in green
    expect(parisOption).toHaveClass('border-green-500', 'bg-green-50');
  });

  it('highlights incorrect answer in red when feedback is shown', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Select incorrect answer
    const londonOption = screen.getByTestId('option-0');
    fireEvent.click(londonOption);

    // Check answer
    const checkButton = screen.getByTestId('check-answer-button');
    fireEvent.click(checkButton);

    // Incorrect answer should be highlighted in red
    expect(londonOption).toHaveClass('border-red-500', 'bg-red-50');
    
    // Correct answer should still be highlighted in green
    const parisOption = screen.getByTestId('option-1');
    expect(parisOption).toHaveClass('border-green-500', 'bg-green-50');
  });

  it('prevents changing answer after feedback is shown', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Select and check answer
    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);
    
    const checkButton = screen.getByTestId('check-answer-button');
    fireEvent.click(checkButton);

    // Try to select different answer - should not work
    const londonOption = screen.getByTestId('option-0');
    fireEvent.click(londonOption);

    // Paris should still be selected
    expect(parisOption).toHaveClass('border-green-500');
    expect(londonOption).not.toHaveClass('border-blue-500');
  });

  it('moves to next question when next button is clicked', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Answer first question
    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);
    
    const checkButton = screen.getByTestId('check-answer-button');
    fireEvent.click(checkButton);

    // Move to next question
    const nextButton = screen.getByTestId('next-question-button');
    fireEvent.click(nextButton);

    // Should show second question
    expect(screen.getByText('Which planet is closest to the Sun?')).toBeInTheDocument();
    expect(screen.getByText('Otázka 2 z 2')).toBeInTheDocument();
  });

  it('shows "Dokončit kvíz" button on last question', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Navigate to second question
    const parisOption = screen.getByTestId('option-1');
    fireEvent.click(parisOption);
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Answer second question
    const mercuryOption = screen.getByTestId('option-1');
    fireEvent.click(mercuryOption);
    fireEvent.click(screen.getByTestId('check-answer-button'));

    // Should show finish quiz button
    expect(screen.getByText('Dokončit kvíz')).toBeInTheDocument();
  });

  it('completes quiz and shows results when last question is answered', async () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Answer first question correctly
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Answer second question correctly
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Should show results
    await waitFor(() => {
      expect(screen.getByText('Kvíz dokončen!')).toBeInTheDocument();
      expect(screen.getByText('2/2')).toBeInTheDocument();
      expect(screen.getByText('100% správně')).toBeInTheDocument();
    });

    // Should call onQuizComplete with correct score
    expect(mockOnQuizComplete).toHaveBeenCalledWith(2, 2);
  });

  it('shows correct score for partially correct answers', async () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Answer first question correctly
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Answer second question incorrectly
    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Should show partial score
    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument();
      expect(screen.getByText('50% správně')).toBeInTheDocument();
    });

    expect(mockOnQuizComplete).toHaveBeenCalledWith(1, 2);
  });

  it('shows appropriate score message based on performance', async () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Answer both questions correctly (100%)
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    await waitFor(() => {
      expect(screen.getByText('Výborně! Máte dobré znalosti tématu.')).toBeInTheDocument();
    });
  });

  it('allows restarting the quiz', async () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Complete the quiz
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Wait for results and restart
    await waitFor(() => {
      expect(screen.getByText('Zkusit znovu')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Zkusit znovu'));

    // Should be back to first question
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Otázka 1 z 2')).toBeInTheDocument();
  });

  it('shows back to content button when provided', () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
        onBackToContent={mockOnBackToContent}
      />
    );

    const backButton = screen.getByText('← Zpět k obsahu');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockOnBackToContent).toHaveBeenCalled();
  });

  it('shows back to content button in results when provided', async () => {
    render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
        onBackToContent={mockOnBackToContent}
      />
    );

    // Complete the quiz
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));
    fireEvent.click(screen.getByTestId('next-question-button'));

    // Should show back to content button in results
    await waitFor(() => {
      const backButton = screen.getByText('Zpět k obsahu');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockOnBackToContent).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChapterQuiz
        questions={mockQuestions}
        onQuizComplete={mockOnQuizComplete}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles quiz with single question', async () => {
    const singleQuestion = [mockQuestions[0]];
    
    render(
      <ChapterQuiz
        questions={singleQuestion}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    expect(screen.getByText('Otázka 1 z 1')).toBeInTheDocument();

    // Answer the question
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));

    // Should show finish button immediately
    expect(screen.getByText('Dokončit kvíz')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('next-question-button'));

    // Should complete quiz
    await waitFor(() => {
      expect(screen.getByText('Kvíz dokončen!')).toBeInTheDocument();
    });
  });

  it('handles questions without explanations', () => {
    const questionsWithoutExplanation: QuizQuestion[] = [
      {
        id: 'q1',
        question: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 1
        // No explanation provided
      }
    ];

    render(
      <ChapterQuiz
        questions={questionsWithoutExplanation}
        onQuizComplete={mockOnQuizComplete}
      />
    );

    // Answer and check
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('check-answer-button'));

    // Should not show explanation section
    expect(screen.queryByText('Vysvětlení')).not.toBeInTheDocument();
  });
});