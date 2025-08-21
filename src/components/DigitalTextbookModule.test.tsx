import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DigitalTextbookModule from './DigitalTextbookModule';
import { chaptersIndex } from '../data/chaptersIndex';
import * as firebaseStorage from '../utils/firebaseStorage';
import * as loaders from '../lib/loaders';
import type { Chapter } from '../types/content';

// Mock the firebase storage utilities
jest.mock('../utils/firebaseStorage', () => ({
  getAllChapterProgress: jest.fn(),
  saveChapterProgress: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>;
  };
});

jest.mock('remark-gfm', () => ({}));

// Mock other components
jest.mock('./MultiPageChapterReader', () => {
  return function MockMultiPageChapterReader({ 
    chapter, 
    progress, 
    onProgressUpdate,
    onBackToList 
  }: any) {
    return (
      <div data-testid="multi-page-chapter-reader">
        <div>Multi Page Chapter Reader Component</div>
        <div>Chapter: {chapter.title}</div>
        <div>Progress: {progress ? `${progress.readingProgress}%` : 'No progress'}</div>
        <button onClick={onBackToList} data-testid="back-to-list">
          Back to List
        </button>
      </div>
    );
  };
});

jest.mock('./ChapterErrorBoundary', () => {
  return function MockChapterErrorBoundary({ children }: any) {
    return <div data-testid="chapter-error-boundary">{children}</div>;
  };
});

// Mock the chapter loader
jest.mock('../lib/loaders', () => ({
  loadChapter: jest.fn(),
  ChapterLoadError: class extends Error {
    chapterId: string;
    cause?: Error;
    
    constructor(message: string, chapterId: string, cause?: Error) {
      super(message);
      this.name = 'ChapterLoadError';
      this.chapterId = chapterId;
      this.cause = cause;
    }
  },
  ChapterValidationError: class extends Error {
    chapterId: string;
    validationDetails: string;
    
    constructor(message: string, chapterId: string, validationDetails: string) {
      super(message);
      this.name = 'ChapterValidationError';
      this.chapterId = chapterId;
      this.validationDetails = validationDetails;
    }
  },
}));

// Mock chapter data for testing
const mockChapter: Chapter = {
  id: 'maastricht-treaty',
  title: 'Maastrichtská smlouva',
  description: 'Test chapter description',
  estimatedReadingTime: 15,
  content: [
    'This is test content for the chapter.',
    'It contains multiple paragraphs.',
  ],
  quiz: [
    {
      id: '1',
      question: 'Test question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Test explanation'
    }
  ]
};

// Mock the child components
jest.mock('./ChapterList', () => {
  return function MockChapterList({ chapters, progress, onChapterSelect }: any) {
    return (
      <div data-testid="chapter-list">
        <div>Chapter List Component</div>
        <div>Chapters: {chapters.length}</div>
        <div>Progress entries: {Object.keys(progress).length}</div>
        <button 
          onClick={() => onChapterSelect(chapters[0].id)}
          data-testid="select-first-chapter"
        >
          Select First Chapter
        </button>
      </div>
    );
  };
});

jest.mock('./ChapterReader', () => {
  return function MockChapterReader({ 
    chapter, 
    progress, 
    onProgressUpdate,
    onBackToList 
  }: any) {
    return (
      <div data-testid="chapter-reader">
        <div>Chapter Reader Component</div>
        <div>Chapter: {chapter.title}</div>
        <div>Progress: {progress ? `${progress.readingProgress}%` : 'No progress'}</div>
        <button onClick={onBackToList} data-testid="back-to-list">
          Back to List
        </button>
        <button 
          onClick={() => onProgressUpdate({
            chapterId: chapter.id,
            isCompleted: false,
            readingProgress: 50,
          })}
          data-testid="update-reading-progress"
        >
          Update Reading Progress
        </button>
        <button 
          onClick={() => onProgressUpdate({
            chapterId: chapter.id,
            isCompleted: true,
            readingProgress: 100,
            quizScore: 85,
            completedAt: new Date(),
          })}
          data-testid="complete-chapter"
        >
          Complete Chapter
        </button>
        <button 
          onClick={() => onProgressUpdate({
            chapterId: chapter.id,
            isCompleted: false,
            readingProgress: 75,
          })}
          data-testid="update-progress"
        >
          Update Progress
        </button>
      </div>
    );
  };
});

