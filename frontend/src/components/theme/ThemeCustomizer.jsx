import { useState, useEffect } from 'react';
import { Palette, Download, Upload, RotateCcw, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import ColorPicker from './ColorPicker';
import Button from '../common/Button';
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
