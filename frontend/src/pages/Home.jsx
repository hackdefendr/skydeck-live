import Deck from '../components/layout/Deck';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useColumns } from '../hooks/useColumns';
import { useWebSocket } from '../hooks/useWebSocket';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFeedStore } from '../stores/feedStore';
import Loading from '../components/common/Loading';
import KeyboardShortcutsHelp from '../components/common/KeyboardShortcutsHelp';

function Home() {
  const { columns, isLoading } = useColumns();
  const { refreshFeed } = useFeedStore();

  // Initialize WebSocket connection
  useWebSocket();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onRefreshColumn: (index) => {
      const column = columns[index];
      if (column) {
        refreshFeed(column.id);
      }
    },
  });

  if (isLoading && columns.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="deck-layout flex flex-col bg-bg-primary">
      <Header />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <Deck columns={columns} />
        </main>
      </div>
      <KeyboardShortcutsHelp />
    </div>
  );
}

export default Home;
