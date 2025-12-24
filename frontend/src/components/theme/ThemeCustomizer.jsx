import { useState, useEffect, useMemo } from 'react';
import { Palette, Download, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import ColorPicker from './ColorPicker';
import Button from '../common/Button';
import Logo from '../common/Logo';
import { LOGO_VARIANTS, LOGO_LABELS } from '../common/logos';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function ThemeCustomizer() {
  const {
    theme,
    presets,
    updateTheme,
    save,
    reset,
    fetchPresets,
    applyPreset,
    exportTheme,
    importTheme,
  } = useTheme();

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleColorChange = (key, value) => {
    updateTheme({ [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    const result = await save();
    if (result.success) {
      showSuccessToast('Theme saved!');
      setHasChanges(false);
    } else {
      showErrorToast('Failed to save theme');
    }
  };

  const handleReset = async () => {
    if (confirm('Reset to default theme?')) {
      const result = await reset();
      if (result.success) {
        showSuccessToast('Theme reset!');
        setHasChanges(false);
      }
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const result = await importTheme(file);
        if (result.success) {
          showSuccessToast('Theme imported!');
          setHasChanges(true);
        } else {
          showErrorToast(result.error || 'Failed to import theme');
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Theme Customization</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="ghost" onClick={exportTheme}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Theme name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Theme Name
          </label>
          <input
            type="text"
            value={theme.name}
            onChange={(e) => {
              updateTheme({ name: e.target.value });
              setHasChanges(true);
            }}
            className="w-full max-w-xs"
          />
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  applyPreset(preset);
                  setHasChanges(true);
                }}
                className="px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors flex items-center gap-2"
                style={{ backgroundColor: preset.bgSecondary }}
              >
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: preset.primaryColor }}
                />
                <span style={{ color: preset.textPrimary }}>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Colors</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ColorPicker
            label="Primary Color"
            value={theme.primaryColor}
            onChange={(v) => handleColorChange('primaryColor', v)}
          />
          <ColorPicker
            label="Secondary Color"
            value={theme.secondaryColor}
            onChange={(v) => handleColorChange('secondaryColor', v)}
          />
          <ColorPicker
            label="Accent Color"
            value={theme.accentColor}
            onChange={(v) => handleColorChange('accentColor', v)}
          />
          <ColorPicker
            label="Background Primary"
            value={theme.bgPrimary}
            onChange={(v) => handleColorChange('bgPrimary', v)}
          />
          <ColorPicker
            label="Background Secondary"
            value={theme.bgSecondary}
            onChange={(v) => handleColorChange('bgSecondary', v)}
          />
          <ColorPicker
            label="Background Tertiary"
            value={theme.bgTertiary}
            onChange={(v) => handleColorChange('bgTertiary', v)}
          />
          <ColorPicker
            label="Text Primary"
            value={theme.textPrimary}
            onChange={(v) => handleColorChange('textPrimary', v)}
          />
          <ColorPicker
            label="Text Secondary"
            value={theme.textSecondary}
            onChange={(v) => handleColorChange('textSecondary', v)}
          />
          <ColorPicker
            label="Text Muted"
            value={theme.textMuted}
            onChange={(v) => handleColorChange('textMuted', v)}
          />
          <ColorPicker
            label="Border Color"
            value={theme.borderColor}
            onChange={(v) => handleColorChange('borderColor', v)}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Typography</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Font Family
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => {
                updateTheme({ fontFamily: e.target.value });
                setHasChanges(true);
              }}
              className="w-full"
            >
              <option value="system-ui">System UI</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="SF Pro">SF Pro</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Font Size
            </label>
            <select
              value={theme.fontSize}
              onChange={(e) => {
                updateTheme({ fontSize: e.target.value });
                setHasChanges(true);
              }}
              className="w-full"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Layout</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Column Width: {theme.columnWidth}px
            </label>
            <input
              type="range"
              min="280"
              max="500"
              value={theme.columnWidth}
              onChange={(e) => {
                updateTheme({ columnWidth: parseInt(e.target.value) });
                setHasChanges(true);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Column Gap: {theme.columnGap}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={theme.columnGap}
              onChange={(e) => {
                updateTheme({ columnGap: parseInt(e.target.value) });
                setHasChanges(true);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.compactMode}
              onChange={(e) => {
                updateTheme({ compactMode: e.target.checked });
                setHasChanges(true);
              }}
              className="w-4 h-4 rounded border-border bg-bg-tertiary"
            />
            <span className="text-text-primary">Compact Mode</span>
          </label>
        </div>
      </div>

      {/* Logo Variant */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Logo Style</h3>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Choose a logo style. "Auto" automatically changes based on the current season or holiday.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Auto option */}
          <button
            onClick={() => {
              updateTheme({ logoVariant: 'auto' });
              localStorage.setItem('logoVariant', 'auto');
              setHasChanges(true);
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
              theme.logoVariant === 'auto' || !theme.logoVariant
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-text-muted'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium">Auto</span>
          </button>

          {/* Logo variants */}
          {Object.entries(LOGO_VARIANTS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                updateTheme({ logoVariant: value });
                localStorage.setItem('logoVariant', value);
                setHasChanges(true);
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                theme.logoVariant === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-text-muted'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-primary">
                <Logo size={28} variant={value} />
              </div>
              <span className="text-xs font-medium">{LOGO_LABELS[value]}</span>
            </button>
          ))}
        </div>

        {/* Current preview */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-text-secondary text-sm mb-3">Current Logo Preview:</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Logo size={32} variant={theme.logoVariant || 'auto'} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">SkyDeck</p>
              <p className="text-text-muted text-sm">
                {theme.logoVariant === 'auto' || !theme.logoVariant
                  ? `Auto-detected: ${LOGO_LABELS[Logo.detectVariant()] || 'Default'}`
                  : LOGO_LABELS[theme.logoVariant] || 'Default'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div className="bg-bg-secondary rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Custom CSS</h3>
        <textarea
          value={theme.customCss || ''}
          onChange={(e) => {
            updateTheme({ customCss: e.target.value });
            setHasChanges(true);
          }}
          placeholder="/* Add your custom CSS here */"
          className="w-full h-40 font-mono text-sm"
        />
      </div>
    </div>
  );
}

export default ThemeCustomizer;
