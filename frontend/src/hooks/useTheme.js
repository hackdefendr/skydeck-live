import { useCallback } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const {
    theme,
    presets,
    isLoading,
    setTheme,
    saveTheme,
    resetTheme,
    fetchPresets,
    applyPreset,
    exportTheme,
    importTheme,
  } = useThemeStore();

  const updateTheme = useCallback((updates) => {
    setTheme(updates);
  }, [setTheme]);

  const save = useCallback(async () => {
    return saveTheme();
  }, [saveTheme]);

  const reset = useCallback(async () => {
    return resetTheme();
  }, [resetTheme]);

  const applyThemePreset = useCallback((preset) => {
    applyPreset(preset);
  }, [applyPreset]);

  const exportCurrentTheme = useCallback(() => {
    const themeData = exportTheme();
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skydeck-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportTheme, theme.name]);

  const importFromFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const themeData = JSON.parse(e.target.result);
          const result = await importTheme(themeData);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid theme file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [importTheme]);

  return {
    theme,
    presets,
    isLoading,
    updateTheme,
    save,
    reset,
    fetchPresets,
    applyPreset: applyThemePreset,
    exportTheme: exportCurrentTheme,
    importTheme: importFromFile,
  };
}

export default useTheme;
