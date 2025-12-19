import { useState } from 'react';
import {
  GripVertical,
  RefreshCw,
  Settings,
  X,
  Home,
  Bell,
  MessageCircle,
  Search,
  User,
  List,
  Rss,
  Heart,
  AtSign,
  Bookmark,
} from 'lucide-react';
import { useColumns } from '../../hooks/useColumns';
import { useFeedStore } from '../../stores/feedStore';
import { COLUMN_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import Modal from '../common/Modal';

const columnIcons = {
  [COLUMN_TYPES.HOME]: Home,
  [COLUMN_TYPES.NOTIFICATIONS]: Bell,
  [COLUMN_TYPES.MENTIONS]: AtSign,
  [COLUMN_TYPES.MESSAGES]: MessageCircle,
  [COLUMN_TYPES.SEARCH]: Search,
  [COLUMN_TYPES.PROFILE]: User,
  [COLUMN_TYPES.LIST]: List,
  [COLUMN_TYPES.FEED]: Rss,
  [COLUMN_TYPES.LIKES]: Heart,
  [COLUMN_TYPES.BOOKMARKS]: Bookmark,
};

function ColumnHeader({ column, dragHandleProps }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [title, setTitle] = useState(column.title);
  const { updateColumn, removeColumn } = useColumns();
  const { refreshFeed } = useFeedStore();

  const Icon = columnIcons[column.type] || Rss;

  const handleRefresh = () => {
    refreshFeed(column.id);
  };

  const handleSaveSettings = async () => {
    await updateColumn(column.id, { title });
    setIsSettingsOpen(false);
  };

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this column?')) {
      await removeColumn(column.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-tertiary">
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 -ml-2 rounded hover:bg-border transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-text-muted" />
        </button>

        {/* Icon and title */}
        <Icon className="w-4 h-4 text-text-secondary" />
        <h2 className="font-semibold text-text-primary flex-1 truncate">
          {column.title}
        </h2>

        {/* Actions */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label="Refresh"
          className="w-8 h-8"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        <Dropdown
          align="right"
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Column settings"
              className="w-8 h-8"
            >
              <Settings className="w-4 h-4" />
            </Button>
          }
        >
          <Dropdown.Item onClick={() => setIsSettingsOpen(true)} icon={Settings}>
            Settings
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleRemove} danger icon={X}>
            Remove column
          </Dropdown.Item>
        </Dropdown>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Column Settings"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Column Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              placeholder="Enter column title"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSettings}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ColumnHeader;
