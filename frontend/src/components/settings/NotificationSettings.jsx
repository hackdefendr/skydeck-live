import { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  Repeat2,
  UserPlus,
  AtSign,
  MessageSquare,
  Quote,
  Volume2,
  VolumeX,
  Monitor,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { useNotificationPrefsStore } from '../../stores/notificationPrefsStore';
import Button from '../common/Button';
import { showSuccessToast } from '../common/Toast';

const NOTIFICATION_TYPES = [
  { key: 'Likes', icon: Heart, color: 'text-red-400', showKey: 'showLikes', desktopKey: 'desktopForLikes' },
  { key: 'Reposts', icon: Repeat2, color: 'text-green-400', showKey: 'showReposts', desktopKey: 'desktopForReposts' },
  { key: 'Follows', icon: UserPlus, color: 'text-blue-400', showKey: 'showFollows', desktopKey: 'desktopForFollows' },
  { key: 'Mentions', icon: AtSign, color: 'text-purple-400', showKey: 'showMentions', desktopKey: 'desktopForMentions' },
  { key: 'Replies', icon: MessageSquare, color: 'text-cyan-400', showKey: 'showReplies', desktopKey: 'desktopForReplies' },
  { key: 'Quotes', icon: Quote, color: 'text-orange-400', showKey: 'showQuotes', desktopKey: 'desktopForQuotes' },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  );
}

function NotificationSettings() {
  const {
    prefs,
    updatePref,
    resetPrefs,
    requestNotificationPermission,
    getNotificationPermission,
  } = useNotificationPrefsStore();

  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
  }, [getNotificationPermission]);

  const handleEnableDesktopNotifications = async () => {
    const result = await requestNotificationPermission();
    if (result.granted) {
      updatePref('desktopNotifications', true);
      setPermissionStatus('granted');
      showSuccessToast('Desktop notifications enabled');
    } else {
      setPermissionStatus(getNotificationPermission());
    }
  };

  const handleReset = () => {
    if (confirm('Reset all notification settings to defaults?')) {
      resetPrefs();
      showSuccessToast('Settings reset to defaults');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Notification Settings</h2>
          </div>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Notification Type Filters */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Notification Types
          </h3>
          <p className="text-sm text-text-muted mb-4">
            Choose which notification types appear in your notification feed.
          </p>
          <div className="space-y-3">
            {NOTIFICATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.key}
                  className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <span className="text-text-primary">{type.key}</span>
                  </div>
                  <Toggle
                    checked={prefs[type.showKey]}
                    onChange={(v) => updatePref(type.showKey, v)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Notifications */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Desktop Notifications
          </h3>

          {permissionStatus === 'unsupported' ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-text-secondary">
                Your browser does not support desktop notifications.
              </p>
            </div>
          ) : permissionStatus === 'denied' ? (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-text-primary font-medium">Notifications Blocked</p>
                <p className="text-text-secondary mt-1">
                  Desktop notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-text-primary font-medium">Enable Desktop Notifications</p>
                    <p className="text-sm text-text-muted">
                      Get notified when you're not looking at the app
                    </p>
                  </div>
                </div>
                {permissionStatus === 'granted' ? (
                  <Toggle
                    checked={prefs.desktopNotifications}
                    onChange={(v) => updatePref('desktopNotifications', v)}
                  />
                ) : (
                  <Button variant="primary" onClick={handleEnableDesktopNotifications}>
                    Enable
                  </Button>
                )}
              </div>

              {prefs.desktopNotifications && permissionStatus === 'granted' && (
                <div className="pl-4 border-l-2 border-border space-y-3">
                  <p className="text-sm text-text-muted mb-3">
                    Choose which notification types trigger desktop notifications:
                  </p>
                  {NOTIFICATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.key}
                        className="flex items-center justify-between p-2"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${type.color}`} />
                          <span className="text-sm text-text-primary">{type.key}</span>
                        </div>
                        <Toggle
                          checked={prefs[type.desktopKey]}
                          onChange={(v) => updatePref(type.desktopKey, v)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sound Settings */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Sound
          </h3>
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
            <div className="flex items-center gap-3">
              {prefs.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-text-secondary" />
              ) : (
                <VolumeX className="w-5 h-5 text-text-muted" />
              )}
              <div>
                <p className="text-text-primary font-medium">Notification Sounds</p>
                <p className="text-sm text-text-muted">
                  Play a sound for new notifications
                </p>
              </div>
            </div>
            <Toggle
              checked={prefs.soundEnabled}
              onChange={(v) => updatePref('soundEnabled', v)}
            />
          </div>

          {prefs.soundEnabled && (
            <div className="mt-3 px-4">
              <label className="block text-sm text-text-secondary mb-2">
                Volume: {prefs.soundVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={prefs.soundVolume}
                onChange={(e) => updatePref('soundVolume', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Display Settings */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Display
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
              <div>
                <p className="text-text-primary font-medium">Group Similar Notifications</p>
                <p className="text-sm text-text-muted">
                  Combine multiple likes or reposts on the same post
                </p>
              </div>
              <Toggle
                checked={prefs.groupSimilar}
                onChange={(v) => updatePref('groupSimilar', v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
              <div>
                <p className="text-text-primary font-medium">Show Avatars</p>
                <p className="text-sm text-text-muted">
                  Display user avatars in notification list
                </p>
              </div>
              <Toggle
                checked={prefs.showAvatars}
                onChange={(v) => updatePref('showAvatars', v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
              <div>
                <p className="text-text-primary font-medium">Compact Mode</p>
                <p className="text-sm text-text-muted">
                  Use a more condensed notification layout
                </p>
              </div>
              <Toggle
                checked={prefs.compactMode}
                onChange={(v) => updatePref('compactMode', v)}
              />
            </div>
          </div>
        </div>

        {/* Auto-refresh Settings */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Auto-Refresh
          </h3>
          <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-text-primary font-medium">Auto-refresh Notifications</p>
                <p className="text-sm text-text-muted">
                  Automatically check for new notifications
                </p>
              </div>
            </div>
            <Toggle
              checked={prefs.autoRefresh}
              onChange={(v) => updatePref('autoRefresh', v)}
            />
          </div>

          {prefs.autoRefresh && (
            <div className="mt-3 px-4">
              <label className="block text-sm text-text-secondary mb-2">
                Refresh Interval
              </label>
              <select
                value={prefs.refreshInterval}
                onChange={(e) => updatePref('refreshInterval', parseInt(e.target.value))}
                className="w-full max-w-xs"
              >
                <option value={15}>Every 15 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every minute</option>
                <option value={120}>Every 2 minutes</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
