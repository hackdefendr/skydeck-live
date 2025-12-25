import { useState, useEffect, useRef, useCallback } from 'react';
import { Hash, TrendingUp } from 'lucide-react';

// Popular hashtags on Bluesky - can be expanded or fetched from an API later
const POPULAR_HASHTAGS = [
  'bluesky',
  'art',
  'photography',
  'music',
  'gaming',
  'tech',
  'news',
  'science',
  'politics',
  'sports',
  'movies',
  'books',
  'food',
  'travel',
  'fashion',
  'fitness',
  'nature',
  'cats',
  'dogs',
  'memes',
  'nfl',
  'nba',
  'soccer',
  'anime',
  'coding',
  'javascript',
  'python',
  'react',
  'opensource',
  'ai',
  'machinelearning',
  'startup',
  'design',
  'ux',
  'web3',
  'crypto',
  'bitcoin',
  'climate',
  'environment',
  'health',
  'mentalhealth',
  'lgbtq',
  'pride',
  'blacksky',
  'writers',
  'poetry',
  'comics',
  'horror',
  'scifi',
  'fantasy',
];

function HashtagAutocomplete({
  text,
  cursorPosition,
  onSelect,
  textareaRef,
  isVisible,
  onClose
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Get the current word being typed (hashtag)
  const getCurrentHashtag = useCallback(() => {
    if (!text || cursorPosition === 0) return null;

    // Get text before cursor
    const textBeforeCursor = text.slice(0, cursorPosition);

    // Find the last # before cursor
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    if (lastHashIndex === -1) return null;

    // Check if there's a space between # and cursor
    const textAfterHash = textBeforeCursor.slice(lastHashIndex + 1);
    if (textAfterHash.includes(' ') || textAfterHash.includes('\n')) return null;

    // Make sure the # is at start of line or after a space
    if (lastHashIndex > 0) {
      const charBefore = textBeforeCursor[lastHashIndex - 1];
      if (charBefore !== ' ' && charBefore !== '\n') return null;
    }

    return {
      query: textAfterHash.toLowerCase(),
      startIndex: lastHashIndex,
      endIndex: cursorPosition,
    };
  }, [text, cursorPosition]);

  // Update suggestions when text changes
  useEffect(() => {
    const hashtagInfo = getCurrentHashtag();

    if (!hashtagInfo || !isVisible) {
      setSuggestions([]);
      return;
    }

    const { query } = hashtagInfo;

    // Filter hashtags based on query
    let filtered;
    if (query.length === 0) {
      // Show popular hashtags when just # is typed
      filtered = POPULAR_HASHTAGS.slice(0, 8);
    } else {
      // Filter by prefix match first, then includes
      const prefixMatches = POPULAR_HASHTAGS.filter(tag =>
        tag.toLowerCase().startsWith(query)
      );
      const includesMatches = POPULAR_HASHTAGS.filter(tag =>
        !tag.toLowerCase().startsWith(query) &&
        tag.toLowerCase().includes(query)
      );
      filtered = [...prefixMatches, ...includesMatches].slice(0, 8);
    }

    setSuggestions(filtered);
    setSelectedIndex(0);
  }, [text, cursorPosition, isVisible, getCurrentHashtag]);

  // Calculate position for dropdown
  useEffect(() => {
    if (!textareaRef?.current || suggestions.length === 0) return;

    const textarea = textareaRef.current;
    const textareaRect = textarea.getBoundingClientRect();

    // Create a hidden span to measure text position
    const span = document.createElement('span');
    span.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      font: ${getComputedStyle(textarea).font};
      padding: ${getComputedStyle(textarea).padding};
      width: ${textarea.clientWidth}px;
    `;
    span.textContent = text.slice(0, cursorPosition);
    document.body.appendChild(span);

    const spanRect = span.getBoundingClientRect();
    document.body.removeChild(span);

    // Position dropdown below the current line
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
    setPosition({
      top: Math.min(spanRect.height + lineHeight, textarea.clientHeight - 200),
      left: 0,
    });
  }, [suggestions, text, cursorPosition, textareaRef]);

  // Handle keyboard navigation
  useEffect(() => {
    if (suggestions.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onClose]);

  const handleSelect = (hashtag) => {
    const hashtagInfo = getCurrentHashtag();
    if (!hashtagInfo) return;

    const { startIndex, endIndex } = hashtagInfo;
    const newText = text.slice(0, startIndex) + '#' + hashtag + ' ' + text.slice(endIndex);
    const newCursorPosition = startIndex + hashtag.length + 2; // +2 for # and space

    onSelect(newText, newCursorPosition);
    setSuggestions([]);
  };

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 w-64 max-h-64 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="px-3 py-2 border-b border-border bg-bg-tertiary/50 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-text-muted">Popular Hashtags</span>
      </div>
      <div className="overflow-y-auto max-h-48">
        {suggestions.map((hashtag, index) => (
          <button
            key={hashtag}
            onClick={() => handleSelect(hashtag)}
            className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
              index === selectedIndex
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-bg-tertiary text-text-primary'
            }`}
          >
            <Hash className="w-4 h-4 text-text-muted flex-shrink-0" />
            <span className="font-medium">#{hashtag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HashtagAutocomplete;
