import { useState, useRef, useEffect } from 'react';
import { isValidHex } from '../../utils/theme';

function ColorPicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border border-border flex-shrink-0 relative overflow-hidden"
          style={{ backgroundColor: value }}
          aria-label={`Color picker for ${label}`}
        >
          {/* Checkerboard pattern for transparency preview */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px',
              zIndex: -1,
            }}
          />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 font-mono text-sm uppercase"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-bg-tertiary rounded-lg border border-border shadow-xl">
          <input
            type="color"
            value={value}
            onChange={handleColorChange}
            className="w-32 h-32 cursor-pointer border-0 rounded-lg"
          />

          {/* Quick colors */}
          <div className="flex gap-1 mt-2">
            {['#0085ff', '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color);
                    setInputValue(color);
                  }}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
