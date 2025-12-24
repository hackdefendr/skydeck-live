import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal';

function MediaPreview({ embed }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!embed) return null;

  // Images
  if (embed.$type === 'app.bsky.embed.images#view' || embed.images) {
    const images = embed.images || [];

    return (
      <>
        <div className={`image-grid count-${Math.min(images.length, 4)}`}>
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className="relative aspect-video overflow-hidden bg-bg-tertiary"
            >
              <img
                src={image.thumb || image.fullsize}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          size="xl"
        >
          {selectedImage && (
            <div className="p-4">
              <img
                src={selectedImage.fullsize || selectedImage.thumb}
                alt={selectedImage.alt || 'Full size image'}
                className="max-w-full max-h-[80vh] mx-auto rounded-lg"
              />
              {selectedImage.alt && (
                <p className="text-text-secondary text-sm mt-4 text-center">
                  {selectedImage.alt}
                </p>
              )}
            </div>
          )}
        </Modal>
      </>
    );
  }

  // Video
  if (embed.$type === 'app.bsky.embed.video#view' || embed.playlist) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-bg-tertiary aspect-video">
        {embed.thumbnail ? (
          <img
            src={embed.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-text-muted" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // External link card
  if (embed.$type === 'app.bsky.embed.external#view' || embed.external) {
    const external = embed.external;
    if (!external) return null;

    return (
      <a
        href={external.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-border overflow-hidden hover:bg-bg-tertiary transition-colors"
      >
        {external.thumb && (
          <div className="aspect-video overflow-hidden">
            <img
              src={external.thumb}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-1 text-text-muted text-sm mb-1">
            <ExternalLink className="w-3 h-3" />
            {new URL(external.uri).hostname}
          </div>
          <p className="font-medium text-text-primary line-clamp-2">
            {external.title}
          </p>
          {external.description && (
            <p className="text-text-secondary text-sm line-clamp-2 mt-1">
              {external.description}
            </p>
          )}
        </div>
      </a>
    );
  }

  // Quote post
  if (embed.$type === 'app.bsky.embed.record#view' || embed.record) {
    const record = embed.record;
    if (!record || record.$type === 'app.bsky.embed.record#viewNotFound') {
      return (
        <div className="rounded-xl border border-border p-4 text-text-muted">
          Post not found
        </div>
      );
    }

    if (record.$type === 'app.bsky.embed.record#viewBlocked') {
      return (
        <div className="rounded-xl border border-border p-4 text-text-muted">
          Post is blocked
        </div>
      );
    }

    const author = record.author;
    const value = record.value;

    if (!author || !value) return null;

    return (
      <div className="rounded-xl border border-border p-3 hover:bg-bg-tertiary transition-colors">
        <div className="flex items-start gap-2 mb-2">
          {author.avatar && (
            <img
              src={author.avatar}
              alt=""
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {author.displayName || author.handle}
            </div>
            <div className="text-text-muted text-xs truncate">@{author.handle}</div>
          </div>
        </div>
        {value.text && (
          <p className="text-text-primary text-sm whitespace-pre-wrap break-words">
            {value.text}
          </p>
        )}
        {/* Show embedded media in quoted post */}
        {record.embeds && record.embeds.length > 0 && (
          <div className="mt-2">
            <MediaPreview embed={record.embeds[0]} />
          </div>
        )}
      </div>
    );
  }

  // Record with media (quote + images)
  if (embed.$type === 'app.bsky.embed.recordWithMedia#view') {
    return (
      <div className="space-y-3">
        {embed.media && <MediaPreview embed={embed.media} />}
        {embed.record && <MediaPreview embed={embed.record} />}
      </div>
    );
  }

  return null;
}

export default MediaPreview;
