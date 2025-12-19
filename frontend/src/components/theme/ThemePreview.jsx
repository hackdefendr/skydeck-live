function ThemePreview({ theme }) {
  const previewStyles = {
    '--preview-primary': theme.primaryColor,
    '--preview-secondary': theme.secondaryColor,
    '--preview-accent': theme.accentColor,
    '--preview-bg-primary': theme.bgPrimary,
    '--preview-bg-secondary': theme.bgSecondary,
    '--preview-bg-tertiary': theme.bgTertiary,
    '--preview-text-primary': theme.textPrimary,
    '--preview-text-secondary': theme.textSecondary,
    '--preview-text-muted': theme.textMuted,
    '--preview-border': theme.borderColor,
  };

  return (
    <div
      className="rounded-xl overflow-hidden border border-border"
      style={previewStyles}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{
          backgroundColor: 'var(--preview-bg-secondary)',
          borderColor: 'var(--preview-border)',
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--preview-primary)' }}
        >
          <span style={{ color: '#fff', fontSize: '12px' }}>S</span>
        </div>
        <span
          className="font-semibold"
          style={{ color: 'var(--preview-text-primary)' }}
        >
          SkyDeck Preview
        </span>
      </div>

      {/* Content */}
      <div
        className="p-4 space-y-4"
        style={{ backgroundColor: 'var(--preview-bg-primary)' }}
      >
        {/* Mock post */}
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: 'var(--preview-bg-secondary)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: 'var(--preview-bg-tertiary)' }}
            />
            <div>
              <span
                className="font-medium text-sm"
                style={{ color: 'var(--preview-text-primary)' }}
              >
                User Name
              </span>
              <span
                className="text-sm ml-2"
                style={{ color: 'var(--preview-text-muted)' }}
              >
                @handle
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--preview-text-primary)', fontSize: '14px' }}>
            This is a preview of how your theme will look. Customize the colors
            to match your style!
          </p>
          <div className="flex gap-4 mt-3">
            <span style={{ color: 'var(--preview-text-muted)', fontSize: '12px' }}>
              42 likes
            </span>
            <span style={{ color: 'var(--preview-text-muted)', fontSize: '12px' }}>
              12 replies
            </span>
          </div>
        </div>

        {/* Mock buttons */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'var(--preview-primary)',
              color: '#fff',
            }}
          >
            Primary
          </button>
          <button
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'var(--preview-bg-tertiary)',
              color: 'var(--preview-text-primary)',
            }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemePreview;
