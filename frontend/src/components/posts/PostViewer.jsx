import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { shortTimeAgo } from '../../utils/helpers';
import postsService from '../../services/posts';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import MediaPreview from './MediaPreview';
import PostActions from './PostActions';

function PostViewer({ post, isOpen, onClose, onReply, onQuote }) {
  const [thread, setThread] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && post?.uri) {
      loadThread();
    }
  }, [isOpen, post?.uri]);

  const loadThread = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const threadData = await postsService.getPostThread(post.uri);
      setThread(threadData);
    } catch (err) {
      console.error('Failed to load thread:', err);
      setError('Failed to load thread');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mainPost = thread?.post || post;
  const { author, record, embed, indexedAt } = mainPost || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] z-50 bg-bg-secondary rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Post</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <p>{error}</p>
              <Button variant="ghost" onClick={loadThread} className="mt-2">
                Try again
              </Button>
            </div>
          ) : mainPost ? (
            <div>
              {/* Parent posts */}
              {thread?.parent && (
                <div className="border-b border-border">
                  <ThreadPost post={thread.parent} isParent onReply={onReply} onQuote={onQuote} />
                </div>
              )}

              {/* Main post */}
              <div className="px-4 py-4">
                <div className="flex gap-3">
                  <Avatar
                    src={author?.avatar}
                    alt={author?.displayName}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary">
                      {author?.displayName || author?.handle}
                    </div>
                    <div className="text-text-muted text-sm">
                      @{author?.handle}
                    </div>
                  </div>
                </div>

                {/* Text content */}
                {record?.text && (
                  <div className="text-text-primary text-lg whitespace-pre-wrap break-words mt-4 post-content">
                    {record.text}
                  </div>
                )}

                {/* Media */}
                {embed && (
                  <div className="mt-4">
                    <MediaPreview embed={embed} />
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-4 text-text-muted text-sm">
                  {new Date(indexedAt || record?.createdAt).toLocaleString()}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-sm">
                  <span>
                    <strong>{mainPost.replyCount || 0}</strong>{' '}
                    <span className="text-text-muted">Replies</span>
                  </span>
                  <span>
                    <strong>{mainPost.repostCount || 0}</strong>{' '}
                    <span className="text-text-muted">Reposts</span>
                  </span>
                  <span>
                    <strong>{mainPost.likeCount || 0}</strong>{' '}
                    <span className="text-text-muted">Likes</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-border">
                  <PostActions
                    post={mainPost}
                    onReply={onReply}
                    onQuote={onQuote}
                  />
                </div>
              </div>

              {/* Replies */}
              {thread?.replies && thread.replies.length > 0 && (
                <div className="border-t border-border">
                  <div className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-tertiary">
                    Replies
                  </div>
                  {thread.replies.map((reply, index) => (
                    <ThreadPost
                      key={reply.post?.uri || index}
                      post={reply}
                      onReply={onReply}
                      onQuote={onQuote}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function ThreadPost({ post, isParent, onReply, onQuote }) {
  if (!post) return null;

  // Handle nested thread structure
  const postData = post.post || post;
  const { author, record, embed, indexedAt } = postData;

  if (!author || !record) return null;

  return (
    <div className={`px-4 py-3 ${isParent ? 'bg-bg-tertiary/30' : 'border-b border-border'}`}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar
            src={author.avatar}
            alt={author.displayName}
            size="md"
          />
          {isParent && (
            <div className="w-0.5 flex-1 bg-border mt-2" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary truncate">
              {author.displayName || author.handle}
            </span>
            <span className="text-text-muted text-sm">
              {shortTimeAgo(indexedAt || record.createdAt)}
            </span>
          </div>
          <div className="text-text-muted text-sm truncate">
            @{author.handle}
          </div>

          {record.text && (
            <div className="text-text-primary whitespace-pre-wrap break-words mt-2">
              {record.text}
            </div>
          )}

          {embed && (
            <div className="mt-2">
              <MediaPreview embed={embed} />
            </div>
          )}

          <PostActions
            post={postData}
            onReply={onReply}
            onQuote={onQuote}
            className="mt-2 -ml-2"
          />
        </div>
      </div>

      {/* Nested replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="ml-12 mt-2">
          {post.replies.map((reply, index) => (
            <ThreadPost
              key={reply.post?.uri || index}
              post={reply}
              onReply={onReply}
              onQuote={onQuote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PostViewer;
