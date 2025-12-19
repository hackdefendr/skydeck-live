import { useState } from 'react';
import { Repeat2, MessageCircle, Heart, Share, MoreHorizontal } from 'lucide-react';
import { shortTimeAgo } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import MediaPreview from './MediaPreview';
import PostActions from './PostActions';

function PostCard({ post, showReply = true, compact = false }) {
  const { author, record, embed, replyCount, repostCount, likeCount, viewer, indexedAt } = post;

  if (!author || !record) return null;

  return (
    <article className="px-4 py-3 border-b border-border hover:bg-bg-tertiary/50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={author.avatar}
          alt={author.displayName}
          size={compact ? 'sm' : 'md'}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-sm">
            <span className="font-semibold text-text-primary truncate">
              {author.displayName || author.handle}
            </span>
            <span className="text-text-muted truncate">
              @{author.handle}
            </span>
            <span className="text-text-muted">·</span>
            <time className="text-text-muted flex-shrink-0">
              {shortTimeAgo(indexedAt || record.createdAt)}
            </time>

            {/* More menu */}
            <div className="ml-auto">
              <Dropdown
                align="right"
                trigger={
                  <Button variant="ghost" size="icon" className="w-8 h-8 -mr-2">
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
            className="mt-2 -ml-2"
          />
        </div>
      </div>
    </article>
  );
}

export default PostCard;
