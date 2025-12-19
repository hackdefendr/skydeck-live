import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useColumns } from '../../hooks/useColumns';
import Column from './Column';

function Deck({ columns }) {
  const { reorderColumns } = useColumns();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);
        const newOrder = arrayMove(
          columns.map((col) => col.id),
          oldIndex,
          newIndex
        );
        reorderColumns(newOrder);
      }
    },
    [columns, reorderColumns]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className="h-full overflow-x-auto overflow-y-hidden flex gap-[var(--column-gap)] p-[var(--column-gap)]"
        style={{
          scrollSnapType: 'x mandatory',
        }}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {columns.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary mb-2">No columns yet</p>
              <p className="text-text-muted text-sm">
                Click the + button to add your first column
              </p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}

export default Deck;
