import { useState, useEffect, useCallback } from 'react';
import {
  List,
  Plus,
  Trash2,
  Edit2,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Search,
  X,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';
import { showSuccessToast, showErrorToast } from '../common/Toast';

const LIST_PURPOSES = [
  {
    value: 'app.bsky.graph.defs#curatelist',
    label: 'Curate List',
    description: 'A list of users for curation purposes (e.g., following, feeds)',
    icon: Users,
  },
  {
    value: 'app.bsky.graph.defs#modlist',
    label: 'Moderation List',
    description: 'A list of users to mute or block',
    icon: Shield,
  },
];

function ListsSettings() {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create/Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: 'app.bsky.graph.defs#curatelist',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Members modal state
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Add member state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch user's lists
  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/lists');
      setLists(response.data.lists || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setError('Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Fetch list members
  const fetchMembers = async (listUri) => {
    setIsLoadingMembers(true);
    try {
      const response = await api.get(`/lists/${encodeURIComponent(listUri)}`);
      setMembers(response.data.items || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      showErrorToast('Failed to load list members');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await api.get('/lists/search/users', {
        params: { q: searchQuery, limit: 10 },
      });
      setSearchResults(response.data.actors || []);
    } catch (err) {
      console.error('Search failed:', err);
      showErrorToast('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Create or update list
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingList) {
        // Extract rkey from URI
        const rkey = editingList.uri.split('/').pop();
        await api.patch(`/lists/${rkey}`, {
          name: formData.name,
          description: formData.description,
        });
        showSuccessToast('List updated');
      } else {
        await api.post('/lists', formData);
        showSuccessToast('List created');
      }

      setShowCreateModal(false);
      setEditingList(null);
      setFormData({ name: '', description: '', purpose: 'app.bsky.graph.defs#curatelist' });
      fetchLists();
    } catch (err) {
      console.error('Failed to save list:', err);
      showErrorToast(editingList ? 'Failed to update list' : 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete list
  const handleDelete = async (list) => {
    if (!confirm(`Delete "${list.name}"? This cannot be undone.`)) return;

    try {
      const rkey = list.uri.split('/').pop();
      await api.delete(`/lists/${rkey}`);
      showSuccessToast('List deleted');
      fetchLists();
    } catch (err) {
      console.error('Failed to delete list:', err);
      showErrorToast('Failed to delete list');
    }
  };

  // Add member to list
  const handleAddMember = async (user) => {
    if (!selectedList) return;

    try {
      await api.post(`/lists/${encodeURIComponent(selectedList.uri)}/members`, {
        did: user.did,
      });
      showSuccessToast(`Added ${user.displayName || user.handle}`);
      fetchMembers(selectedList.uri);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add member:', err);
      showErrorToast('Failed to add member');
    }
  };

  // Remove member from list
  const handleRemoveMember = async (item) => {
    if (!selectedList) return;

    try {
      const rkey = item.uri.split('/').pop();
      await api.delete(`/lists/${encodeURIComponent(selectedList.uri)}/members/${rkey}`);
      showSuccessToast('Member removed');
      fetchMembers(selectedList.uri);
    } catch (err) {
      console.error('Failed to remove member:', err);
      showErrorToast('Failed to remove member');
    }
  };

  // Open edit modal
  const handleEdit = (list) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      purpose: list.purpose,
    });
    setShowCreateModal(true);
  };

  // Open members modal
  const handleViewMembers = (list) => {
    setSelectedList(list);
    setShowMembersModal(true);
    fetchMembers(list.uri);
  };

  // Get purpose info
  const getPurposeInfo = (purpose) => {
    return LIST_PURPOSES.find(p => p.value === purpose) || LIST_PURPOSES[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <List className="w-6 h-6" />
            Lists
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Create and manage your lists
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingList(null);
            setFormData({ name: '', description: '', purpose: 'app.bsky.graph.defs#curatelist' });
            setShowCreateModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Lists */}
      {lists.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No lists yet</p>
          <p className="text-sm mt-1">Create a list to organize users</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const purposeInfo = getPurposeInfo(list.purpose);
            const PurposeIcon = purposeInfo.icon;

            return (
              <div
                key={list.uri}
                className="p-4 bg-bg-tertiary rounded-lg border border-border"
              >
                <div className="flex items-start gap-4">
                  {/* List avatar */}
                  <div className="w-12 h-12 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                    {list.avatar ? (
                      <img src={list.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <PurposeIcon className="w-6 h-6 text-text-muted" />
                    )}
                  </div>

                  {/* List info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary truncate">
                        {list.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {purposeInfo.label}
                      </span>
                    </div>
                    {list.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                    <p className="text-xs text-text-muted mt-2">
                      {list.listItemCount || 0} members
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMembers(list)}
                      title="Manage members"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(list)}
                      title="Edit list"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(list)}
                      title="Delete list"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingList(null);
        }}
        title={editingList ? 'Edit List' : 'Create List'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My List"
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={64}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this list for?"
              className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              maxLength={300}
            />
          </div>

          {/* Purpose (only when creating) */}
          {!editingList && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Purpose
              </label>
              <div className="space-y-2">
                {LIST_PURPOSES.map((purpose) => {
                  const Icon = purpose.icon;
                  return (
                    <label
                      key={purpose.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.purpose === purpose.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-text-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        value={purpose.value}
                        checked={formData.purpose === purpose.value}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        className="sr-only"
                      />
                      <Icon className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">{purpose.label}</p>
                        <p className="text-sm text-text-muted">{purpose.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setEditingList(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingList ? (
                'Save Changes'
              ) : (
                'Create List'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => {
          setShowMembersModal(false);
          setSelectedList(null);
          setMembers([]);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title={selectedList?.name || 'List Members'}
      >
        <div className="p-4 space-y-4">
          {/* Search to add */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Add Member
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by handle or name"
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.did}
                    className="flex items-center gap-3 p-2 bg-bg-secondary rounded-lg"
                  >
                    <Avatar src={user.avatar} alt={user.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {user.displayName || user.handle}
                      </p>
                      <p className="text-xs text-text-muted truncate">@{user.handle}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddMember(user)}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current members */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Members ({members.length})
            </h4>
            {isLoadingMembers ? (
              <div className="flex justify-center py-4">
                <Loading size="md" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-center py-4 text-text-muted text-sm">
                No members yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((item) => (
                  <div
                    key={item.uri}
                    className="flex items-center gap-3 p-2 bg-bg-secondary rounded-lg"
                  >
                    <Avatar src={item.subject?.avatar} alt={item.subject?.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {item.subject?.displayName || item.subject?.handle}
                      </p>
                      <p className="text-xs text-text-muted truncate">@{item.subject?.handle}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(item)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ListsSettings;
