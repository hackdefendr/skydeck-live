import { useEffect } from 'react';
import Deck from '../components/layout/Deck';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useColumns } from '../hooks/useColumns';
import { useWebSocket } from '../hooks/useWebSocket';
import Loading from '../components/common/Loading';

function Home() {
  const { columns, isLoading } = useColumns();

  // Initialize WebSocket connection
  useWebSocket();

  if (isLoading && columns.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Deck columns={columns} />
        </main>
      </div>
    </div>
  );
}

export default Home;
