import { z } from "zod";

const QuizQuestion = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string().optional(),
});

const ChapterPage = z.object({
  id: z.string(),
  title: z.string(),
  content: z.array(z.string()),
  questions: z.array(QuizQuestion),
  estimatedReadingTime: z.number(),
});

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.array(z.string()),
  quiz: z.array(QuizQuestion).optional(),
  estimatedReadingTime: z.number(),
  isMultiPage: z.boolean().optional(),
  pages: z.array(ChapterPage).optional(),
});

export type Chapter = z.infer<typeof ChapterSchema>;
export type ChapterPage = z.infer<typeof ChapterPage>;
export type QuizQuestion = z.infer<typeof QuizQuestion>;