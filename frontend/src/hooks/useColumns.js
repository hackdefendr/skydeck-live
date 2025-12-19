import { useEffect, useCallback } from 'react';
import { useColumnStore } from '../stores/columnStore';

export function useColumns() {
  const {
    columns,
    isLoading,
    error,
    fetchColumns,
    addColumn,
    updateColumn,
    removeColumn,
    reorderColumns,
    resetColumns,
    getColumn,
  } = useColumnStore();

  useEffect(() => {
    if (columns.length === 0) {
      fetchColumns();
    }
  }, [columns.length, fetchColumns]);

  const add = useCallback(async (columnData) => {
    return addColumn(columnData);
  }, [addColumn]);

  const update = useCallback(async (id, updates) => {
    return updateColumn(id, updates);
  }, [updateColumn]);

  const remove = useCallback(async (id) => {
    return removeColumn(id);
  }, [removeColumn]);

  const reorder = useCallback(async (columnIds) => {
    return reorderColumns(columnIds);
  }, [reorderColumns]);

  const reset = useCallback(async () => {
    return resetColumns();
  }, [resetColumns]);

  return {
    columns: columns.sort((a, b) => a.position - b.position),
    isLoading,
    error,
    addColumn: add,
    updateColumn: update,
    removeColumn: remove,
    reorderColumns: reorder,
    resetColumns: reset,
    getColumn,
    refresh: fetchColumns,
  };
}

export default useColumns;
