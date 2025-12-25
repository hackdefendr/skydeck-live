import { useState, useEffect, useCallback } from 'react';
import { X, Search, TrendingUp } from 'lucide-react';
import { giphyService } from '../../services/giphy';
import Loading from '../common/Loading';
import Portal from '../common/Portal';

function GifPicker({ isOpen, onClose, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('trending'); // 'trending' or 'search'

  // Load trending GIFs on open
  useEffect(() => {
    if (isOpen && mode === 'trending') {
      loadTrending();
    }
  }, [isOpen, mode]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMode('trending');
      return;
    }

    setMode('search');
    const timer = setTimeout(() => {
      searchGifs(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTrending = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await giphyService.trending({ limit: 30 });
      setGifs(data.gifs);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load GIFs');
    }
    setIsLoading(false);
  };

  const searchGifs = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await giphyService.search(query, { limit: 30 });
      setGifs(data.gifs);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search GIFs');
    }
    setIsLoading(false);
  };

  const handleSelect = (gif) => {
    onSelect({
      url: gif.images.original.url,
      width: parseInt(gif.images.original.width, 10),
      height: parseInt(gif.images.original.height, 10),
      title: gif.title,
      preview: gif.images.fixed_width.url,
    });
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setGifs([]);
    setMode('trending');
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:h-[600px] z-[60] bg-bg-secondary rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold">Choose a GIF</h2>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GIPHY..."
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary rounded-lg border-0 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Mode indicator */}
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-text-muted">
          <TrendingUp className="w-4 h-4" />
          <span>{mode === 'trending' ? 'Trending' : `Results for "${searchQuery}"`}</span>
        </div>

        {/* GIF grid */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && gifs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loading />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <p>{error}</p>
              <button
                onClick={mode === 'trending' ? loadTrending : () => searchGifs(searchQuery)}
                className="mt-2 text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              <p>No GIFs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  className="relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all bg-bg-tertiary"
                  style={{
                    paddingBottom: `${(parseInt(gif.images.fixed_width.height, 10) / parseInt(gif.images.fixed_width.width, 10)) * 100}%`,
                  }}
                >
                  <img
                    src={gif.images.fixed_width.url}
                    alt={gif.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GIPHY attribution */}
        <div className="px-4 py-2 border-t border-border text-center">
          <span className="text-xs text-text-muted">Powered by GIPHY</span>
        </div>
      </div>
    </Portal>
  );
}

export default GifPicker;
