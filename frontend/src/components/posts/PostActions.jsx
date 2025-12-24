import { useState } from 'react';
import { MessageCircle, Repeat2, Heart, Share, Quote } from 'lucide-react';
import { formatNumber, cn } from '../../utils/helpers';
import postsService from '../../services/posts';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function PostActions({ post, className, onReply, onQuote }) {
  const [isLiked, setIsLiked] = useState(!!post.viewer?.like);
  const [isReposted, setIsReposted] = useState(!!post.viewer?.repost);
  const [likeUri, setLikeUri] = useState(post.viewer?.like);
  const [repostUri, setRepostUri] = useState(post.viewer?.repost);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);

  const handleLike = async () => {
    try {
      if (isLiked && likeUri) {
        await postsService.unlikePost(post.uri, likeUri);
        setIsLiked(false);
        setLikeUri(null);
        setLikeCount((c) => c - 1);
      } else {
        const result = await postsService.likePost(post.uri, post.cid);
        setIsLiked(true);
        setLikeUri(result.uri);
        setLikeCount((c) => c + 1);
      }
    } catch (error) {
      showErrorToast('Failed to like post');
    }
  };

  const handleRepost = async () => {
    try {
      if (isReposted && repostUri) {
        await postsService.deleteRepost(post.uri, repostUri);
        setIsReposted(false);
        setRepostUri(null);
        setRepostCount((c) => c - 1);
      } else {
        const result = await postsService.repost(post.uri, post.cid);
        setIsReposted(true);
        setRepostUri(result.uri);
        setRepostCount((c) => c + 1);
      }
    } catch (error) {
      showErrorToast('Failed to repost');
    }
  };

  const handleShare = async () => {
    const url = `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`;

    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      showSuccessToast('Link copied to clipboard');
    }
  };

  const handleReply = () => {
    if (onReply) onReply(post);
  };

  const handleQuote = () => {
    if (onQuote) onQuote(post);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Reply */}
      <Button
        variant="ghost"
        size="icon"
        className="group w-9 h-9"
        onClick={handleReply}
        aria-label={`Reply (${post.replyCount || 0})`}
      >
        <MessageCircle className="w-4 h-4 text-text-muted group-hover:text-primary" />
        {post.replyCount > 0 && (
          <span className="ml-1 text-xs text-text-muted group-hover:text-primary">
            {formatNumber(post.replyCount)}
          </span>
        )}
      </Button>

      {/* Repost / Quote dropdown */}
      <Dropdown
        align="left"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className={cn('group w-9 h-9', isReposted && 'text-green-500')}
            aria-label={`Repost (${repostCount})`}
          >
            <Repeat2
              className={cn(
                'w-4 h-4',
                isReposted ? 'text-green-500' : 'text-text-muted group-hover:text-green-500'
              )}
            />
            {repostCount > 0 && (
              <span
                className={cn(
                  'ml-1 text-xs',
                  isReposted ? 'text-green-500' : 'text-text-muted group-hover:text-green-500'
                )}
              >
                {formatNumber(repostCount)}
              </span>
            )}
          </Button>
        }
      >
        <Dropdown.Item onClick={handleRepost} icon={Repeat2}>
          {isReposted ? 'Undo repost' : 'Repost'}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleQuote} icon={Quote}>
          Quote post
        </Dropdown.Item>
      </Dropdown>

      {/* Like */}
      <Button
        variant="ghost"
        size="icon"
        className={cn('group w-9 h-9', isLiked && 'text-red-500')}
        onClick={handleLike}
        aria-label={`Like (${likeCount})`}
      >
        <Heart
          className={cn(
            'w-4 h-4',
            isLiked ? 'text-red-500 fill-red-500' : 'text-text-muted group-hover:text-red-500'
          )}
        />
        {likeCount > 0 && (
          <span
            className={cn(
              'ml-1 text-xs',
              isLiked ? 'text-red-500' : 'text-text-muted group-hover:text-red-500'
            )}
          >
            {formatNumber(likeCount)}
          </span>
        )}
      </Button>

      {/* Share */}
      <Button
        variant="ghost"
        size="icon"
        className="group w-9 h-9"
        onClick={handleShare}
        aria-label="Share"
      >
        <Share className="w-4 h-4 text-text-muted group-hover:text-primary" />
      </Button>
    </div>
  );
}

export default PostActions;
