import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';

export interface ChapterQuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number, totalQuestions: number) => void;
  onBackToContent?: () => void;
  className?: string;
  // Auto-advance props
  showAutoAdvance?: boolean;
  countdown?: number;
  nextPageTitle?: string;
  onCancelAutoAdvance?: () => void;
  onContinueNow?: () => void;
}

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  showFeedback: boolean;
  isComplete: boolean;
  score: number;
}

const ChapterQuiz: React.FC<ChapterQuizProps> = ({
  questions,
  onQuizComplete,
  onBackToContent,
  className = '',
  showAutoAdvance = false,
  countdown = 10,
  nextPageTitle,
  onCancelAutoAdvance,
  onContinueNow
}) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: new Array(questions.length).fill(null),
    showFeedback: false,
    isComplete: false,
    score: 0
  });

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const isLastQuestion = quizState.currentQuestionIndex === questions.length - 1;
  const hasSelectedAnswer = quizState.selectedAnswers[quizState.currentQuestionIndex] !== null;

  // Calculate score when quiz is completed
  useEffect(() => {
    if (quizState.isComplete && quizState.score === 0) {
      const correctAnswers = quizState.selectedAnswers.reduce((count: number, answer, index) => {
        return answer === questions[index].correctAnswer ? count + 1 : count;
      }, 0);
      
      const finalScore = correctAnswers;
      setQuizState(prev => ({ ...prev, score: finalScore }));
      onQuizComplete(finalScore, questions.length);
    }
  }, [quizState.isComplete, quizState.selectedAnswers, quizState.score, questions, onQuizComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState.showFeedback) return; // Prevent changing answer after feedback is shown

    const newSelectedAnswers = [...quizState.selectedAnswers];
    newSelectedAnswers[quizState.currentQuestionIndex] = answerIndex;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: newSelectedAnswers
    }));
  };

  // Handle keyboard navigation for answer options
  const handleAnswerKeyDown = (event: React.KeyboardEvent, answerIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleAnswerSelect(answerIndex);
    }
  };

  const handleShowFeedback = () => {
    if (!hasSelectedAnswer) return;
    
    setQuizState(prev => ({
      ...prev,
      showFeedback: true
    }));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Complete the quiz
      setQuizState(prev => ({
        ...prev,
        isComplete: true
      }));
    } else {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showFeedback: false
      }));
    }
  };

  const handleRestartQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: new Array(questions.length).fill(null),
      showFeedback: false,
      isComplete: false,
      score: 0
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'Výborně! Máte dobré znalosti tématu.';
    if (percentage >= 60) return 'Dobře, ale je prostor pro zlepšení.';
    return 'Doporučujeme si téma znovu prostudovat.';
  };

  if (quizState.isComplete) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`} role="main" aria-labelledby="quiz-results-heading">
        {/* Quiz Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 id="quiz-results-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Kvíz dokončen!
            </h2>

            {/* Score Display */}
            <div className="mb-6" role="status" aria-live="polite">
              <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getScoreColor(quizState.score, questions.length)}`}>
                {quizState.score}/{questions.length}
              </div>
              <div className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2">
                {Math.round((quizState.score / questions.length) * 100)}% správně
              </div>
              <p className={`text-sm sm:text-base ${getScoreColor(quizState.score, questions.length)}`}>
                {getScoreMessage(quizState.score, questions.length)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200 font-medium min-h-[48px] touch-manipulation"
                aria-label="Zkusit kvíz znovu"
              >
                Zkusit znovu
              </button>
              
              {onBackToContent && (
                <button
                  onClick={onBackToContent}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                           focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                           transition-colors duration-200 font-medium min-h-[48px] touch-manipulation"
                  aria-label="Vrátit se k obsahu kapitoly"
                >
                  Zpět k obsahu
                </button>
              )}
            </div>

            {/* Auto-Advance Countdown */}
            {showAutoAdvance && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Další stránka začne za
                  </h3>
                  
                  {/* Countdown Display */}
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {countdown}
                  </div>
                  
                  {/* Reverse Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 10) * 100}%` }}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center mb-3">
                    <button
                      onClick={onCancelAutoAdvance}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                               focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                    >
                      Zůstat zde
                    </button>
                    
                    <button
                      onClick={onContinueNow}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                               focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                    >
                      Pokračovat nyní
                    </button>
                  </div>
                  
                  {/* Next Page Preview */}
                  {nextPageTitle && (
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Další: <span className="font-medium">{nextPageTitle}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`} role="main" aria-labelledby="quiz-heading">
      {/* Quiz Header */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 id="quiz-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Kvíz
          </h2>
          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400" aria-live="polite">
            Otázka {quizState.currentQuestionIndex + 1} z {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
          role="progressbar"
          aria-valuenow={quizState.currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Pokrok kvízu: otázka ${quizState.currentQuestionIndex + 1} z ${questions.length}`}
        >
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${(quizState.currentQuestionIndex / questions.length) * 100}%` 
            }}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-6">
        {/* Question */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        <fieldset className="space-y-3 mb-6">
          <legend className="sr-only">Vyberte odpověď</legend>
          {currentQuestion.options.map((option, index) => {
            const isSelected = quizState.selectedAnswers[quizState.currentQuestionIndex] === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrectness = quizState.showFeedback;
            
            let buttonClasses = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-200 min-h-[60px] touch-manipulation focus:ring-2 focus:ring-offset-2 ';
            
            if (showCorrectness) {
              if (isCorrect) {
                buttonClasses += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 focus:ring-green-500';
              } else if (isSelected && !isCorrect) {
                buttonClasses += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 focus:ring-red-500';
              } else {
                buttonClasses += 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 focus:ring-gray-500';
              }
            } else if (isSelected) {
              buttonClasses += 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 focus:ring-blue-500';
            } else {
              buttonClasses += 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-200 focus:ring-blue-500';
            }

            const ariaLabel = `Možnost ${String.fromCharCode(65 + index)}: ${option}${isSelected ? ' - vybrána' : ''}${showCorrectness && isCorrect ? ' - správná odpověď' : ''}${showCorrectness && isSelected && !isCorrect ? ' - nesprávná odpověď' : ''}`;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                onKeyDown={(e) => handleAnswerKeyDown(e, index)}
                disabled={quizState.showFeedback}
                className={buttonClasses}
                data-testid={`option-${index}`}
                aria-label={ariaLabel}
                role="radio"
                aria-checked={isSelected}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span className="font-medium">{option}</span>
                  
                  {/* Correct/Incorrect Icons */}
                  {showCorrectness && isCorrect && (
                    <div className="ml-auto text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {showCorrectness && isSelected && !isCorrect && (
                    <div className="ml-auto text-red-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </fieldset>

        {/* Explanation */}
        {quizState.showFeedback && currentQuestion.explanation && (
          <div className="mb-6 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="region" aria-labelledby="explanation-heading">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 id="explanation-heading" className="font-medium text-blue-900 dark:text-blue-100 mb-1">Vysvětlení</h4>
                <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          {onBackToContent && quizState.currentQuestionIndex === 0 && !quizState.showFeedback && (
            <button
              onClick={onBackToContent}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700
                       focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                       rounded-lg transition-colors duration-200 min-h-[48px] touch-manipulation
                       sm:self-start"
              aria-label="Vrátit se k obsahu kapitoly"
            >
              ← Zpět k obsahu
            </button>
          )}
          
          <div className="sm:ml-auto">
            {!quizState.showFeedback ? (
              <button
                onClick={handleShowFeedback}
                disabled={!hasSelectedAnswer}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:bg-gray-300 disabled:cursor-not-allowed disabled:focus:ring-0
                         transition-colors duration-200 font-medium min-h-[48px] touch-manipulation"
                data-testid="check-answer-button"
                aria-label={hasSelectedAnswer ? "Zkontrolovat vybranou odpověď" : "Nejprve vyberte odpověď"}
              >
                Zkontrolovat odpověď
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200 font-medium min-h-[48px] touch-manipulation"
                data-testid="next-question-button"
                aria-label={isLastQuestion ? "Dokončit kvíz a zobrazit výsledky" : "Přejít na další otázku"}
              >
                {isLastQuestion ? 'Dokončit kvíz' : 'Další otázka'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterQuiz;