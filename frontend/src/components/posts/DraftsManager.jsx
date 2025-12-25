import { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Trash2,
  Send,
  Edit2,
  Calendar,
  X,
  MessageCircle,
  Quote,
} from 'lucide-react';
import { useDraftStore } from '../../stores/draftStore';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import Avatar from '../common/Avatar';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function DraftsManager({ isOpen, onClose, onEditDraft }) {
  const [activeTab, setActiveTab] = useState('drafts');
  const {
    drafts,
    scheduled,
    isLoading,
    fetchDrafts,
    fetchScheduled,
    deleteDraft,
    postDraft,
  } = useDraftStore();

  useEffect(() => {
    if (isOpen) {
      fetchDrafts();
      fetchScheduled();
    }
  }, [isOpen, fetchDrafts, fetchScheduled]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft?')) return;

    const result = await deleteDraft(id);
    if (result.success) {
      showSuccessToast('Draft deleted');
    } else {
      showErrorToast('Failed to delete draft');
    }
  };

  const handlePostNow = async (draft) => {
    const result = await postDraft(draft.id);
    if (result.success) {
      showSuccessToast('Post created!');
    } else {
      showErrorToast(result.error || 'Failed to create post');
    }
  };

  const handleEdit = (draft) => {
    if (onEditDraft) {
      onEditDraft(draft);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentItems = activeTab === 'drafts' ? drafts : scheduled;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Drafts & Scheduled">
      <div className="min-h-[400px]">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'drafts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            Drafts ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'scheduled'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="w-4 h-4" />
            Scheduled ({scheduled.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              {activeTab === 'drafts' ? (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No drafts</p>
                  <p className="text-sm mt-1">Saved drafts will appear here</p>
                </>
              ) : (
                <>
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No scheduled posts</p>
                  <p className="text-sm mt-1">Schedule posts for later</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-bg-tertiary rounded-lg border border-border"
                >
                  {/* Context indicators */}
                  {(item.replyTo || item.quotePost) && (
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                      {item.replyTo && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Replying to @{item.replyTo.handle}
                        </span>
                      )}
                      {item.quotePost && (
                        <span className="flex items-center gap-1">
                          <Quote className="w-3 h-3" />
                          Quote post
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text preview */}
                  <p className="text-text-primary whitespace-pre-wrap break-words line-clamp-3">
                    {item.text || '(No text)'}
                  </p>

                  {/* Media indicators */}
                  {item.mediaIds?.length > 0 && (
                    <p className="text-xs text-text-muted mt-2">
                      {item.mediaIds.length} media attached
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-text-muted">
                      {activeTab === 'scheduled' && item.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Scheduled for {formatDate(item.scheduledAt)}
                        </span>
                      ) : (
                        <span>Saved {formatDate(item.updatedAt || item.createdAt)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePostNow(item)}
                        title="Post now"
                        className="text-primary"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DraftsManager;
