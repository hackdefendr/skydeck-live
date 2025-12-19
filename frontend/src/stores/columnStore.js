import { create } from 'zustand';
import api from '../services/api';

export const useColumnStore = create((set, get) => ({
  columns: [],
  isLoading: false,
  error: null,

  fetchColumns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/columns');
      set({ columns: response.data.columns, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addColumn: async (columnData) => {
    try {
      const response = await api.post('/columns', columnData);
      set((state) => ({
        columns: [...state.columns, response.data.column],
      }));
      return { success: true, column: response.data.column };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateColumn: async (id, updates) => {
    try {
      const response = await api.patch(`/columns/${id}`, updates);
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === id ? response.data.column : col
        ),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeColumn: async (id) => {
    try {
      await api.delete(`/columns/${id}`);
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  reorderColumns: async (columnIds) => {
    // Optimistically update
    const { columns } = get();
    const reordered = columnIds.map((id, index) => {
      const col = columns.find((c) => c.id === id);
      return { ...col, position: index };
    });
    set({ columns: reordered });

    try {
      await api.post('/columns/reorder', { columnIds });
    } catch (error) {
      // Revert on error
      set({ columns });
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  resetColumns: async () => {
    try {
      const response = await api.post('/columns/reset');
      set({ columns: response.data.columns });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getColumn: (id) => {
    return get().columns.find((col) => col.id === id);
  },
}));
