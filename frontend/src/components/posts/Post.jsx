import PostCard from './PostCard';

function Post({ item, compact }) {
  // Handle feed item format (with post property and optional reply/reason)
  if (item.post) {
    const { post, reply, reason } = item;

    return (
      <div>
        {/* Repost indicator */}
        {reason?.$type === 'app.bsky.feed.defs#reasonRepost' && (
          <div className="px-4 pt-2 flex items-center gap-2 text-sm text-text-muted">
            <span>Reposted by {reason.by?.displayName || reason.by?.handle}</span>
          </div>
        )}

        {/* Reply context */}
        {reply?.parent && (
          <PostCard
            post={reply.parent}
            showReply={false}
            compact={true}
          />
        )}

        {/* Main post */}
        <PostCard post={post} compact={compact} />
      </div>
    );
  }

  // Handle direct post format
  return <PostCard post={item} compact={compact} />;
}

export default Post;
