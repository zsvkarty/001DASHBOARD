import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChapterReader from './ChapterReader';
import { TextbookChapter, ChapterProgress } from '../types';

// Mock the child components
jest.mock('./ChapterContent', () => {
  return function MockChapterContent({ 
    onContentComplete, 
    onProgressUpdate, 
    title, 
    content 
  }: any) {
    return (
      <div data-testid="chapter-content">
        <h1>{title}</h1>
        <div>{content.join(' ')}</div>
        <button 
          onClick={() => onContentComplete()}
          data-testid="mock-complete-content"
        >
          Complete Content
        </button>
        <button 
          onClick={() => onProgressUpdate(75)}
          data-testid="mock-update-progress"
        >
          Update Progress
        </button>
      </div>
    );
  };
});

jest.mock('./ChapterQuiz', () => {
  return function MockChapterQuiz({ 
    onQuizComplete, 
    onBackToContent, 
    questions 
  }: any) {
    return (
      <div data-testid="chapter-quiz">
        <div>Quiz with {questions.length} questions</div>
        <button 
          onClick={() => onQuizComplete(2, 3)}
          data-testid="mock-complete-quiz"
        >
          Complete Quiz
        </button>
        <button 
          onClick={() => onBackToContent()}
          data-testid="mock-back-to-content"
        >
          Back to Content
        </button>
      </div>
    );
  };
});

const mockChapter: TextbookChapter = {
  id: 'test-chapter',
  title: 'Test Chapter',
  description: 'A test chapter for unit testing',
  content: [
    'First paragraph of content.',
    'Second paragraph of content.',
    'Third paragraph of content.'
  ],
  questions: [
    {
      id: 'q1',
      question: 'What is the first question?',
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswer: 1,
      explanation: 'The correct answer is Option B.'
    },
    {
      id: 'q2',
      question: 'What is the second question?',
      options: ['Option X', 'Option Y', 'Option Z'],
      correctAnswer: 0
    },
    {
      id: 'q3',
      question: 'What is the third question?',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctAnswer: 2
    }
  ],
  estimatedReadingTime: 5
};

const mockProgressIncomplete: ChapterProgress = {
  chapterId: 'test-chapter',
  isCompleted: false,
  readingProgress: 0
};

const mockProgressContentComplete: ChapterProgress = {
  chapterId: 'test-chapter',
  isCompleted: false,
  readingProgress: 100
};

const mockProgressFullyComplete: ChapterProgress = {
  chapterId: 'test-chapter',
  isCompleted: true,
  readingProgress: 100,
  quizScore: 67,
  completedAt: new Date('2024-01-15T10:30:00.000Z')
};

