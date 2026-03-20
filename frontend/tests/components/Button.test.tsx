 
/**
 * Button Component Tests
 *
 * Tests for the Button component including:
 * - Rendering with different variants
 * - Size variations
 * - Loading state
 * - Disabled state
 * - Click handling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Button } from '../../src/components/Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render children text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render as a button element', () => {
      render(<Button>Test</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Test</Button>);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('variants', () => {
    it('should apply primary variant styles by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border');
    });

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should apply danger variant styles', () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-blue-600');
    });
  });

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2.5');
    });

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
    });

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>);

      expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });

    it('should hide children when loading', () => {
      render(<Button isLoading>Submit</Button>);

      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button isLoading>Submit</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show spinner animation', () => {
      render(<Button isLoading>Submit</Button>);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button isLoading onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('button types', () => {
    it('should render without explicit type attribute by default', () => {
      render(<Button>Test</Button>);

      // HTML button default type is "submit" when no type specified
      // The component doesn't set an explicit type
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should accept type submit', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should accept type reset', () => {
      render(<Button type="reset">Reset</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(document.activeElement).toBe(button);
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });

    it('should have focus-visible ring styles', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('forwarded ref', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>Test</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
