import { v4 as uuidv4 } from 'uuid';

// Generate unique ID
export const generateId = () => uuidv4();

// Parse Bluesky AT URI
export const parseAtUri = (uri) => {
  const match = uri.match(/^at:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return {
    repo: match[1],
    collection: match[2],
    rkey: match[3],
  };
};

// Build AT URI
export const buildAtUri = (repo, collection, rkey) => {
  return `at://${repo}/${collection}/${rkey}`;
};

// Extract handle from DID or handle
export const normalizeIdentifier = (identifier) => {
  // Remove @ prefix if present
  if (identifier.startsWith('@')) {
    return identifier.slice(1);
  }
  return identifier;
};

// Format date for display
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString();
};

// Calculate time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label}`;
    }
  }
  return 'now';
};

// Sanitize HTML (basic)
export const sanitizeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Truncate text
export const truncate = (str, length = 100) => {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
};

// Extract mentions from text
export const extractMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?/g;
  return [...text.matchAll(mentionRegex)].map((match) => match[0]);
};

// Extract hashtags from text
export const extractHashtags = (text) => {
  const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
  return [...text.matchAll(hashtagRegex)].map((match) => match[0]);
};

// Extract URLs from text
export const extractUrls = (text) => {
  const urlRegex = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g;
  return [...text.matchAll(urlRegex)].map((match) => match[0]);
};

// Paginate array
export const paginate = (array, cursor, limit = 25) => {
  const startIndex = cursor ? array.findIndex((item) => item.id === cursor) + 1 : 0;
  const items = array.slice(startIndex, startIndex + limit);
  const nextCursor = items.length === limit ? items[items.length - 1]?.id : undefined;
  return { items, cursor: nextCursor };
};
