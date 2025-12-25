import { useEffect, useCallback, useRef } from 'react';
import { useKeyboardStore } from '../stores/keyboardStore';
import { useColumns } from './useColumns';
import { COLUMN_TYPES } from '../utils/constants';

// Check if the user is typing in an input field
const isTyping = () => {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.isContentEditable;
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';

  return isInput || isEditable;
};

// Keyboard shortcut definitions
export const SHORTCUTS = {
  // Help
  SHOW_HELP: { key: '?', description: 'Show keyboard shortcuts', category: 'General' },

  // Compose
  NEW_POST: { key: 'n', description: 'New post', category: 'Compose' },

  // Navigation
  NEXT_COLUMN: { key: 'l', altKey: 'ArrowRight', description: 'Next column', category: 'Navigation' },
  PREV_COLUMN: { key: 'h', altKey: 'ArrowLeft', description: 'Previous column', category: 'Navigation' },
  SCROLL_DOWN: { key: 'j', altKey: 'ArrowDown', description: 'Scroll down', category: 'Navigation' },
  SCROLL_UP: { key: 'k', altKey: 'ArrowUp', description: 'Scroll up', category: 'Navigation' },
  JUMP_TO_COLUMN: { key: '1-9', description: 'Jump to column 1-9', category: 'Navigation' },
  SCROLL_TOP: { key: 'g g', description: 'Scroll to top', category: 'Navigation' },

  // Go-to shortcuts (g + key)
  GO_HOME: { key: 'g h', description: 'Go to Home column', category: 'Go To' },
  GO_NOTIFICATIONS: { key: 'g n', description: 'Go to Notifications', category: 'Go To' },
  GO_MESSAGES: { key: 'g m', description: 'Go to Messages', category: 'Go To' },
  GO_SEARCH: { key: 'g s', description: 'Go to Search', category: 'Go To' },
  GO_PROFILE: { key: 'g p', description: 'Go to Profile', category: 'Go To' },

  // Actions
  REFRESH: { key: 'r', description: 'Refresh current column', category: 'Actions' },
  SEARCH: { key: '/', description: 'Focus search', category: 'Actions' },
  CLOSE: { key: 'Escape', description: 'Close modal/dialog', category: 'Actions' },
};