// Mock data
const mockProgress = {
  'maastricht-treaty': {
    chapterId: 'maastricht-treaty',
    isCompleted: true,
    quizScore: 90,
    completedAt: new Date('2024-01-15'),
    readingProgress: 100,
  },
};

describe('DigitalTextbookModule', () => {
  const mockOnNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue({});
    (loaders.loadChapter as jest.Mock).mockResolvedValue(mockChapter);
  });

  describe('Component Initialization', () => {
    it('renders the main component with header and chapter list', () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      expect(screen.getByText('Digitální učebnice')).toBeInTheDocument();
      expect(screen.getByText('Studujte strukturovaný obsah a procvičujte si znalosti pomocí kvízů')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
    });

    it('loads chapter progress from Firebase on mount', async () => {
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue(mockProgress);
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      await waitFor(() => {
        expect(firebaseStorage.getAllChapterProgress).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('State Management', () => {
    it('initializes with list view and no selected chapter', () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
      expect(screen.queryByTestId('chapter-reader')).not.toBeInTheDocument();
    });

    it('passes loaded progress to ChapterList component', async () => {
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue(mockProgress);
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      await waitFor(() => {
        expect(screen.getByText('Progress entries: 1')).toBeInTheDocument();
      });
    });

    it('passes chapters to ChapterList component', () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      expect(screen.getByText(`Chapters: ${chaptersIndex.length}`)).toBeInTheDocument();
    });
  });

  describe('Navigation Between Views', () => {
    it('navigates to reader view when chapter is selected', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
        expect(screen.queryByTestId('chapter-list')).not.toBeInTheDocument();
      });
    });

    it('navigates back to list view when back button is clicked', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Navigate back to list
      fireEvent.click(screen.getByTestId('back-to-list'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
        expect(screen.queryByTestId('chapter-reader')).not.toBeInTheDocument();
      });
    });

    it('passes selected chapter to ChapterReader', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      
      await waitFor(() => {
        expect(screen.getByText(`Chapter: ${mockChapter.title}`)).toBeInTheDocument();
      });
    });

    it('passes chapter progress to ChapterReader', async () => {
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue(mockProgress);
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Progress entries: 1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      
      await waitFor(() => {
        expect(screen.getByText('Progress: 100%')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Persistence', () => {
    it('handles reading progress updates and persists to Firebase', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Update reading progress
      fireEvent.click(screen.getByTestId('update-reading-progress'));
      
      await waitFor(() => {
        expect(firebaseStorage.saveChapterProgress).toHaveBeenCalledWith(
          mockChapter.id,
          {
            isCompleted: false,
            quizScore: undefined,
            completedAt: undefined,
            readingProgress: 50,
          }
        );
      });
    });

    it('handles chapter completion and persists to Firebase', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Complete chapter
      fireEvent.click(screen.getByTestId('complete-chapter'));
      
      await waitFor(() => {
        expect(firebaseStorage.saveChapterProgress).toHaveBeenCalledWith(
          mockChapter.id,
          {
            isCompleted: true,
            quizScore: 85,
            completedAt: expect.any(Date),
            readingProgress: 100,
          }
        );
      });
    });

    it('handles general progress updates and persists to Firebase', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Update progress
      fireEvent.click(screen.getByTestId('update-progress'));
      
      await waitFor(() => {
        expect(firebaseStorage.saveChapterProgress).toHaveBeenCalledWith(
          mockChapter.id,
          {
            isCompleted: false,
            quizScore: undefined,
            completedAt: undefined,
            readingProgress: 75,
          }
        );
      });
    });
  });

  describe('Progress Overview Display', () => {
    it('displays progress overview with no completed chapters', () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      expect(screen.getByText('Váš pokrok')).toBeInTheDocument();
      expect(screen.getByText(`Dokončené kapitoly: 0 z ${chaptersIndex.length}`)).toBeInTheDocument();
    });

    it('displays progress overview with completed chapters', async () => {
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue(mockProgress);
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      await waitFor(() => {
        expect(screen.getByText(`Dokončené kapitoly: 1 z ${chaptersIndex.length}`)).toBeInTheDocument();
        expect(screen.getByText('Průměrné skóre kvízů: 90%')).toBeInTheDocument();
      });
    });

    it('calculates average quiz score correctly with multiple chapters', async () => {
      const multipleProgress = {
        'chapter1': {
          chapterId: 'chapter1',
          isCompleted: true,
          quizScore: 80,
          completedAt: new Date(),
          readingProgress: 100,
        },
        'chapter2': {
          chapterId: 'chapter2',
          isCompleted: true,
          quizScore: 90,
          completedAt: new Date(),
          readingProgress: 100,
        },
        'chapter3': {
          chapterId: 'chapter3',
          isCompleted: false,
          readingProgress: 50,
        },
      };
      
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockResolvedValue(multipleProgress);
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      await waitFor(() => {
        expect(screen.getByText(`Dokončené kapitoly: 2 z ${chaptersIndex.length}`)).toBeInTheDocument();
        expect(screen.getByText('Průměrné skóre kvízů: 85%')).toBeInTheDocument();
      });
    });

    it('does not show average quiz score when no chapters are completed', () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      expect(screen.queryByText(/Průměrné skóre kvízů/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles Firebase errors gracefully during initialization', async () => {
      (firebaseStorage.getAllChapterProgress as jest.Mock).mockRejectedValue(new Error('Firebase error'));
      
      // Should not crash the component
      expect(() => {
        render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
    });

    it('handles storage errors during progress updates', async () => {
      (firebaseStorage.saveChapterProgress as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Should not crash when storage fails
      expect(() => {
        fireEvent.click(screen.getByTestId('update-reading-progress'));
      }).not.toThrow();
    });
  });

  describe('Component Props', () => {
    it('accepts onNavigate prop without errors', () => {
      const customOnNavigate = jest.fn();
      
      expect(() => {
        render(<DigitalTextbookModule onNavigate={customOnNavigate} />);
      }).not.toThrow();
    });

    it('works without onNavigate prop', () => {
      expect(() => {
        render(<DigitalTextbookModule />);
      }).not.toThrow();
      
      expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    it('updates local state when reading progress changes', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Update reading progress
      fireEvent.click(screen.getByTestId('update-reading-progress'));
      
      // Navigate back to list to see updated progress
      fireEvent.click(screen.getByTestId('back-to-list'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-list')).toBeInTheDocument();
      });
      
      // Progress should be updated in local state
      expect(screen.getByText('Progress entries: 1')).toBeInTheDocument();
    });

    it('updates local state when chapter is completed', async () => {
      render(<DigitalTextbookModule onNavigate={mockOnNavigate} />);
      
      // Navigate to reader
      fireEvent.click(screen.getByTestId('select-first-chapter'));
      await waitFor(() => {
        expect(screen.getByTestId('chapter-reader')).toBeInTheDocument();
      });
      
      // Complete chapter
      fireEvent.click(screen.getByTestId('complete-chapter'));
      
      // Navigate back to list to see updated progress
      fireEvent.click(screen.getByTestId('back-to-list'));
      await waitFor(() => {
        expect(screen.getByText(`Dokončené kapitoly: 1 z ${chaptersIndex.length}`)).toBeInTheDocument();
      });
    });
  });
});