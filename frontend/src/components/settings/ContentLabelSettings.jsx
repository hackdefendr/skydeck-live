import { useState, useEffect } from 'react';
import {
  Tags,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  Skull,
  Heart,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../common/Toast';

const VISIBILITY_OPTIONS = [
  { value: 'ignore', label: 'Show', icon: Eye, description: 'Always show this content' },
  { value: 'warn', label: 'Warn', icon: AlertTriangle, description: 'Show with a warning' },
  { value: 'hide', label: 'Hide', icon: EyeOff, description: 'Hide this content completely' },
];

const CATEGORY_ICONS = {
  adult: Heart,
  violence: Skull,
  moderation: ShieldAlert,
};

const CATEGORY_NAMES = {
  adult: 'Adult Content',
  violence: 'Violence & Gore',
  moderation: 'Moderation Labels',
};

function ContentLabelSettings() {
  const [labels, setLabels] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [adultContentEnabled, setAdultContentEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingLabel, setSavingLabel] = useState(null);
  const [savingAdult, setSavingAdult] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/preferences');
      setLabels(response.data.labels || []);
      setPreferences(response.data.preferences || {});
      setAdultContentEnabled(response.data.adultContentEnabled || false);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      showErrorToast('Failed to load content preferences');
    }
    setIsLoading(false);
  };

  const handleVisibilityChange = async (label, visibility) => {
    setSavingLabel(label);
    try {
      await api.put(`/preferences/content-labels/prefs/${label}`, { visibility });
      setPreferences((prev) => ({ ...prev, [label]: visibility }));
      showSuccessToast('Preference updated');
    } catch (error) {
      console.error('Failed to update preference:', error);
      showErrorToast('Failed to update preference');
    }
    setSavingLabel(null);
  };

  const handleAdultContentToggle = async (enabled) => {
    setSavingAdult(true);
    try {
      await api.put('/preferences/adult-content', { enabled });
      setAdultContentEnabled(enabled);
      showSuccessToast(enabled ? 'Adult content enabled' : 'Adult content disabled');
    } catch (error) {
      console.error('Failed to update adult content setting:', error);
      showErrorToast('Failed to update setting');
    }
    setSavingAdult(false);
  };

  const getVisibility = (label) => {
    return preferences[label.label] || label.defaultVisibility || 'warn';
  };

  // Group labels by category
  const groupedLabels = labels.reduce((acc, label) => {
    const category = label.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(label);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adult Content Master Toggle */}
      <div className="p-4 bg-bg-tertiary rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-medium text-text-primary">Enable Adult Content</p>
              <p className="text-sm text-text-muted">
                Allow adult content to be shown (you must be 18+)
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={adultContentEnabled}
              onChange={(e) => handleAdultContentToggle(e.target.checked)}
              disabled={savingAdult}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-bg-secondary rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors">
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${adultContentEnabled ? 'translate-x-5' : ''}`} />
            </div>
          </label>
        </div>
        {!adultContentEnabled && (
          <p className="mt-3 text-xs text-text-muted bg-bg-secondary p-2 rounded">
            Adult content labels (NSFW, Nudity) will be hidden regardless of individual settings below.
          </p>
        )}
      </div>

      {/* Label Categories */}
      {Object.entries(groupedLabels).map(([category, categoryLabels]) => {
        const CategoryIcon = CATEGORY_ICONS[category] || Tags;
        const categoryName = CATEGORY_NAMES[category] || category;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <CategoryIcon className="w-4 h-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                {categoryName}
              </h3>
            </div>

            <div className="space-y-2">
              {categoryLabels.map((label) => {
                const currentVisibility = getVisibility(label);
                const isDisabled = label.adultOnly && !adultContentEnabled;
                const isSaving = savingLabel === label.label;

                return (
                  <div
                    key={label.id}
                    className={`p-4 bg-bg-tertiary rounded-lg transition-opacity ${
                      isDisabled ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary">{label.name}</p>
                        <p className="text-sm text-text-muted mt-1">{label.description}</p>
                        {isDisabled && (
                          <p className="text-xs text-yellow-500 mt-2">
                            Enable adult content above to configure this setting
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
                        {VISIBILITY_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = currentVisibility === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() => handleVisibilityChange(label.label, option.value)}
                              disabled={isDisabled || isSaving}
                              title={option.description}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                              } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                            >
                              {isSaving && isSelected ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Icon className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Tags className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-400">About Content Labels</p>
          <p className="text-text-secondary mt-1">
            Content labels are applied by Bluesky's moderation system and third-party labelers.
            Your preferences here control how labeled content appears in your timeline.
            Changes sync across all Bluesky clients.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContentLabelSettings;
