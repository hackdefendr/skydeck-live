import { useState, useEffect } from 'react';
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
  Feather,
  ArrowLeft,
} from 'lucide-react';
import { useColumns } from '../../hooks/useColumns';
import { useNotificationStore } from '../../stores/notificationStore';
import { COLUMN_TYPES } from '../../utils/constants';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import SlideOutComposer from '../posts/SlideOutComposer';
import api from '../../services/api';

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
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showFeedPicker, setShowFeedPicker] = useState(false);
  const [savedFeeds, setSavedFeeds] = useState([]);
  const [suggestedFeeds, setSuggestedFeeds] = useState([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [feedTab, setFeedTab] = useState('saved');
  const { addColumn } = useColumns();
  const { unreadCount } = useNotificationStore();

  // Fetch feeds when feed picker is shown
  useEffect(() => {
    if (showFeedPicker) {
      fetchFeeds();
    }
  }, [showFeedPicker]);

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

  const handleAddColumn = async (type) => {
    if (type === COLUMN_TYPES.FEED) {
      // Show feed picker instead of adding directly
      setShowFeedPicker(true);
      return;
    }
    const option = columnOptions.find((o) => o.type === type);
    await addColumn({
      type,
      title: option?.label || type,
    });
    setIsAddModalOpen(false);
  };

  const handleSelectFeed = async (feed) => {
    await addColumn({
      type: COLUMN_TYPES.FEED,
      title: feed.displayName || 'Custom Feed',
      feedUri: feed.uri,
    });
    setShowFeedPicker(false);
    setIsAddModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setShowFeedPicker(false);
    setFeedTab('saved');
  };

  const displayedFeeds = feedTab === 'saved' ? savedFeeds : suggestedFeeds;

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

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsComposeOpen(true)}
          aria-label="Create post"
          className="hover:bg-primary/10"
        >
          <Feather className="w-5 h-5 text-primary" />
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
        onClose={handleCloseModal}
        title={showFeedPicker ? "Select a Feed" : "Add Column"}
      >
        {showFeedPicker ? (
          <div className="p-4 space-y-4">
            {/* Back button */}
            <button
              onClick={() => setShowFeedPicker(false)}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to column types</span>
            </button>

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
                Discover ({suggestedFeeds.length})
              </button>
            </div>

            {/* Feed list */}
            {isLoadingFeeds ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="md" />
              </div>
            ) : displayedFeeds.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {displayedFeeds.map((feed) => (
                  <button
                    key={feed.uri}
                    onClick={() => handleSelectFeed(feed)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
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
              <div className="text-center py-8 text-text-muted">
                <Rss className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {feedTab === 'saved' ? 'No saved feeds found' : 'No suggested feeds available'}
                </p>
                {feedTab === 'saved' && (
                  <p className="text-xs mt-1">Save feeds in Bluesky to see them here</p>
                )}
              </div>
            )}
          </div>
        ) : (
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
        )}
      </Modal>

      {/* Slide-out Composer */}
      <SlideOutComposer
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </>
  );
}

export default Sidebar;
