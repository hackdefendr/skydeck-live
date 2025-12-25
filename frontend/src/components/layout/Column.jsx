import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColumnHeader from './ColumnHeader';
import FeedColumn from '../feed/FeedColumn';
import NotificationColumn from '../feed/NotificationColumn';
import SearchColumn from '../feed/SearchColumn';
import MessagesColumn from '../feed/MessagesColumn';
import ProfileColumn from '../feed/ProfileColumn';
import HashtagColumn from '../feed/HashtagColumn';
import BookmarksColumn from '../feed/BookmarksColumn';
import { COLUMN_TYPES } from '../../utils/constants';

function Column({ column }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderContent = () => {
    switch (column.type) {
      case COLUMN_TYPES.HOME:
      case COLUMN_TYPES.FEED:
      case COLUMN_TYPES.LIST:
      case COLUMN_TYPES.LIKES:
      case COLUMN_TYPES.MENTIONS:
        return <FeedColumn column={column} />;

      case COLUMN_TYPES.NOTIFICATIONS:
        return <NotificationColumn column={column} />;

      case COLUMN_TYPES.SEARCH:
        return <SearchColumn column={column} />;

      case COLUMN_TYPES.MESSAGES:
        return <MessagesColumn column={column} />;

      case COLUMN_TYPES.PROFILE:
        return <ProfileColumn column={column} />;

      case COLUMN_TYPES.HASHTAG:
        return <HashtagColumn column={column} />;

      case COLUMN_TYPES.BOOKMARKS:
        return <BookmarksColumn column={column} />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            Unknown column type
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="column flex-shrink-0"
    >
      <ColumnHeader
        column={column}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {renderContent()}
    </div>
  );
}

export default Column;
