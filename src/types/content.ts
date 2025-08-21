export type Chapter = {
  id: string;
  title: string;
  description?: string;
  // Ordered blocks of text. Each string may contain Markdown like **bold** and *italic*.
  content: string[];
  quiz?: QuizQuestion[];
  estimatedReadingTime: number;
  isMultiPage?: boolean;
  pages?: ChapterPage[]; // For multi-page chapters
};

export type ChapterPage = {
  id: string;
  title: string;
  content: string[]; // Markdown strings
  questions: QuizQuestion[];
  estimatedReadingTime: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};