describe('ChapterReader', () => {
  const mockOnProgressUpdate = jest.fn();
  const mockOnBackToList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders with content section active by default', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      expect(screen.getByTestId('chapter-content')).toBeInTheDocument();
      expect(screen.queryByTestId('chapter-quiz')).not.toBeInTheDocument();
      expect(screen.getByTestId('content-tab')).toHaveClass('bg-white');
    });

    it('renders back to list button', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const backButton = screen.getByTestId('back-to-list-button');
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent('Zpět na seznam');
    });

    it('renders section navigation tabs', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      expect(screen.getByTestId('content-tab')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-tab')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onBackToList when back button is clicked', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      fireEvent.click(screen.getByTestId('back-to-list-button'));
      expect(mockOnBackToList).toHaveBeenCalledTimes(1);
    });

    it('disables quiz tab when content is not completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const quizTab = screen.getByTestId('quiz-tab');
      expect(quizTab).toBeDisabled();
      expect(quizTab).toHaveClass('cursor-not-allowed');
    });

    it('enables quiz tab when content is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const quizTab = screen.getByTestId('quiz-tab');
      expect(quizTab).not.toBeDisabled();
      expect(quizTab).not.toHaveClass('cursor-not-allowed');
    });

    it('switches to quiz section when quiz tab is clicked', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      fireEvent.click(screen.getByTestId('quiz-tab'));

      expect(screen.queryByTestId('chapter-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('chapter-quiz')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-tab')).toHaveClass('bg-white');
    });

    it('switches back to content section when content tab is clicked', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Switch to quiz first
      fireEvent.click(screen.getByTestId('quiz-tab'));
      expect(screen.getByTestId('chapter-quiz')).toBeInTheDocument();

      // Switch back to content
      fireEvent.click(screen.getByTestId('content-tab'));
      expect(screen.getByTestId('chapter-content')).toBeInTheDocument();
      expect(screen.queryByTestId('chapter-quiz')).not.toBeInTheDocument();
    });
  });

  describe('Content Completion', () => {
    it('shows continue to quiz button when content is completed', async () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Complete the content
      fireEvent.click(screen.getByTestId('mock-complete-content'));

      await waitFor(() => {
        expect(screen.getByTestId('continue-to-quiz-button')).toBeInTheDocument();
      });
    });

    it('updates progress when content is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      fireEvent.click(screen.getByTestId('mock-complete-content'));

      expect(mockOnProgressUpdate).toHaveBeenCalledWith({
        chapterId: 'test-chapter',
        isCompleted: false,
        readingProgress: 100
      });
    });

    it('updates progress when reading progress changes', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      fireEvent.click(screen.getByTestId('mock-update-progress'));

      expect(mockOnProgressUpdate).toHaveBeenCalledWith({
        chapterId: 'test-chapter',
        isCompleted: false,
        readingProgress: 75
      });
    });

    it('navigates to quiz when continue button is clicked', async () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Complete the content
      fireEvent.click(screen.getByTestId('mock-complete-content'));

      await waitFor(() => {
        const continueButton = screen.getByTestId('continue-to-quiz-button');
        fireEvent.click(continueButton);
      });

      expect(screen.getByTestId('chapter-quiz')).toBeInTheDocument();
      expect(screen.queryByTestId('chapter-content')).not.toBeInTheDocument();
    });
  });

  describe('Quiz Completion', () => {
    it('updates progress when quiz is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Switch to quiz
      fireEvent.click(screen.getByTestId('quiz-tab'));

      // Complete the quiz
      fireEvent.click(screen.getByTestId('mock-complete-quiz'));

      expect(mockOnProgressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          chapterId: 'test-chapter',
          isCompleted: true,
          quizScore: 67, // 2/3 * 100 = 67%
          readingProgress: 100,
          completedAt: expect.any(Date)
        })
      );
    });

    it('shows completion status when quiz is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressFullyComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      expect(screen.getByText(/Kapitola dokončena! Skóre: 67%/)).toBeInTheDocument();
    });

    it('handles quiz back to content navigation', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Switch to quiz
      fireEvent.click(screen.getByTestId('quiz-tab'));
      expect(screen.getByTestId('chapter-quiz')).toBeInTheDocument();

      // Use quiz's back to content button
      fireEvent.click(screen.getByTestId('mock-back-to-content'));
      expect(screen.getByTestId('chapter-content')).toBeInTheDocument();
      expect(screen.queryByTestId('chapter-quiz')).not.toBeInTheDocument();
    });
  });

  describe('Completion Indicators', () => {
    it('shows completion indicator on content tab when content is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const contentTab = screen.getByTestId('content-tab');
      expect(contentTab.querySelector('svg')).toBeInTheDocument();
    });

    it('shows completion indicator on quiz tab when quiz is completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressFullyComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const quizTab = screen.getByTestId('quiz-tab');
      expect(quizTab.querySelector('svg')).toBeInTheDocument();
    });

    it('does not show completion indicators when not completed', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const contentTab = screen.getByTestId('content-tab');
      const quizTab = screen.getByTestId('quiz-tab');
      
      expect(contentTab.querySelector('svg')).not.toBeInTheDocument();
      expect(quizTab.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('initializes content completion state from progress', () => {
      const { rerender } = render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Quiz tab should be disabled
      expect(screen.getByTestId('quiz-tab')).toBeDisabled();

      // Rerender with completed content
      rerender(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Quiz tab should now be enabled
      expect(screen.getByTestId('quiz-tab')).not.toBeDisabled();
    });

    it('initializes quiz completion state from progress', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressFullyComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Should show completion status
      expect(screen.getByText(/Kapitola dokončena! Skóre: 67%/)).toBeInTheDocument();
    });

    it('maintains state when switching between sections', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Switch to quiz and back to content
      fireEvent.click(screen.getByTestId('quiz-tab'));
      fireEvent.click(screen.getByTestId('content-tab'));

      // Content should still be marked as completed
      const contentTab = screen.getByTestId('content-tab');
      expect(contentTab.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('passes correct props to ChapterContent', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressIncomplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      const contentElement = screen.getByTestId('chapter-content');
      expect(contentElement).toHaveTextContent('Test Chapter');
      expect(contentElement).toHaveTextContent('First paragraph of content. Second paragraph of content. Third paragraph of content.');
    });

    it('passes correct props to ChapterQuiz', () => {
      render(
        <ChapterReader
          chapter={mockChapter}
          progress={mockProgressContentComplete}
          onProgressUpdate={mockOnProgressUpdate}
          onBackToList={mockOnBackToList}
        />
      );

      // Switch to quiz
      fireEvent.click(screen.getByTestId('quiz-tab'));

      const quizElement = screen.getByTestId('chapter-quiz');
      expect(quizElement).toHaveTextContent('Quiz with 3 questions');
    });
  });
});