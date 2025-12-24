import { useState } from 'react';
import { Feather, X } from 'lucide-react';
import SlideOutComposer from './SlideOutComposer';

function FloatingComposeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Create post"
      >
        <Feather className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide-out Composer Panel */}
      <SlideOutComposer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default FloatingComposeButton;
