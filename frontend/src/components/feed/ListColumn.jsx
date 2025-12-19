import { useFeed } from '../../hooks/useFeed';
import Post from '../posts/Post';
import Loading from '../common/Loading';

function ListColumn({ column }) {
  const { feed, isLoading, error, hasMore, loadMore } = useFeed(column.id);

  if (isLoading && feed.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {/* List info header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text-primary">{column.title}</h3>
        {column.listUri && (
          <p className="text-sm text-text-muted truncate">{column.listUri}</p>
        )}
      </div>

      {/* Feed items */}
      {feed.map((item, index) => (
        <Post key={item.post?.uri || index} item={item} />
      ))}

      {/* Load more indicator */}
      {isLoading && feed.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loading size="md" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && feed.length === 0 && (
        <div className="flex items-center justify-center py-8 text-text-muted">
          <p>No posts in this list</p>
        </div>
      )}
    </div>
  );
}

export default ListColumn;
