import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Layout, Bell, Shield, User, LogOut, List, Languages } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeCustomizer from '../components/theme/ThemeCustomizer';
import LayoutSettings from '../components/settings/LayoutSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import ModerationSettings from '../components/settings/ModerationSettings';
import ListsSettings from '../components/settings/ListsSettings';
import TranslationSettings from '../components/settings/TranslationSettings';
import Button from '../components/common/Button';

function Settings() {
  const [activeTab, setActiveTab] = useState('theme');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'theme', label: 'Appearance', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'lists', label: 'Lists', icon: List },
    { id: 'translation', label: 'Translation', icon: Languages },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-secondary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 -ml-2 rounded-full hover:bg-bg-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}

              <hr className="my-4 border-border" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'theme' && <ThemeCustomizer />}

            {activeTab === 'layout' && <LayoutSettings />}

            {activeTab === 'lists' && <ListsSettings />}

            {activeTab === 'translation' && <TranslationSettings />}

            {activeTab === 'notifications' && <NotificationSettings />}

            {activeTab === 'moderation' && <ModerationSettings />}

            {activeTab === 'account' && (
              <div className="bg-bg-secondary rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Account</h2>
                <div className="flex items-center gap-4 mb-6">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center">
                      <User className="w-8 h-8 text-text-muted" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{user?.displayName}</p>
                    <p className="text-text-secondary">@{user?.handle}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">
                  To edit your profile, visit{' '}
                  <a
                    href="https://bsky.app/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    bsky.app/settings
                  </a>
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Settings;
