import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChapterContentProps {
  content: string[];
  title: string;
  onContentComplete: () => void;
  onProgressUpdate?: (progress: number) => void;
}

const ChapterContent: React.FC<ChapterContentProps> = ({
  content,
  title,
  onContentComplete,
  onProgressUpdate
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Track reading progress based on scroll position and time
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const container = contentRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      
      // If content fits in viewport, don't immediately set to 100%
      // Let the paragraph-based tracking handle it instead
      if (scrollHeight === 0) {
        return;
      }

      const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      
      // Only update if progress changed significantly (reduce sensitivity)
      if (Math.abs(progress - readingProgress) > 2) {
        setReadingProgress(progress);
        
        // Call progress update callback if provided
        if (onProgressUpdate) {
          onProgressUpdate(progress);
        }
      }

      // Mark as complete when user has scrolled to 90% or more
      if (progress >= 90 && !hasCompleted) {
        setHasCompleted(true);
        onContentComplete();
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [onContentComplete, onProgressUpdate, hasCompleted, readingProgress]);

  // Track reading progress based on visible paragraphs using IntersectionObserver
  useEffect(() => {
    // Only use IntersectionObserver if available (not in test environment)
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observerOptions = {
        root: contentRef.current,
        rootMargin: '0px',
        threshold: 0.3 // Paragraph is considered read when 30% visible
      };

      const readParagraphs = new Set<number>();

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const index = paragraphRefs.current.indexOf(entry.target as HTMLParagraphElement);
          if (index !== -1) {
            if (entry.isIntersecting) {
              readParagraphs.add(index);
            }
          }
        });

        if (content.length > 0) {
          const progressByParagraphs = (readParagraphs.size / content.length) * 100;
          
          // Only update if progress changed significantly
          if (Math.abs(progressByParagraphs - readingProgress) > 1) {
            setReadingProgress(progressByParagraphs);
            if (onProgressUpdate) {
              onProgressUpdate(progressByParagraphs);
            }
          }

          // Mark as complete when 80% of paragraphs have been seen
          if (progressByParagraphs >= 80 && !hasCompleted) {
            setHasCompleted(true);
            onContentComplete();
          }
        }
      }, observerOptions);

      // Observe all paragraphs
      paragraphRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref);
      });

      return () => observer.disconnect();
    }
  }, [content.length, onContentComplete, onProgressUpdate, hasCompleted]);

  return (
    <div className="flex flex-col h-full" role="main" aria-labelledby="chapter-title">
      {/* Header with title only */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h1 id="chapter-title" className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight text-center">
          {title}
        </h1>
      </header>

      {/* Scrollable content area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-transparent"
        data-testid="chapter-content-scroll"
      >
        <div className="max-w-4xl mx-auto">
          <article className="max-w-none">
            {content.map((paragraph, index) => (
              <div
                key={index}
                ref={(el) => {
                  paragraphRefs.current[index] = el as HTMLParagraphElement;
                }}
                className="mb-6 text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200
                          font-normal tracking-wide
                          first:mt-0 last:mb-16
                          sm:leading-8 lg:text-xl lg:leading-9
                          selection:bg-blue-100 dark:selection:bg-blue-900
                          prose prose-lg dark:prose-invert max-w-none
                          prose-strong:text-gray-900 dark:prose-strong:text-white
                          prose-em:text-blue-700 dark:prose-em:text-blue-300"
                data-testid={`paragraph-${index}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-4">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-blue-700 dark:text-blue-300 font-medium">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                    li: ({ children }) => <li className="ml-2">{children}</li>
                  }}
                >
                  {paragraph}
                </ReactMarkdown>
              </div>
            ))}
          </article>


        </div>
      </div>
    </div>
  );
};

export default ChapterContent;