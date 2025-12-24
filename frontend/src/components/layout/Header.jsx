import { Link } from 'react-router-dom';
import { Settings, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../stores/notificationStore';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import Logo from '../common/Logo';

function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="h-14 bg-bg-secondary border-b border-border flex items-center px-4 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Logo size={24} className="text-primary" />
        </div>
        <span className="font-bold text-lg hidden sm:block">SkyDeck</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>

        <Link to="/settings">
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        {/* User menu */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-bg-tertiary transition-colors">
              <Avatar
                src={user?.avatar}
                alt={user?.displayName}
                size="sm"
              />
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium text-text-primary">{user?.displayName}</p>
            <p className="text-sm text-text-secondary">@{user?.handle}</p>
          </div>
          <Dropdown.Item onClick={() => {}} icon={Settings}>
            <Link to="/settings" className="flex-1">Settings</Link>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={logout} danger>
            Sign out
          </Dropdown.Item>
        </Dropdown>
      </div>
    </header>
  );
}

export default Header;
