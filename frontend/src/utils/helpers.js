import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

// Format relative time
export function timeAgo(date) {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

// Format short time (e.g., "2h", "3d")
export function shortTimeAgo(date) {
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

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
}

// Format date for display
export function formatDate(date) {
  const d = new Date(date);
  if (isToday(d)) {
    return format(d, 'h:mm a');
  }
  if (isYesterday(d)) {
    return 'Yesterday';
  }
  return format(d, 'MMM d, yyyy');
}

// Format full date time
export function formatDateTime(date) {
  const d = new Date(date);
  return format(d, 'MMM d, yyyy h:mm a');
}

// Truncate text
export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

// Format number (e.g., 1.2K, 3.4M)
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Parse AT URI
export function parseAtUri(uri) {
  const match = uri?.match(/^at:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return {
    repo: match[1],
    collection: match[2],
    rkey: match[3],
  };
}

// Build AT URI
export function buildAtUri(repo, collection, rkey) {
  return `at://${repo}/${collection}/${rkey}`;
}

// Extract handle from DID or handle
export function normalizeIdentifier(identifier) {
  if (identifier?.startsWith('@')) {
    return identifier.slice(1);
  }
  return identifier;
}

// Check if string is a valid URL
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Extract URLs from text
export function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g;
  return [...text.matchAll(urlRegex)].map((match) => match[0]);
}

// Extract mentions from text
export function extractMentions(text) {
  const mentionRegex = /@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?/g;
  return [...text.matchAll(mentionRegex)].map((match) => match[0]);
}

// Extract hashtags from text
export function extractHashtags(text) {
  const hashtagRegex = /#[\w\u0080-\uFFFF]+/g;
  return [...text.matchAll(hashtagRegex)].map((match) => match[0]);
}

// Generate a unique ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Download file
export function downloadFile(content, filename, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Classnames utility (simple version)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
