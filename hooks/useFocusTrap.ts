/**
 * useFocusTrap Hook
 * 
 * Traps focus within a container element for accessibility.
 * Used primarily for modals, dialogs, and dropdown menus.
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
].join(', ');

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive?: boolean;
  /** Element to return focus to when trap is deactivated */
  returnFocusOnDeactivate?: boolean;
  /** Initial element to focus when trap is activated */
  initialFocus?: HTMLElement | null;
  /** Callback when escape key is pressed */
  onEscape?: () => void;
  /** Allow focus to leave the trap (for nested focus traps) */
  allowOutsideClick?: boolean;
}

interface UseFocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Manually focus the first focusable element */
  focusFirst: () => void;
  /** Manually focus the last focusable element */
  focusLast: () => void;
}

export function useFocusTrap(options: UseFocusTrapOptions = {}): UseFocusTrapReturn {
  const {
    isActive = true,
    returnFocusOnDeactivate = true,
    initialFocus = null,
    onEscape,
    allowOutsideClick = false,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    return Array.from(elements).filter(el => {
      // Filter out elements that are not visible
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('inert');
    });
  }, []);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle keydown events for tab trapping and escape
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus trapping
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab
      if (event.shiftKey) {
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab
      else {
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, getFocusableElements, onEscape]);

  // Handle click outside (optional)
  useEffect(() => {
    if (!isActive || allowOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Prevent focus from leaving the trap
        event.preventDefault();
        focusFirst();
      }
    };

    // Use capture phase to intercept before the click reaches the target
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isActive, allowOutsideClick, focusFirst]);

  // Store previous active element and set initial focus
  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    if (initialFocus) {
      initialFocus.focus();
    } else {
      // Focus the first focusable element after a short delay
      // to ensure the container is rendered
      const timeoutId = setTimeout(() => {
        focusFirst();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive, initialFocus, focusFirst]);

  // Return focus when deactivated
  useEffect(() => {
    return () => {
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        // Use setTimeout to ensure this runs after the component unmounts
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [returnFocusOnDeactivate]);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
}

export default useFocusTrap;
