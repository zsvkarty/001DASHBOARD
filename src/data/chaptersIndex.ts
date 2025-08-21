/**
 * Chapter index for navigation
 * Contains minimal metadata for all textbook chapters to keep bundle size small
 */

export interface ChapterIndexItem {
  id: string;
  title: string;
}

export const chaptersIndex: ChapterIndexItem[] = [
  { id: 'maastricht-treaty', title: 'Maastrichtská smlouva' },
  { id: 'constitutional-principles', title: 'Ústavní principy' },
  { id: 'eu-institutions', title: 'Instituce Evropské unie' },
  { id: 'legal-system-basics', title: 'Základy právního systému' },
  { id: 'psychopatologie-poruchy', title: 'Psychopatologie a poruchy' },
  { id: 'vyvojove-teorie', title: 'Vývojové teorie' },
  { id: 'socialni-psychologie', title: 'Sociální psychologie' },
  { id: 'your-chapter-id', title: 'Hello' },
];

