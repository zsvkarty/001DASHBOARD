import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChapterList from './ChapterList';
import { TextbookChapter, TextbookProgress } from '../types';

// Mock data for testing
const mockChapters: TextbookChapter[] = [
  {
    id: 'chapter-1',
    title: 'Maastrichtská smlouva',
    description: 'Základní informace o Maastrichtské smlouvě a jejím významu pro Evropskou unii',
    content: ['Content paragraph 1', 'Content paragraph 2'],
    questions: [
      {
        id: 'q1',
        question: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'Another question?',
        options: ['X', 'Y', 'Z'],
        correctAnswer: 0,
      },
    ],
    estimatedReadingTime: 8,
  },
  {
    id: 'chapter-2',
    title: 'Evropská unie',
    description: 'Historie a vývoj Evropské unie',
    content: ['EU content'],
    questions: [
      {
        id: 'q3',
        question: 'EU question?',
        options: ['1', '2', '3'],
        correctAnswer: 2,
      },
    ],
    estimatedReadingTime: 5,
  },
];

const mockProgressEmpty: TextbookProgress = {};

const mockProgressWithCompleted: TextbookProgress = {
  'chapter-1': {
    chapterId: 'chapter-1',
    isCompleted: true,
    quizScore: 2,
    completedAt: new Date(),
    readingProgress: 100,
  },
  'chapter-2': {
    chapterId: 'chapter-2',
    isCompleted: false,
    readingProgress: 50,
  },
};

const mockOnChapterSelect = jest.fn();

describe('ChapterList', () => {
  beforeEach(() => {
    mockOnChapterSelect.mockClear();
  });

  describe('Rendering', () => {
    it('renders the component title and description', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('Digitální učebnice')).toBeInTheDocument();
      expect(screen.getByText('Vyberte kapitolu pro studium a následné testování')).toBeInTheDocument();
    });

    it('renders all chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('Maastrichtská smlouva')).toBeInTheDocument();
      expect(screen.getByText('Evropská unie')).toBeInTheDocument();
    });

    it('displays chapter descriptions', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('Základní informace o Maastrichtské smlouvě a jejím významu pro Evropskou unii')).toBeInTheDocument();
      expect(screen.getByText('Historie a vývoj Evropské unie')).toBeInTheDocument();
    });

    it('displays reading time and question count', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('8 min čtení')).toBeInTheDocument();
      expect(screen.getByText('5 min čtení')).toBeInTheDocument();
      expect(screen.getByText('2 otázek')).toBeInTheDocument();
      expect(screen.getByText('1 otázek')).toBeInTheDocument();
    });

    it('renders empty state when no chapters are provided', () => {
      render(
        <ChapterList
          chapters={[]}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('Žádné kapitoly nejsou k dispozici')).toBeInTheDocument();
      expect(screen.getByText('Kapitoly budou přidány brzy.')).toBeInTheDocument();
    });
  });

  describe('Completion Indicators', () => {
    it('shows empty circle for incomplete chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      // Check for empty circles (border-only divs)
      const emptyCircles = screen.getAllByRole('generic').filter(
        (element) => element.className.includes('border-2') && element.className.includes('rounded-full')
      );
      expect(emptyCircles).toHaveLength(2);
    });

    it('shows checkmark for completed chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressWithCompleted}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      // Check for checkmark SVG
      const checkmarks = screen.getAllByRole('generic').filter(
        (element) => element.className.includes('bg-green-500') && element.className.includes('rounded-full')
      );
      expect(checkmarks).toHaveLength(1);
    });

    it('displays completion status and quiz score for completed chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressWithCompleted}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      expect(screen.getByText('Dokončeno')).toBeInTheDocument();
      expect(screen.getByText('Skóre: 100%')).toBeInTheDocument();
    });

    it('does not display completion status for incomplete chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressWithCompleted}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      // Should only have one "Dokončeno" text for the completed chapter
      expect(screen.getAllByText('Dokončeno')).toHaveLength(1);
    });
  });

  describe('Interactions', () => {
    it('calls onChapterSelect when a chapter is clicked', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const firstChapter = screen.getByText('Maastrichtská smlouva').closest('div');
      fireEvent.click(firstChapter!);

      expect(mockOnChapterSelect).toHaveBeenCalledTimes(1);
      expect(mockOnChapterSelect).toHaveBeenCalledWith(mockChapters[0]);
    });

    it('calls onChapterSelect with correct chapter data', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const secondChapter = screen.getByText('Evropská unie').closest('div');
      fireEvent.click(secondChapter!);

      expect(mockOnChapterSelect).toHaveBeenCalledWith(mockChapters[1]);
    });

    it('allows clicking on completed chapters', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressWithCompleted}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const completedChapter = screen.getByText('Maastrichtská smlouva').closest('div');
      fireEvent.click(completedChapter!);

      expect(mockOnChapterSelect).toHaveBeenCalledWith(mockChapters[0]);
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes for responsive grid layout', () => {
      const { container } = render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('applies hover effects and transitions', () => {
      const { container } = render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const chapterCard = container.querySelector('.cursor-pointer');
      expect(chapterCard).toHaveClass('hover:shadow-lg', 'transition-all', 'duration-300', 'hover:scale-105');
    });

    it('applies mobile-first padding classes', () => {
      const { container } = render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('p-4', 'sm:p-6');
    });
  });

  describe('Accessibility', () => {
    it('has proper cursor pointer for clickable elements', () => {
      const { container } = render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const chapterCard = container.querySelector('.cursor-pointer');
      expect(chapterCard).toHaveClass('cursor-pointer');
    });

    it('uses semantic HTML structure', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Digitální učebnice');
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    });

    it('provides meaningful text content for screen readers', () => {
      render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressWithCompleted}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      // Check that completion status is clearly indicated
      expect(screen.getByText('Dokončeno')).toBeInTheDocument();
      expect(screen.getByText('Skóre: 100%')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode classes', () => {
      const { container } = render(
        <ChapterList
          chapters={mockChapters}
          progress={mockProgressEmpty}
          onChapterSelect={mockOnChapterSelect}
        />
      );

      const title = screen.getByText('Digitální učebnice');
      expect(title).toHaveClass('dark:text-white');

      const chapterCard = container.querySelector('.cursor-pointer');
      expect(chapterCard).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });
});