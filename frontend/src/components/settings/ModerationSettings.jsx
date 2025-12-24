import { useState, useEffect } from 'react';
import {
  Shield,
  Ban,
  VolumeX,
  MessageSquareOff,
  Trash2,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  User,
  Tags,
} from 'lucide-react';
import { useModerationStore } from '../../stores/moderationStore';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ContentLabelSettings from './ContentLabelSettings';
import { showSuccessToast, showErrorToast } from '../common/Toast';
import { formatDistanceToNow } from 'date-fns';

const TABS = [
  { id: 'blocked', label: 'Blocked Users', icon: Ban },
  { id: 'muted', label: 'Muted Users', icon: VolumeX },
  { id: 'words', label: 'Muted Words', icon: MessageSquareOff },
  { id: 'labels', label: 'Content Labels', icon: Tags },
];

const DURATION_OPTIONS = [
  { value: null, label: 'Permanent' },
  { value: 60 * 60, label: '1 hour' },
  { value: 24 * 60 * 60, label: '24 hours' },
  { value: 7 * 24 * 60 * 60, label: '7 days' },
  { value: 30 * 24 * 60 * 60, label: '30 days' },
];

function BlockedUsersTab() {
  const { blockedUsers, fetchBlockedUsers, unblockUser, isLoading } = useModerationStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (did) => {
    if (!confirm('Unblock this user?')) return;
    const result = await unblockUser(did);
    if (result.success) {
      showSuccessToast('User unblocked');
    } else {
      showErrorToast('Failed to unblock user');
    }
  };

  const filteredUsers = blockedUsers.filter((user) =>
    user.blockedDid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">
        Blocked users cannot see your posts, follow you, or interact with your content.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search blocked users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Ban}
          title="No blocked users"
          description="You haven't blocked anyone yet"
        />
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              did={user.blockedDid}
              handle={user.handle}
              displayName={user.displayName}
              avatar={user.avatar}
              timestamp={user.blockedAt}
              timestampLabel="Blocked"
              onAction={() => handleUnblock(user.blockedDid)}
              actionLabel="Unblock"
              actionVariant="danger"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MutedUsersTab() {
  const { mutedUsers, fetchMutedUsers, unmuteUser, isLoading } = useModerationStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMutedUsers();
  }, [fetchMutedUsers]);

  const handleUnmute = async (did) => {
    const result = await unmuteUser(did);
    if (result.success) {
      showSuccessToast('User unmuted');
    } else {
      showErrorToast('Failed to unmute user');
    }
  };

  const filteredUsers = mutedUsers.filter((user) =>
    user.mutedDid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">
        Muted users' posts won't appear in your timeline, but they can still interact with you.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search muted users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={VolumeX}
          title="No muted users"
          description="You haven't muted anyone yet"
        />
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              did={user.mutedDid}
              handle={user.handle}
              displayName={user.displayName}
              avatar={user.avatar}
              timestamp={user.mutedAt}
              timestampLabel="Muted"
              expiresAt={user.expiresAt}
              onAction={() => handleUnmute(user.mutedDid)}
              actionLabel="Unmute"
              actionVariant="secondary"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MutedWordsTab() {
  const { mutedWords, fetchMutedWords, addMutedWord, removeMutedWord, isLoading } = useModerationStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    fetchMutedWords();
  }, [fetchMutedWords]);

  const handleAdd = async () => {
    if (!newWord.trim()) return;

    const result = await addMutedWord(newWord.trim(), isRegex, duration);
    if (result.success) {
      showSuccessToast('Muted word added');
      setShowAddModal(false);
      setNewWord('');
      setIsRegex(false);
      setDuration(null);
    } else {
      showErrorToast('Failed to add muted word');
    }
  };

  const handleRemove = async (id) => {
    const result = await removeMutedWord(id);
    if (result.success) {
      showSuccessToast('Muted word removed');
    } else {
      showErrorToast('Failed to remove muted word');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-sm">
          Posts containing these words or phrases will be hidden from your timeline.
        </p>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Word
        </Button>
      </div>

      {mutedWords.length === 0 ? (
        <EmptyState
          icon={MessageSquareOff}
          title="No muted words"
          description="Add words or phrases to filter from your timeline"
        />
      ) : (
        <div className="space-y-2">
          {mutedWords.map((word) => (
            <div
              key={word.id}
              className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
            >
              <div className="flex items-center gap-3">
                <MessageSquareOff className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="font-medium text-text-primary">
                    {word.word}
                    {word.isRegex && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        Regex
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Added {formatDistanceToNow(new Date(word.mutedAt))} ago</span>
                    {word.expiresAt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {formatDistanceToNow(new Date(word.expiresAt))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(word.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Muted Word"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Word or Phrase
            </label>
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter word or phrase to mute"
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <span className="text-text-primary">Use as Regular Expression</span>
                <p className="text-xs text-text-muted">
                  Advanced pattern matching (e.g., \bword\b for whole words)
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Duration
            </label>
            <select
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value || ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={!newWord.trim()}>
              Add Muted Word
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserCard({
  did,
  handle,
  displayName,
  avatar,
  timestamp,
  timestampLabel,
  expiresAt,
  onAction,
  actionLabel,
  actionVariant,
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-text-muted" />
          </div>
        )}
        <div>
          <p className="font-medium text-text-primary">
            {displayName || handle || did.slice(0, 20) + '...'}
          </p>
          {handle && (
            <p className="text-sm text-text-secondary">@{handle}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{timestampLabel} {formatDistanceToNow(new Date(timestamp))} ago</span>
            {expiresAt && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires {formatDistanceToNow(new Date(expiresAt))}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <Button
        variant={actionVariant === 'danger' ? 'ghost' : 'ghost'}
        onClick={onAction}
        className={actionVariant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : ''}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12 text-text-muted">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-bg-tertiary rounded animate-pulse" />
      <div className="h-16 bg-bg-tertiary rounded animate-pulse" />
      <div className="h-16 bg-bg-tertiary rounded animate-pulse" />
      <div className="h-16 bg-bg-tertiary rounded animate-pulse" />
    </div>
  );
}

function ModerationSettings() {
  const [activeTab, setActiveTab] = useState('blocked');

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Moderation</h2>
        </div>

        {/* Warning Notice */}
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Note</p>
            <p className="text-text-secondary">
              Block and mute actions sync with Bluesky. Changes made here will also apply to other Bluesky clients.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-tertiary rounded-lg mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-bg-secondary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'blocked' && <BlockedUsersTab />}
        {activeTab === 'muted' && <MutedUsersTab />}
        {activeTab === 'words' && <MutedWordsTab />}
        {activeTab === 'labels' && <ContentLabelSettings />}
      </div>
    </div>
  );
}

export default ModerationSettings;
