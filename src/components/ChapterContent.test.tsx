import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChapterContent from './ChapterContent';

// Mock scrollTo for testing
Object.defineProperty(Element.prototype, 'scrollTop', {
  writable: true,
  value: 0,
});

Object.defineProperty(Element.prototype, 'scrollHeight', {
  writable: true,
  value: 1000,
});

Object.defineProperty(Element.prototype, 'clientHeight', {
  writable: true,
  value: 500,
});

describe('ChapterContent', () => {
  const mockContent = [
    'This is the first paragraph of the chapter content.',
    'This is the second paragraph with more detailed information.',
    'This is the third and final paragraph of the chapter.'
  ];

  const mockTitle = 'Test Chapter Title';
  const mockOnContentComplete = jest.fn();
  const mockOnProgressUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chapter title correctly', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
  });

  it('renders all content paragraphs', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    mockContent.forEach((paragraph, index) => {
      expect(screen.getByTestId(`paragraph-${index}`)).toBeInTheDocument();
      expect(screen.getByTestId(`paragraph-${index}`)).toHaveTextContent(paragraph);
    });
  });

  it('displays initial reading progress as 0%', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    expect(screen.getByText('Pokrok: 0%')).toBeInTheDocument();
  });

  it('has proper responsive typography classes', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    const firstParagraph = screen.getByTestId('paragraph-0');
    expect(firstParagraph).toHaveClass('text-base', 'sm:text-lg', 'lg:text-xl');
    expect(firstParagraph).toHaveClass('leading-relaxed', 'sm:leading-8', 'lg:leading-9');
  });

  it('has proper mobile-first responsive design classes', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    const title = screen.getByText(mockTitle);
    expect(title).toHaveClass('text-xl', 'sm:text-2xl', 'lg:text-3xl');

    const contentContainer = screen.getByTestId('chapter-content-scroll');
    expect(contentContainer).toHaveClass('px-4', 'sm:px-6');
  });

  it('calls onProgressUpdate when progress changes', async () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
        onProgressUpdate={mockOnProgressUpdate}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Simulate scroll event
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 250, writable: true });
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(mockOnProgressUpdate).toHaveBeenCalled();
    });
  });

  it('calculates scroll progress correctly', async () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
        onProgressUpdate={mockOnProgressUpdate}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Mock scroll properties for 50% progress
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 250, writable: true });
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(screen.getByText('Pokrok: 50%')).toBeInTheDocument();
    });
  });

  it('calls onContentComplete when scroll reaches 90%', async () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Mock scroll properties for 90% progress
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 450, writable: true });
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(mockOnContentComplete).toHaveBeenCalled();
    });
  });

  it('shows completion indicator when content is completed', async () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Simulate completing the content
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 450, writable: true });
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(screen.getByTestId('completion-indicator')).toBeInTheDocument();
      expect(screen.getByText('Kapitola dokončena! Můžete pokračovat na kvíz.')).toBeInTheDocument();
    });
  });

  it('handles content that fits in viewport (100% progress)', async () => {
    render(
      <ChapterContent
        content={['Short content']}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
        onProgressUpdate={mockOnProgressUpdate}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Mock content that fits in viewport (scrollHeight === clientHeight)
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 500, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 500, writable: true });
    
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(screen.getByText('Pokrok: 100%')).toBeInTheDocument();
      expect(mockOnContentComplete).toHaveBeenCalled();
    });
  });

  it('uses scroll-based progress tracking', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    // Verify that the scroll container is set up for progress tracking
    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    expect(scrollContainer).toHaveClass('overflow-y-auto');
  });

  it('prevents multiple completion calls', async () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    const scrollContainer = screen.getByTestId('chapter-content-scroll');
    
    // Simulate multiple scroll events that would trigger completion
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 450, writable: true });
    fireEvent.scroll(scrollContainer);
    fireEvent.scroll(scrollContainer);
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(mockOnContentComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('has proper accessibility attributes', () => {
    render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    // Check that content is wrapped in semantic article element
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    // Check that title is properly structured as heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(mockTitle);
  });

  it('handles empty content gracefully', () => {
    render(
      <ChapterContent
        content={[]}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    expect(screen.getByText(mockTitle)).toBeInTheDocument();
    expect(screen.getByText('Pokrok: 0%')).toBeInTheDocument();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <ChapterContent
        content={mockContent}
        title={mockTitle}
        onContentComplete={mockOnContentComplete}
      />
    );

    // Component should unmount without errors
    expect(() => unmount()).not.toThrow();
  });
});