import { useState, useEffect } from 'react';
import {
  Layout,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RotateCcw,
  RefreshCw,
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

const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 120, label: '2m' },
  { value: 300, label: '5m' },
];
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
import api from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
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

function SortableColumnItem({ column, onToggleVisibility, onRemove, onWidthChange, onRefreshIntervalChange }) {
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
      className={`p-3 bg-bg-tertiary rounded-lg ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
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

      {/* Column settings row */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
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
          <span className="text-xs text-text-muted">px</span>
        </div>

        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
          <label className="text-xs text-text-muted">Auto-refresh:</label>
          <select
            value={column.refreshInterval ?? 60}
            onChange={(e) => onRefreshIntervalChange(column.id, parseInt(e.target.value))}
            className="px-2 py-1 text-xs rounded bg-bg-secondary border border-border"
          >
            {REFRESH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
  const [savedFeeds, setSavedFeeds] = useState([]);
  const [suggestedFeeds, setSuggestedFeeds] = useState([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [showManualFeedInput, setShowManualFeedInput] = useState(false);
  const [feedTab, setFeedTab] = useState('saved'); // 'saved' or 'suggested'

  // Fetch feeds when FEED type is selected
  useEffect(() => {
    if (selectedType === 'FEED' && isOpen) {
      fetchFeeds();
    }
  }, [selectedType, isOpen]);

  const fetchFeeds = async () => {
    setIsLoadingFeeds(true);
    try {
      const [savedRes, suggestedRes] = await Promise.all([
        api.get('/feeds/saved/info'),
        api.get('/feeds/suggested', { params: { limit: 25 } }),
      ]);
      setSavedFeeds(savedRes.data.feeds || []);
      setSuggestedFeeds(suggestedRes.data.feeds || []);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    }
    setIsLoadingFeeds(false);
  };

  const handleSelectFeed = (feed) => {
    setFeedUri(feed.uri);
    setTitle(feed.displayName || 'Custom Feed');
  };

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
      handleClose();
    } else {
      showErrorToast('Failed to add column');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedType(null);
    setTitle('');
    setSearchQuery('');
    setFeedUri('');
    setProfileDid('');
    setShowManualFeedInput(false);
    setFeedTab('saved');
  };

  const displayedFeeds = feedTab === 'saved' ? savedFeeds : suggestedFeeds;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Column">
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
                    setFeedUri('');
                    setShowManualFeedInput(false);
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
              <div className="space-y-3">
                {/* Feed tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setFeedTab('saved')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      feedTab === 'saved'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    My Feeds ({savedFeeds.length})
                  </button>
                  <button
                    onClick={() => setFeedTab('suggested')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      feedTab === 'suggested'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Discover
                  </button>
                </div>

                {/* Feed list */}
                {isLoadingFeeds ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading size="md" />
                  </div>
                ) : displayedFeeds.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {displayedFeeds.map((feed) => (
                      <button
                        key={feed.uri}
                        onClick={() => handleSelectFeed(feed)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          feedUri === feed.uri
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-text-muted'
                        }`}
                      >
                        {feed.avatar ? (
                          <img
                            src={feed.avatar}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center">
                            <Rss className="w-5 h-5 text-text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            {feed.displayName}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            by @{feed.creator?.handle}
                          </p>
                          {feed.description && (
                            <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                              {feed.description}
                            </p>
                          )}
                        </div>
                        {feed.likeCount > 0 && (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {feed.likeCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-text-muted">
                    <Rss className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {feedTab === 'saved' ? 'No saved feeds found' : 'No suggested feeds'}
                    </p>
                    <p className="text-xs mt-1">
                      {feedTab === 'saved' && 'Save feeds in Bluesky to see them here'}
                    </p>
                  </div>
                )}

                {/* Manual input toggle */}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => setShowManualFeedInput(!showManualFeedInput)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showManualFeedInput ? 'Hide manual input' : 'Enter feed URI manually'}
                  </button>
                  {showManualFeedInput && (
                    <input
                      type="text"
                      value={feedUri}
                      onChange={(e) => setFeedUri(e.target.value)}
                      placeholder="at://did:plc:.../app.bsky.feed.generator/..."
                      className="w-full mt-2"
                    />
                  )}
                </div>
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
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!selectedType || (selectedType === 'FEED' && !feedUri)}
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

  const handleRefreshIntervalChange = async (id, refreshInterval) => {
    const result = await updateColumn(id, { refreshInterval });
    if (result.success) {
      const label = REFRESH_OPTIONS.find((o) => o.value === refreshInterval)?.label || `${refreshInterval}s`;
      showSuccessToast(`Auto-refresh set to ${label}`);
    } else {
      showErrorToast('Failed to update refresh interval');
    }
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
                  onRefreshIntervalChange={handleRefreshIntervalChange}
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
