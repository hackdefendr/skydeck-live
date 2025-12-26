import { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import Hls from 'hls.js';
import Modal from '../common/Modal';

// Check if URL is a GIF from known providers
function isGifUrl(url) {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();

  // Check for GIF file extension
  if (lowerUrl.includes('.gif')) return true;

  // Check for known GIF providers
  const gifProviders = [
    'giphy.com',
    'media.giphy.com',
    'i.giphy.com',
    'tenor.com',
    'media.tenor.com',
    'c.tenor.com',
    'imgur.com/a/',
  ];

  return gifProviders.some(provider => lowerUrl.includes(provider));
}

// Extract the best GIF URL from external embed
function getGifImageUrl(external) {
  const url = external.uri;

  if (url.includes('giphy.com') || url.includes('tenor.com')) {
    return url;
  }

  if (external.thumb && (
    external.thumb.includes('.gif') ||
    external.thumb.includes('.webp') ||
    external.thumb.includes('.png') ||
    external.thumb.includes('.jpg')
  )) {
    return external.thumb;
  }

  return url;
}

// Video Player Component with HLS support
function VideoPlayer({ playlist, thumbnail, aspectRatio }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup HLS instance on unmount
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const initializeVideo = () => {
    if (!videoRef.current || !playlist) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Destroy existing HLS instance if any
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(playlist);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(err => {
          console.error('Video play error:', err);
          setError('Failed to play video');
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error loading video');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error');
              hls.recoverMediaError();
              break;
            default:
              setError('Failed to load video');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = playlist;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(err => {
          console.error('Video play error:', err);
          setError('Failed to play video');
        });
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('Failed to load video');
      });
    } else {
      setError('HLS video not supported in this browser');
      setIsLoading(false);
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    // Small delay to ensure video element is rendered
    setTimeout(initializeVideo, 50);
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Calculate aspect ratio style
  const aspectStyle = aspectRatio
    ? { aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}` }
    : { aspectRatio: '16 / 9' };

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-black"
      style={aspectStyle}
    >
      {isPlaying ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain cursor-pointer"
            loop
            muted={isMuted}
            playsInline
            onClick={handleVideoClick}
            poster={thumbnail}
          />

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}

          {/* Mute/unmute button */}
          {!isLoading && !error && (
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </>
      ) : (
        <>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
              <Play className="w-12 h-12 text-text-muted" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors hover:scale-105"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
      <VideoPlayer
        playlist={embed.playlist}
        thumbnail={embed.thumbnail}
        aspectRatio={embed.aspectRatio}
      />
    );
  }

  // External link card (including GIFs)
  if (embed.$type === 'app.bsky.embed.external#view' || embed.external) {
    const external = embed.external;
    if (!external) return null;

    // Check if this is a GIF - render inline instead of as a link card
    if (isGifUrl(external.uri) || (external.title && external.title.toLowerCase().includes('gif'))) {
      const gifUrl = getGifImageUrl(external);

      return (
        <div className="relative rounded-xl overflow-hidden bg-bg-tertiary">
          <img
            src={gifUrl}
            alt={external.title || 'GIF'}
            className="w-full max-h-80 object-contain"
            loading="lazy"
          />
          {/* GIPHY/Source attribution */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <span className="text-xs text-white/80">
              {external.description || 'via GIPHY'}
            </span>
          </div>
        </div>
      );
    }

    // Regular external link card
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
