import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Plus, RefreshCw, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../stores/notificationStore';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import Logo from '../common/Logo';
import AboutPopup from '../common/AboutPopup';

function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="h-20 bg-bg-secondary border-b border-border flex items-center px-4 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Logo size={48} className="text-primary" />
        </div>
        <span className="font-bold hidden sm:block" style={{ fontSize: '32px', lineHeight: 1 }}>SkyDeck Live</span><sup>BETA</sup>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="About"
          onClick={() => setShowAbout(true)}
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

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

      {/* About Popup */}
      <AboutPopup isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </header>
  );
}

export default Header;
