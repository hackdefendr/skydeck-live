import { useState, useEffect } from 'react';
import {
  Layout,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RotateCcw,
  Home,
  Bell,
  AtSign,
  MessageSquare,
  Search,
  List,
  Rss,
  User,
  Heart,
  Bookmark,
} from 'lucide-react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useColumns } from '../../hooks/useColumns';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccessToast, showErrorToast } from '../common/Toast';

const COLUMN_TYPES = [
  { type: 'HOME', label: 'Home', icon: Home, description: 'Your home timeline' },
  { type: 'NOTIFICATIONS', label: 'Notifications', icon: Bell, description: 'All notifications' },
  { type: 'MENTIONS', label: 'Mentions', icon: AtSign, description: 'Posts mentioning you' },
  { type: 'MESSAGES', label: 'Messages', icon: MessageSquare, description: 'Direct messages' },
  { type: 'SEARCH', label: 'Search', icon: Search, description: 'Search results' },
  { type: 'LIST', label: 'List', icon: List, description: 'A user list' },
  { type: 'FEED', label: 'Custom Feed', icon: Rss, description: 'A custom feed' },
  { type: 'PROFILE', label: 'Profile', icon: User, description: 'User profile' },
  { type: 'LIKES', label: 'Likes', icon: Heart, description: 'Your liked posts' },
  { type: 'BOOKMARKS', label: 'Bookmarks', icon: Bookmark, description: 'Saved posts' },
];

function getIconForType(type) {
  const found = COLUMN_TYPES.find((ct) => ct.type === type);
  return found ? found.icon : Layout;
}

function SortableColumnItem({ column, onToggleVisibility, onRemove, onWidthChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getIconForType(column.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <Icon className="w-5 h-5 text-text-secondary" />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{column.title}</p>
        <p className="text-xs text-text-muted">{column.type}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted">Width:</label>
          <input
            type="number"
            min="280"
            max="500"
            value={column.width || 350}
            onChange={(e) => onWidthChange(column.id, parseInt(e.target.value))}
            className="w-16 px-2 py-1 text-xs rounded bg-bg-secondary border border-border"
          />
        </div>

        <button
          onClick={() => onToggleVisibility(column.id, !column.isVisible)}
          className={`p-2 rounded-lg transition-colors ${
            column.isVisible !== false
              ? 'text-text-secondary hover:bg-bg-secondary'
              : 'text-text-muted hover:bg-bg-secondary'
          }`}
          title={column.isVisible !== false ? 'Hide column' : 'Show column'}
        >
          {column.isVisible !== false ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => onRemove(column.id)}
          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          title="Remove column"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AddColumnModal({ isOpen, onClose, onAdd, existingTypes }) {
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedUri, setFeedUri] = useState('');
  const [profileDid, setProfileDid] = useState('');

  const handleAdd = async () => {
    if (!selectedType) return;

    const typeInfo = COLUMN_TYPES.find((ct) => ct.type === selectedType);
    const columnData = {
      type: selectedType,
      title: title || typeInfo.label,
    };

    if (selectedType === 'SEARCH' && searchQuery) {
      columnData.searchQuery = searchQuery;
    }
    if (selectedType === 'FEED' && feedUri) {
      columnData.feedUri = feedUri;
    }
    if (selectedType === 'PROFILE' && profileDid) {
      columnData.profileDid = profileDid;
    }

    const result = await onAdd(columnData);
    if (result.success) {
      showSuccessToast('Column added!');
      onClose();
      setSelectedType(null);
      setTitle('');
      setSearchQuery('');
      setFeedUri('');
      setProfileDid('');
    } else {
      showErrorToast('Failed to add column');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Column Type
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {COLUMN_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isSelected = selectedType === ct.type;
              return (
                <button
                  key={ct.type}
                  onClick={() => {
                    setSelectedType(ct.type);
                    setTitle(ct.label);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-text-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{ct.label}</p>
                    <p className="text-xs text-text-muted">{ct.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedType && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Column Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter column title"
                className="w-full"
              />
            </div>

            {selectedType === 'SEARCH' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Search Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search term"
                  className="w-full"
                />
              </div>
            )}

            {selectedType === 'FEED' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Feed URI
                </label>
                <input
                  type="text"
                  value={feedUri}
                  onChange={(e) => setFeedUri(e.target.value)}
                  placeholder="at://did:plc:.../app.bsky.feed.generator/..."
                  className="w-full"
                />
              </div>
            )}

            {selectedType === 'PROFILE' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Profile DID or Handle
                </label>
                <input
                  type="text"
                  value={profileDid}
                  onChange={(e) => setProfileDid(e.target.value)}
                  placeholder="did:plc:... or handle.bsky.social"
                  className="w-full"
                />
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!selectedType}
          >
            Add Column
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function LayoutSettings() {
  const {
    columns,
    isLoading,
    addColumn,
    updateColumn,
    removeColumn,
    reorderColumns,
    resetColumns,
    refresh,
  } = useColumns();

  const [showAddModal, setShowAddModal] = useState(false);
  const [localColumns, setLocalColumns] = useState([]);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localColumns.findIndex((col) => col.id === active.id);
      const newIndex = localColumns.findIndex((col) => col.id === over.id);

      const reordered = arrayMove(localColumns, oldIndex, newIndex);
      setLocalColumns(reordered);

      const result = await reorderColumns(reordered.map((col) => col.id));
      if (!result.success) {
        showErrorToast('Failed to reorder columns');
        setLocalColumns(columns);
      }
    }
  };

  const handleToggleVisibility = async (id, isVisible) => {
    const result = await updateColumn(id, { isVisible });
    if (result.success) {
      showSuccessToast(isVisible ? 'Column shown' : 'Column hidden');
    } else {
      showErrorToast('Failed to update column');
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this column?')) return;
    const result = await removeColumn(id);
    if (result.success) {
      showSuccessToast('Column removed');
    } else {
      showErrorToast('Failed to remove column');
    }
  };

  const handleWidthChange = async (id, width) => {
    if (width < 280 || width > 500) return;
    await updateColumn(id, { width });
  };

  const handleReset = async () => {
    if (!confirm('Reset to default columns? This will remove all custom columns.')) return;
    const result = await resetColumns();
    if (result.success) {
      showSuccessToast('Columns reset to default');
    } else {
      showErrorToast('Failed to reset columns');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-tertiary rounded w-1/3"></div>
          <div className="h-16 bg-bg-tertiary rounded"></div>
          <div className="h-16 bg-bg-tertiary rounded"></div>
          <div className="h-16 bg-bg-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Layout className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Column Layout</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>

        <p className="text-text-secondary mb-4">
          Drag to reorder columns. Changes are saved automatically.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localColumns.map((col) => col.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localColumns.map((column) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  onToggleVisibility={handleToggleVisibility}
                  onRemove={handleRemove}
                  onWidthChange={handleWidthChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {localColumns.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <Layout className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No columns configured</p>
            <p className="text-sm">Click "Add Column" to get started</p>
          </div>
        )}
      </div>

      <AddColumnModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addColumn}
        existingTypes={localColumns.map((col) => col.type)}
      />
    </div>
  );
}

export default LayoutSettings;
