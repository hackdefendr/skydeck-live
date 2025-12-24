import { Repeat2 } from 'lucide-react';
import PostCard from './PostCard';

function Post({ item, compact, onClick, onReply, onQuote }) {
  // Handle feed item format (with post property and optional reply/reason)
  if (item.post) {
    const { post, reply, reason } = item;

    return (
      <div>
        {/* Repost indicator */}
        {reason?.$type === 'app.bsky.feed.defs#reasonRepost' && (
          <div className="px-4 pt-2 flex items-center gap-2 text-sm text-text-muted">
            <Repeat2 className="w-4 h-4" />
            <span>Reposted by {reason.by?.displayName || reason.by?.handle}</span>
          </div>
        )}

        {/* Reply context */}
        {reply?.parent && (
          <PostCard
            post={reply.parent}
            showReply={false}
            compact={true}
            onClick={onClick}
            onReply={onReply}
            onQuote={onQuote}
          />
        )}

        {/* Main post */}
        <PostCard
          post={post}
          compact={compact}
          onClick={onClick}
          onReply={onReply}
          onQuote={onQuote}
        />
      </div>
    );
  }

  // Handle direct post format
  return (
    <PostCard
      post={item}
      compact={compact}
      onClick={onClick}
      onReply={onReply}
      onQuote={onQuote}
    />
  );
}

export default Post;
