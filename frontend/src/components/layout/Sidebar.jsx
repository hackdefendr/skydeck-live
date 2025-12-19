import { useState } from 'react';
import {
  Home,
  Bell,
  MessageCircle,
  Search,
  User,
  List,
  Rss,
  Heart,
  Plus,
  Settings,
} from 'lucide-react';
import { useColumns } from '../../hooks/useColumns';
import { useNotificationStore } from '../../stores/notificationStore';
import { COLUMN_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Modal from '../common/Modal';

const columnOptions = [
  { type: COLUMN_TYPES.HOME, icon: Home, label: 'Home' },
  { type: COLUMN_TYPES.NOTIFICATIONS, icon: Bell, label: 'Notifications' },
  { type: COLUMN_TYPES.MENTIONS, icon: Bell, label: 'Mentions' },
  { type: COLUMN_TYPES.MESSAGES, icon: MessageCircle, label: 'Messages' },
  { type: COLUMN_TYPES.SEARCH, icon: Search, label: 'Search' },
  { type: COLUMN_TYPES.PROFILE, icon: User, label: 'Profile' },
  { type: COLUMN_TYPES.LIKES, icon: Heart, label: 'Likes' },
  { type: COLUMN_TYPES.FEED, icon: Rss, label: 'Custom Feed' },
  { type: COLUMN_TYPES.LIST, icon: List, label: 'List' },
];

function Sidebar() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addColumn } = useColumns();
  const { unreadCount } = useNotificationStore();

  const handleAddColumn = async (type) => {
    const option = columnOptions.find((o) => o.type === type);
    await addColumn({
      type,
      title: option?.label || type,
    });
    setIsAddModalOpen(false);
  };

  return (
    <>
      <aside className="w-14 bg-bg-secondary border-r border-border flex flex-col items-center py-4 gap-2">
        <Button
          variant="primary"
          size="icon"
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Add column"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </aside>

      {/* Add Column Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Column"
      >
        <div className="p-4 grid grid-cols-3 gap-3">
          {columnOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => handleAddColumn(option.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-tertiary hover:bg-border transition-colors"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-text-primary">{option.label}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

export default Sidebar;
