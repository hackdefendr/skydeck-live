import { useState, useEffect } from 'react';
import { MessageCircle, Repeat2, Heart, Share, Quote, Bookmark, MoreHorizontal, BellOff, Bell, Languages } from 'lucide-react';
import { formatNumber, cn } from '../../utils/helpers';
import postsService from '../../services/posts';
import { useBookmarkStore } from '../../stores/bookmarkStore';
import { useTranslationStore } from '../../stores/translationStore';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function PostActions({ post, className, onReply, onQuote, onTranslate }) {
  const [isLiked, setIsLiked] = useState(!!post.viewer?.like);
  const [isReposted, setIsReposted] = useState(!!post.viewer?.repost);
  const [likeUri, setLikeUri] = useState(post.viewer?.like);
  const [repostUri, setRepostUri] = useState(post.viewer?.repost);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [isTranslating, setIsTranslating] = useState(false);

  // Bookmark state
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const [bookmarked, setBookmarked] = useState(false);
  const [isThreadMuted, setIsThreadMuted] = useState(!!post.viewer?.threadMuted);

  // Translation
  const { translatePost, preferredLanguage } = useTranslationStore();

  // Check if post is bookmarked
  useEffect(() => {
    setBookmarked(isBookmarked(post.uri));
  }, [post.uri, isBookmarked]);

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

  const handleBookmark = async () => {
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    const result = await toggleBookmark(post);
    if (!result.success) {
      setBookmarked(wasBookmarked);
      showErrorToast(wasBookmarked ? 'Failed to remove bookmark' : 'Failed to add bookmark');
    } else {
      showSuccessToast(wasBookmarked ? 'Bookmark removed' : 'Post bookmarked');
    }
  };

  const handleMuteThread = async () => {
    // Get the thread root URI - use the reply root if this is a reply, otherwise use the post URI
    const threadRoot = post.record?.reply?.root?.uri || post.uri;

    try {
      if (isThreadMuted) {
        await postsService.unmuteThread(threadRoot);
        setIsThreadMuted(false);
        showSuccessToast('Thread unmuted');
      } else {
        await postsService.muteThread(threadRoot);
        setIsThreadMuted(true);
        showSuccessToast('Thread muted');
      }
    } catch (error) {
      showErrorToast(isThreadMuted ? 'Failed to unmute thread' : 'Failed to mute thread');
    }
  };

  const handleTranslate = async () => {
    const text = post.record?.text;
    if (!text) {
      showErrorToast('No text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translatePost(post.uri, text);
      if (result.success) {
        if (onTranslate) {
          onTranslate(result.text, result.detectedLanguage);
        }
        showSuccessToast(`Translated from ${result.detectedLanguage || 'unknown'}`);
      } else {
        showErrorToast(result.error || 'Translation failed');
      }
    } catch (error) {
      showErrorToast('Translation failed');
    }
    setIsTranslating(false);
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

      {/* Bookmark */}
      <Button
        variant="ghost"
        size="icon"
        className={cn('group w-9 h-9', bookmarked && 'text-primary')}
        onClick={handleBookmark}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark
          className={cn(
            'w-4 h-4',
            bookmarked ? 'text-primary fill-primary' : 'text-text-muted group-hover:text-primary'
          )}
        />
      </Button>

      {/* More menu (Share, Mute Thread) */}
      <Dropdown
        align="right"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="group w-9 h-9"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4 text-text-muted group-hover:text-primary" />
          </Button>
        }
      >
        <Dropdown.Item onClick={handleShare} icon={Share}>
          Share
        </Dropdown.Item>
        <Dropdown.Item
          onClick={handleTranslate}
          icon={Languages}
          disabled={isTranslating || !post.record?.text}
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </Dropdown.Item>
        <Dropdown.Item onClick={handleMuteThread} icon={isThreadMuted ? Bell : BellOff}>
          {isThreadMuted ? 'Unmute thread' : 'Mute thread'}
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
}

export default PostActions;
