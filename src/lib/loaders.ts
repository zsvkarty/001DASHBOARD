import { ChapterSchema } from './schemas';
import type { Chapter } from '../types/content';

/**
 * Custom error class for chapter loading failures
 */
export class ChapterLoadError extends Error {
  constructor(
    message: string,
    public readonly chapterId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ChapterLoadError';
  }
}

/**
 * Custom error class for chapter validation failures
 */
export class ChapterValidationError extends Error {
  constructor(
    message: string,
    public readonly chapterId: string,
    public readonly validationDetails: string
  ) {
    super(message);
    this.name = 'ChapterValidationError';
  }
}

/**
 * Gets a user-friendly error message from a chapter loading error
 * @param error - The error that occurred during chapter loading
 * @returns A user-friendly error message
 */
export function getChapterErrorMessage(error: unknown): string {
  if (error instanceof ChapterLoadError) {
    if (error.message.includes('not found')) {
      return 'This chapter could not be found. Please try selecting a different chapter.';
    }
    if (error.message.includes('Network error')) {
      return 'Unable to load chapter due to network issues. Please check your connection and try again.';
    }
    return 'Failed to load chapter. Please try again later.';
  }
  
  if (error instanceof ChapterValidationError) {
    return 'This chapter contains invalid data and cannot be displayed. Please contact support.';
  }
  
  return 'An unexpected error occurred while loading the chapter. Please try again.';
}

/**
 * Checks if an error is retryable (network-related)
 * @param error - The error to check
 * @returns True if the error might be resolved by retrying
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ChapterLoadError) {
    return error.message.includes('Network error') || 
           error.message.includes('Failed to load chapter') ||
           !error.message.includes('not found');
  }
  return false;
}

/**
 * Loads a chapter from JSON file and validates it
 * @param id - The chapter ID to load
 * @returns Promise that resolves to a validated Chapter object
 * @throws ChapterLoadError for network failures
 * @throws ChapterValidationError for validation failures
 */
export async function loadChapter(id: string): Promise<Chapter> {
  try {
    // Fetch the chapter JSON file with caching enabled
    const response = await fetch(`/data/chapters/${id}.json`, {
      cache: 'force-cache'
    });

    // Handle network errors
    if (!response.ok) {
      if (response.status === 404) {
        throw new ChapterLoadError(
          `Chapter "${id}" not found`,
          id
        );
      } else {
        throw new ChapterLoadError(
          `Failed to load chapter "${id}": ${response.status} ${response.statusText}`,
          id
        );
      }
    }

    // Parse JSON
    let jsonData: unknown;
    try {
      jsonData = await response.json();
    } catch (parseError) {
      throw new ChapterLoadError(
        `Invalid JSON format for chapter "${id}"`,
        id,
        parseError instanceof Error ? parseError : new Error(String(parseError))
      );
    }

    // Validate with Zod schema
    try {
      const validatedChapter = ChapterSchema.parse(jsonData);
      
      // Log successful load for debugging
      console.debug(`Successfully loaded chapter: ${id}`);
      
      return validatedChapter;
    } catch (validationError) {
      // Create detailed validation error message
      const validationDetails = validationError instanceof Error 
        ? validationError.message 
        : String(validationError);
      
      // Log detailed error for debugging
      console.error(`Validation failed for chapter "${id}":`, validationError);
      
      throw new ChapterValidationError(
        `Chapter "${id}" failed validation`,
        id,
        validationDetails
      );
    }

  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof ChapterLoadError || error instanceof ChapterValidationError) {
      throw error;
    }

    // Handle unexpected network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ChapterLoadError(
        `Network error loading chapter "${id}". Please check your connection.`,
        id,
        error
      );
    }

    // Handle any other unexpected errors
    throw new ChapterLoadError(
      `Unexpected error loading chapter "${id}"`,
      id,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}