import { create } from 'zustand';

export const useKeyboardStore = create((set, get) => ({
  // Currently focused column index
  focusedColumnIndex: 0,

  // Whether keyboard shortcuts help modal is open
  showHelp: false,

  // Whether compose modal should open
  shouldOpenCompose: false,

  // Pending 'g' key for go-to shortcuts
  pendingGoTo: false,

  // Column refs for scrolling
  columnRefs: new Map(),

  setFocusedColumnIndex: (index) => set({ focusedColumnIndex: index }),

  setShowHelp: (show) => set({ showHelp: show }),

  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

  setShouldOpenCompose: (should) => set({ shouldOpenCompose: should }),

  setPendingGoTo: (pending) => set({ pendingGoTo: pending }),

  registerColumnRef: (columnId, ref) => {
    const { columnRefs } = get();
    columnRefs.set(columnId, ref);
    set({ columnRefs: new Map(columnRefs) });
  },

  unregisterColumnRef: (columnId) => {
    const { columnRefs } = get();
    columnRefs.delete(columnId);
    set({ columnRefs: new Map(columnRefs) });
  },

  getColumnRef: (columnId) => {
    return get().columnRefs.get(columnId);
  },

  // Move focus to next/previous column
  moveFocus: (direction, totalColumns) => {
    const { focusedColumnIndex } = get();
    let newIndex;

    if (direction === 'next') {
      newIndex = (focusedColumnIndex + 1) % totalColumns;
    } else {
      newIndex = (focusedColumnIndex - 1 + totalColumns) % totalColumns;
    }

    set({ focusedColumnIndex: newIndex });
    return newIndex;
  },

  // Jump to specific column
  jumpToColumn: (index, totalColumns) => {
    if (index >= 0 && index < totalColumns) {
      set({ focusedColumnIndex: index });
      return true;
    }
    return false;
  },
}));
