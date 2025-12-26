import { X, Github, ExternalLink, Heart } from 'lucide-react';
import Portal from './Portal';
import Logo from './Logo';
import Button from './Button';

const APP_VERSION = '1.0.0-beta';
const BUILD_DATE = '2025';

function AboutPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] max-w-[90vw] bg-bg-secondary rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center shadow-lg">
              <Logo size={48} className="text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text-primary">SkyDeck Live</h1>
          <p className="text-sm text-text-muted mt-1">Version {APP_VERSION}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-text-secondary text-center">
            A feature-complete Bluesky web client with a multi-column deck interface.
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-bg-tertiary rounded-lg p-3">
              <p className="text-text-muted">Version</p>
              <p className="font-medium text-text-primary">{APP_VERSION}</p>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-3">
              <p className="text-text-muted">Year</p>
              <p className="font-medium text-text-primary">{BUILD_DATE}</p>
            </div>
          </div>

          {/* Credits */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-text-muted text-center">
              Built with <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> using React, Vite, and the AT Protocol
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('https://bsky.app', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Bluesky
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('https://docs.bsky.app', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              AT Protocol
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-tertiary text-center">
          <p className="text-xs text-text-muted">
            SkyDeck is not affiliated with Bluesky PBC.
          </p>
        </div>
      </div>
    </Portal>
  );
}

export default AboutPopup;
