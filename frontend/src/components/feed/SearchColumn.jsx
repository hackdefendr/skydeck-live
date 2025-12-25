import { useState, useCallback, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import api from '../../services/api';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useKeyboardStore } from '../../stores/keyboardStore';
import Post from '../posts/Post';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';
import { debounce } from '../../utils/helpers';

function SearchColumn({ column }) {
  const [query, setQuery] = useState(column.searchQuery || '');
  const [results, setResults] = useState({ posts: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const queryRef = useRef(query);
  const containerRef = useRef(null);
  const { registerColumnRef, unregisterColumnRef } = useKeyboardStore();

  // Register scroll container ref for keyboard navigation
  useEffect(() => {
    registerColumnRef(column.id, containerRef);
    return () => unregisterColumnRef(column.id);
  }, [column.id, registerColumnRef, unregisterColumnRef]);

  // Keep queryRef in sync
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const performSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults({ posts: [], users: [] });
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get('/search', {
          params: { q: searchQuery },
        });
        setResults({
          posts: response.data.posts || [],
          users: response.data.users || [],
        });
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsLoading(false);
    }, 300),
    []
  );

  // Refresh function for auto-refresh (uses current query)
  const refreshSearch = useCallback(() => {
    if (queryRef.current.trim()) {
      performSearch(queryRef.current);
    }
  }, [performSearch]);

  // Auto-refresh based on column settings (default: 60 seconds) - only refreshes if there's a query
  useAutoRefresh(refreshSearch, column.refreshInterval ?? 60, !!query.trim());

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    performSearch(newQuery);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search input */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search posts and users"
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Users
        </button>
      </div>

      {/* Results */}
      <div ref={containerRef} className="column-content">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
          </div>
        )}

        {!isLoading && activeTab === 'posts' && (
          <>
            {results.posts.map((post, index) => (
              <Post key={post.uri || index} item={{ post }} />
            ))}
            {results.posts.length === 0 && query && (
              <div className="text-center py-8 text-text-muted">
                No posts found
              </div>
            )}
          </>
        )}

        {!isLoading && activeTab === 'users' && (
          <>
            {results.users.map((user, index) => (
              <div
                key={user.did || index}
                className="px-4 py-3 border-b border-border flex items-center gap-3 hover:bg-bg-tertiary/50 transition-colors"
              >
                <Avatar src={user.avatar} alt={user.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {user.displayName}
                  </p>
                  <p className="text-sm text-text-muted truncate">
                    @{user.handle}
                  </p>
                  {user.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                      {user.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {results.users.length === 0 && query && (
              <div className="text-center py-8 text-text-muted">
                No users found
              </div>
            )}
          </>
        )}

        {!query && !isLoading && (
          <div className="text-center py-8 text-text-muted">
            Enter a search query
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchColumn;