export function useKeyboardShortcuts({ onCompose, onRefreshColumn } = {}) {
  const { columns } = useColumns();
  const {
    focusedColumnIndex,
    setFocusedColumnIndex,
    toggleHelp,
    pendingGoTo,
    setPendingGoTo,
    columnRefs,
    setShouldOpenCompose,
  } = useKeyboardStore();

  const pendingGoToTimeout = useRef(null);

  // Clear pending go-to after timeout
  const clearPendingGoTo = useCallback(() => {
    if (pendingGoToTimeout.current) {
      clearTimeout(pendingGoToTimeout.current);
    }
    setPendingGoTo(false);
  }, [setPendingGoTo]);

  // Set pending go-to with timeout
  const startPendingGoTo = useCallback(() => {
    setPendingGoTo(true);
    pendingGoToTimeout.current = setTimeout(() => {
      setPendingGoTo(false);
    }, 1500); // 1.5 second timeout for second key
  }, [setPendingGoTo]);

  // Scroll focused column
  const scrollColumn = useCallback((direction) => {
    const column = columns[focusedColumnIndex];
    if (!column) return;

    const ref = columnRefs.get(column.id);
    if (ref?.current) {
      const scrollAmount = direction === 'down' ? 300 : -300;
      ref.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, [columns, focusedColumnIndex, columnRefs]);

  // Scroll to top of focused column
  const scrollToTop = useCallback(() => {
    const column = columns[focusedColumnIndex];
    if (!column) return;

    const ref = columnRefs.get(column.id);
    if (ref?.current) {
      ref.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [columns, focusedColumnIndex, columnRefs]);

  // Find and focus column by type
  const focusColumnByType = useCallback((type) => {
    const index = columns.findIndex((col) => col.type === type);
    if (index !== -1) {
      setFocusedColumnIndex(index);
      // Scroll the column into view
      const column = columns[index];
      const ref = columnRefs.get(column.id);
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
      return true;
    }
    return false;
  }, [columns, setFocusedColumnIndex, columnRefs]);

  // Move focus to adjacent column
  const moveFocus = useCallback((direction) => {
    if (columns.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (focusedColumnIndex + 1) % columns.length;
    } else {
      newIndex = (focusedColumnIndex - 1 + columns.length) % columns.length;
    }

    setFocusedColumnIndex(newIndex);

    // Scroll the new column into view
    const column = columns[newIndex];
    const ref = columnRefs.get(column.id);
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [columns, focusedColumnIndex, setFocusedColumnIndex, columnRefs]);

  // Jump to column by number
  const jumpToColumn = useCallback((num) => {
    const index = num - 1;
    if (index >= 0 && index < columns.length) {
      setFocusedColumnIndex(index);
      const column = columns[index];
      const ref = columnRefs.get(column.id);
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }
  }, [columns, setFocusedColumnIndex, columnRefs]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    // Don't handle shortcuts when typing
    if (isTyping()) {
      // Exception: Escape should still work to blur
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }
      return;
    }

    // Don't handle if modifier keys are pressed (except shift for ?)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    const key = e.key;

    // Handle pending go-to shortcuts (g + key)
    if (pendingGoTo) {
      clearPendingGoTo();

      switch (key) {
        case 'h':
          e.preventDefault();
          focusColumnByType(COLUMN_TYPES.HOME);
          return;
        case 'n':
          e.preventDefault();
          focusColumnByType(COLUMN_TYPES.NOTIFICATIONS);
          return;
        case 'm':
          e.preventDefault();
          focusColumnByType(COLUMN_TYPES.MESSAGES);
          return;
        case 's':
          e.preventDefault();
          focusColumnByType(COLUMN_TYPES.SEARCH);
          return;
        case 'p':
          e.preventDefault();
          focusColumnByType(COLUMN_TYPES.PROFILE);
          return;
        case 'g':
          // g g = scroll to top
          e.preventDefault();
          scrollToTop();
          return;
        default:
          return;
      }
    }

    switch (key) {
      // Help
      case '?':
        e.preventDefault();
        toggleHelp();
        break;

      // Compose
      case 'n':
        e.preventDefault();
        if (onCompose) {
          onCompose();
        } else {
          setShouldOpenCompose(true);
        }
        break;

      // Navigation - next/prev column
      case 'l':
      case 'ArrowRight':
        e.preventDefault();
        moveFocus('next');
        break;

      case 'h':
      case 'ArrowLeft':
        e.preventDefault();
        moveFocus('prev');
        break;

      // Navigation - scroll
      case 'j':
      case 'ArrowDown':
        e.preventDefault();
        scrollColumn('down');
        break;

      case 'k':
      case 'ArrowUp':
        e.preventDefault();
        scrollColumn('up');
        break;

      // Go-to prefix
      case 'g':
        e.preventDefault();
        startPendingGoTo();
        break;

      // Jump to column 1-9
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        e.preventDefault();
        jumpToColumn(parseInt(key, 10));
        break;

      // Refresh
      case 'r':
        e.preventDefault();
        if (onRefreshColumn) {
          onRefreshColumn(focusedColumnIndex);
        }
        break;

      // Search focus
      case '/':
        e.preventDefault();
        // Find search column or create one
        if (!focusColumnByType(COLUMN_TYPES.SEARCH)) {
          // Could trigger add search column here
        }
        break;

      // Close/Escape is handled elsewhere
      default:
        break;
    }
  }, [
    pendingGoTo,
    clearPendingGoTo,
    focusColumnByType,
    scrollToTop,
    toggleHelp,
    onCompose,
    setShouldOpenCompose,
    moveFocus,
    scrollColumn,
    startPendingGoTo,
    jumpToColumn,
    onRefreshColumn,
    focusedColumnIndex,
  ]);

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pendingGoToTimeout.current) {
        clearTimeout(pendingGoToTimeout.current);
      }
    };
  }, [handleKeyDown]);

  return {
    focusedColumnIndex,
    pendingGoTo,
  };
}

export default useKeyboardShortcuts;
