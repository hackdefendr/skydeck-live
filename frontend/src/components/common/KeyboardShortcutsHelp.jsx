import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { SHORTCUTS } from '../../hooks/useKeyboardShortcuts';
import Portal from './Portal';

// Group shortcuts by category
const groupShortcuts = () => {
  const groups = {};

  Object.entries(SHORTCUTS).forEach(([, shortcut]) => {
    const { category } = shortcut;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
  });

  return groups;
};

// Render a keyboard key
const Key = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-bg-tertiary border border-border rounded text-xs font-mono text-text-primary">
    {children}
  </kbd>
);

// Render shortcut key combination
const ShortcutKeys = ({ shortcut }) => {
  const keys = shortcut.key.split(' ');

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <span className="text-text-muted text-xs">then</span>}
          <Key>{key === 'ArrowUp' ? '↑' : key === 'ArrowDown' ? '↓' : key === 'ArrowLeft' ? '←' : key === 'ArrowRight' ? '→' : key}</Key>
        </span>
      ))}
      {shortcut.altKey && (
        <>
          <span className="text-text-muted text-xs mx-1">or</span>
          <Key>{shortcut.altKey === 'ArrowUp' ? '↑' : shortcut.altKey === 'ArrowDown' ? '↓' : shortcut.altKey === 'ArrowLeft' ? '←' : shortcut.altKey === 'ArrowRight' ? '→' : shortcut.altKey}</Key>
        </>
      )}
    </div>
  );
};

function KeyboardShortcutsHelp() {
  const { showHelp, setShowHelp } = useKeyboardStore();

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showHelp, setShowHelp]);

  if (!showHelp) return null;

  const groups = groupShortcuts();

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-bg-secondary rounded-2xl shadow-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="p-2 rounded-full hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groups).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-text-secondary">
                          {shortcut.description}
                        </span>
                        <ShortcutKeys shortcut={shortcut} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
              <h4 className="text-sm font-medium text-text-primary mb-2">Tips</h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>Shortcuts are disabled when typing in an input field</li>
                <li>Press <Key>?</Key> anytime to show/hide this help</li>
                <li>Use <Key>g</Key> followed by a key within 1.5 seconds for go-to shortcuts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default KeyboardShortcutsHelp;
