import { useState } from 'react';
import { Repeat2, MessageCircle, Heart, Share, MoreHorizontal } from 'lucide-react';
import { shortTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import ProfilePopup from '../common/ProfilePopup';
import MediaPreview from './MediaPreview';
import PostActions from './PostActions';

function PostCard({ post, showReply = true, compact = false, onClick, onReply, onQuote }) {
  const { author, record, embed, replyCount, repostCount, likeCount, viewer, indexedAt } = post;
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  if (!author || !record) return null;

  const handleClick = (e) => {
    // Don't trigger if clicking on interactive elements
    if (e.target.closest('button, a, [role="button"], .avatar-clickable')) return;
    if (onClick) onClick(post);
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setShowProfilePopup(true);
  };

  return (
    <article
      className="px-4 py-3 border-b border-border hover:bg-bg-tertiary/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Avatar - clickable to show profile */}
        <div
          onClick={handleAvatarClick}
          className="avatar-clickable flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={author.avatar}
            alt={author.displayName}
            size={compact ? 'sm' : 'md'}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary truncate">
                  {author.displayName || author.handle}
                </span>
                <time className="text-text-muted text-sm flex-shrink-0">
                  {shortTimeAgo(indexedAt || record.createdAt)}
                </time>
              </div>
              <div className="text-text-muted text-sm truncate">
                @{author.handle}
              </div>
            </div>

            {/* More menu */}
            <Dropdown
              align="right"
              trigger={
                <Button variant="ghost" size="icon" className="w-8 h-8 -mt-1 -mr-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
            >
              <Dropdown.Item onClick={() => {}}>Copy link</Dropdown.Item>
              <Dropdown.Item onClick={() => {}}>Embed post</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => {}} danger>Report</Dropdown.Item>
            </Dropdown>
          </div>

          {/* Reply indicator */}
          {showReply && record.reply && (
            <div className="text-sm text-text-muted mb-1">
              Replying to a thread
            </div>
          )}

          {/* Text content */}
          {record.text && (
            <div className="text-text-primary whitespace-pre-wrap break-words mt-1 post-content">
              {record.text}
            </div>
          )}

          {/* Media */}
          {embed && (
            <div className="mt-3">
              <MediaPreview embed={embed} />
            </div>
          )}

          {/* Actions */}
          <PostActions
            post={post}
            onReply={onReply}
            onQuote={onQuote}
            className="mt-2 -ml-2"
          />
        </div>
      </div>

      {/* Profile Popup */}
      <ProfilePopup
        actor={author}
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
      />
    </article>
  );
}

export default PostCard;
