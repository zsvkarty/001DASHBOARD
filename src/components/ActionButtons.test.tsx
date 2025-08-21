import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionButtons from './ActionButtons';

describe('ActionButtons', () => {
  const mockOnKnown = jest.fn();
  const mockOnUnknown = jest.fn();

  beforeEach(() => {
    mockOnKnown.mockClear();
    mockOnUnknown.mockClear();
  });

  it('renders both buttons with correct text and emojis', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={false} 
      />
    );

    expect(screen.getByText('Znám')).toBeInTheDocument();
    expect(screen.getByText('Neznám')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('calls onKnown when "Znám" button is clicked', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={false} 
      />
    );

    const knowButton = screen.getByRole('button', { name: /označit kartu jako známou/i });
    fireEvent.click(knowButton);

    expect(mockOnKnown).toHaveBeenCalledTimes(1);
    expect(mockOnUnknown).not.toHaveBeenCalled();
  });

  it('calls onUnknown when "Neznám" button is clicked', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={false} 
      />
    );

    const unknownButton = screen.getByRole('button', { name: /označit kartu jako neznámou/i });
    fireEvent.click(unknownButton);

    expect(mockOnUnknown).toHaveBeenCalledTimes(1);
    expect(mockOnKnown).not.toHaveBeenCalled();
  });

  it('disables both buttons when disabled prop is true', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={true} 
      />
    );

    const knowButton = screen.getByRole('button', { name: /označit kartu jako známou/i });
    const unknownButton = screen.getByRole('button', { name: /označit kartu jako neznámou/i });

    expect(knowButton).toBeDisabled();
    expect(unknownButton).toBeDisabled();
  });

  it('does not call handlers when buttons are disabled', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={true} 
      />
    );

    const knowButton = screen.getByRole('button', { name: /označit kartu jako známou/i });
    const unknownButton = screen.getByRole('button', { name: /označit kartu jako neznámou/i });

    fireEvent.click(knowButton);
    fireEvent.click(unknownButton);

    expect(mockOnKnown).not.toHaveBeenCalled();
    expect(mockOnUnknown).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes for enabled state', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={false} 
      />
    );

    const knowButton = screen.getByRole('button', { name: /označit kartu jako známou/i });
    const unknownButton = screen.getByRole('button', { name: /označit kartu jako neznámou/i });

    expect(knowButton).toHaveClass('bg-green-600');
    expect(unknownButton).toHaveClass('bg-red-600');
  });

  it('applies correct CSS classes for disabled state', () => {
    render(
      <ActionButtons 
        onKnown={mockOnKnown} 
        onUnknown={mockOnUnknown} 
        disabled={true} 
      />
    );

    const knowButton = screen.getByRole('button', { name: /označit kartu jako známou/i });
    const unknownButton = screen.getByRole('button', { name: /označit kartu jako neznámou/i });

    expect(knowButton).toHaveClass('bg-gray-400');
    expect(unknownButton).toHaveClass('bg-gray-400');
  });
});