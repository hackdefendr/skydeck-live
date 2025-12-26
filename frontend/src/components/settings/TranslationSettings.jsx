import { useState, useEffect } from 'react';
import { Languages, Trash2 } from 'lucide-react';
import { useTranslationStore } from '../../stores/translationStore';
import Button from '../common/Button';
import { showSuccessToast } from '../common/Toast';

function TranslationSettings() {
  const {
    preferredLanguage,
    setPreferredLanguage,
    languages,
    fetchLanguages,
    clearCache,
  } = useTranslationStore();

  const [selectedLang, setSelectedLang] = useState(preferredLanguage);

  useEffect(() => {
    if (languages.length === 0) {
      fetchLanguages();
    }
  }, []);

  useEffect(() => {
    setSelectedLang(preferredLanguage);
  }, [preferredLanguage]);

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setPreferredLanguage(lang);
    showSuccessToast(`Translation language set to ${languages.find(l => l.code === lang)?.name || lang}`);
  };

  const handleClearCache = () => {
    clearCache();
    showSuccessToast('Translation cache cleared');
  };

  return (
    <div className="bg-bg-secondary rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Languages className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">Translation</h2>
      </div>

      <div className="space-y-6">
        {/* Preferred Language */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Translate posts to
          </label>
          <p className="text-xs text-text-muted mb-3">
            When you click "Translate" on a post, it will be translated to this language.
          </p>
          <select
            value={selectedLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg bg-bg-tertiary border border-border focus:border-primary focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cache Management */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            Translation Cache
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Translations are cached locally to improve performance. Clear the cache if you're experiencing issues.
          </p>
          <Button variant="ghost" onClick={handleClearCache} className="text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Translation Cache
          </Button>
        </div>

        {/* Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            Translations are powered by LibreTranslate, a free and open-source machine translation API.
            Translation quality may vary depending on the language pair.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TranslationSettings;
