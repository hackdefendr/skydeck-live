export const COLUMN_TYPES = {
  HOME: 'HOME',
  NOTIFICATIONS: 'NOTIFICATIONS',
  MENTIONS: 'MENTIONS',
  MESSAGES: 'MESSAGES',
  SEARCH: 'SEARCH',
  LIST: 'LIST',
  FEED: 'FEED',
  PROFILE: 'PROFILE',
  LIKES: 'LIKES',
  BOOKMARKS: 'BOOKMARKS',
  HASHTAG: 'HASHTAG',
};

export const COLUMN_ICONS = {
  HOME: 'Home',
  NOTIFICATIONS: 'Bell',
  MENTIONS: 'AtSign',
  MESSAGES: 'MessageCircle',
  SEARCH: 'Search',
  LIST: 'List',
  FEED: 'Rss',
  PROFILE: 'User',
  LIKES: 'Heart',
  BOOKMARKS: 'Bookmark',
  HASHTAG: 'Hash',
};

export const COLUMN_TITLES = {
  HOME: 'Home',
  NOTIFICATIONS: 'Notifications',
  MENTIONS: 'Mentions',
  MESSAGES: 'Messages',
  SEARCH: 'Search',
  LIST: 'List',
  FEED: 'Feed',
  PROFILE: 'Profile',
  LIKES: 'Likes',
  BOOKMARKS: 'Bookmarks',
  HASHTAG: 'Hashtag',
};

export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  REPOST: 'repost',
  FOLLOW: 'follow',
  MENTION: 'mention',
  REPLY: 'reply',
  QUOTE: 'quote',
};

export const MAX_POST_LENGTH = 300;

export const MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
};

export const MAX_IMAGES = 4;
export const MAX_IMAGE_SIZE = 1000000; // 1MB
export const MAX_VIDEO_SIZE = 50000000; // 50MB

export const REPORT_REASONS = [
  { value: 'com.atproto.moderation.defs#reasonSpam', label: 'Spam' },
  { value: 'com.atproto.moderation.defs#reasonViolation', label: 'Community Guidelines Violation' },
  { value: 'com.atproto.moderation.defs#reasonMisleading', label: 'Misleading Content' },
  { value: 'com.atproto.moderation.defs#reasonSexual', label: 'Sexual Content' },
  { value: 'com.atproto.moderation.defs#reasonRude', label: 'Harassment' },
  { value: 'com.atproto.moderation.defs#reasonOther', label: 'Other' },
];

export const THEME_MODES = ['light', 'dark', 'system'];
export const FONT_SIZES = ['small', 'medium', 'large'];
