import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlashcardDisplay from './FlashcardDisplay';
import { Flashcard } from '../types';

const mockCard: Flashcard = {
  id: 1,
  question: "Co je právní norma?",
  answer: "Obecně závazné pravidlo chování stanovené nebo uznané státem, jehož dodržování je zajištěno možností státního donucení.",
  category: "Právo"
};

describe('FlashcardDisplay', () => {
  const mockOnFlip = jest.fn();
  const mockOnKnown = jest.fn();
  const mockOnUnknown = jest.fn();

  beforeEach(() => {
    mockOnFlip.mockClear();
    mockOnKnown.mockClear();
    mockOnUnknown.mockClear();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', jest.fn());
  });

  it('renders the flashcard question when not flipped', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    expect(screen.getByText(mockCard.question)).toBeInTheDocument();
    expect(screen.getByText('Klikni nebo stiskni mezerník pro zobrazení odpovědi')).toBeInTheDocument();
  });

  it('renders the flashcard answer when flipped', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={true} 
        onFlip={mockOnFlip} 
      />
    );

    expect(screen.getByText(mockCard.answer)).toBeInTheDocument();
    expect(screen.getByText('⌨️ → nebo Enter pro ✅ Znám | ← nebo Esc pro ❌ Neznám')).toBeInTheDocument();
  });

  it('calls onFlip when card is clicked', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    // Find the clickable card container by looking for the element with cursor-pointer class
    const cardContainer = screen.getByText(mockCard.question).closest('.cursor-pointer');
    expect(cardContainer).toBeInTheDocument();
    fireEvent.click(cardContainer!);

    expect(mockOnFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip when spacebar is pressed', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    // Simulate spacebar keypress
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });

    expect(mockOnFlip).toHaveBeenCalledTimes(1);
  });

  it('calls onFlip when Space key is pressed (alternative key event)', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    // Simulate Space key with code property
    fireEvent.keyDown(document, { code: 'Space' });

    expect(mockOnFlip).toHaveBeenCalledTimes(1);
  });

  it('does not call onFlip when other keys are pressed', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    // Test various other keys
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    fireEvent.keyDown(document, { key: 'a', code: 'KeyA' });

    expect(mockOnFlip).not.toHaveBeenCalled();
  });

  it('prevents default behavior when spacebar is pressed', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
    const preventDefaultSpy = jest.spyOn(spaceEvent, 'preventDefault');
    
    fireEvent(document, spaceEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not call onFlip when animating', async () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={false} 
        onFlip={mockOnFlip} 
      />
    );

    // First call should work
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    expect(mockOnFlip).toHaveBeenCalledTimes(1);

    // Immediate second call should be blocked due to animation
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    expect(mockOnFlip).toHaveBeenCalledTimes(1); // Still only 1 call
  });

  it('displays category when provided', () => {
    render(
      <FlashcardDisplay 
        card={mockCard} 
        isFlipped={true} 
        onFlip={mockOnFlip} 
      />
    );

    expect(screen.getByText(mockCard.category!)).toBeInTheDocument();
  });

  it('does not display category when not provided', () => {
    const cardWithoutCategory = { ...mockCard, category: undefined };
    render(
      <FlashcardDisplay 
        card={cardWithoutCategory} 
        isFlipped={true} 
        onFlip={mockOnFlip} 
      />
    );

    expect(screen.queryByText('Právo')).not.toBeInTheDocument();
  });

  describe('Touch Gesture Support', () => {
    it('calls onKnown when swiping right on flipped card', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate swipe right gesture
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 250, clientY: 200 }] // Move 150px to the right
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnKnown).toHaveBeenCalledTimes(1);
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('calls onUnknown when swiping left on flipped card', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate swipe left gesture
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 250, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }] // Move 150px to the left
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnUnknown).toHaveBeenCalledTimes(1);
      expect(mockOnKnown).not.toHaveBeenCalled();
    });

    it('does not trigger actions for short swipes', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate short swipe (less than threshold)
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 150, clientY: 200 }] // Move only 50px
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnKnown).not.toHaveBeenCalled();
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('does not trigger swipe actions when card is not flipped', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={false} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.question).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate swipe right gesture on unflipped card
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 250, clientY: 200 }]
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnKnown).not.toHaveBeenCalled();
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('does not trigger swipe actions when action handlers are not provided', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate swipe right gesture without handlers
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 250, clientY: 200 }]
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      // Should not throw errors and should not call any handlers
      expect(mockOnKnown).not.toHaveBeenCalled();
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('ignores vertical swipes to avoid interfering with scrolling', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // Simulate vertical swipe (should be ignored)
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 200, clientY: 100 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 200, clientY: 250 }] // Move 150px down
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnKnown).not.toHaveBeenCalled();
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('does not trigger swipe actions when animating', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      const cardContainer = screen.getByText(mockCard.answer).closest('.cursor-pointer');
      expect(cardContainer).toBeInTheDocument();

      // First trigger animation by flipping
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });

      // Try to swipe while animating
      fireEvent.touchStart(cardContainer!, {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      fireEvent.touchMove(cardContainer!, {
        touches: [{ clientX: 250, clientY: 200 }]
      });
      
      fireEvent.touchEnd(cardContainer!, {});

      expect(mockOnKnown).not.toHaveBeenCalled();
      expect(mockOnUnknown).not.toHaveBeenCalled();
    });

    it('shows mobile swipe instructions when card is flipped', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={true} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      expect(screen.getByText('📱 Swipe doprava pro ✅ Znám, doleva pro ❌ Neznám')).toBeInTheDocument();
    });

    it('does not show mobile swipe instructions when card is not flipped', () => {
      render(
        <FlashcardDisplay 
          card={mockCard} 
          isFlipped={false} 
          onFlip={mockOnFlip}
          onKnown={mockOnKnown}
          onUnknown={mockOnUnknown}
        />
      );

      expect(screen.queryByText('📱 Swipe doprava pro ✅ Znám, doleva pro ❌ Neznám')).not.toBeInTheDocument();
    });
  });
});