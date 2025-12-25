import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image, Film, Sparkles, Globe, ChevronDown, Play, FileText, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MAX_POST_LENGTH } from '../../utils/constants';
import { useDraftStore } from '../../stores/draftStore';
import postsService from '../../services/posts';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Portal from '../common/Portal';
import Dropdown from '../common/Dropdown';
import { showSuccessToast, showErrorToast } from '../common/Toast';
import GifPicker from './GifPicker';
import HashtagAutocomplete from './HashtagAutocomplete';
import DraftsManager from './DraftsManager';

function SlideOutComposer({ isOpen, onClose, replyTo = null, quotePost = null }) {
  const { user } = useAuth();
  const { saveDraft, schedulePost, counts, fetchCounts } = useDraftStore();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [gif, setGif] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showDraftsManager, setShowDraftsManager] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showHashtagAutocomplete, setShowHashtagAutocomplete] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch draft counts on mount
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_POST_LENGTH;
  const hasContent = text.trim().length > 0 || images.length > 0 || video || gif || quotePost;
  const canPost = hasContent && !isOverLimit && !isPosting;

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle text change with hashtag detection
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    const newCursorPos = e.target.selectionStart;

    setText(newText);
    setCursorPosition(newCursorPos);

    // Check if we're typing a hashtag
    const textBeforeCursor = newText.slice(0, newCursorPos);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    if (lastHashIndex !== -1) {
      const textAfterHash = textBeforeCursor.slice(lastHashIndex + 1);
      // Show autocomplete if typing after # and no space yet
      if (!textAfterHash.includes(' ') && !textAfterHash.includes('\n')) {
        // Make sure # is at start or after space/newline
        if (lastHashIndex === 0 || ' \n'.includes(textBeforeCursor[lastHashIndex - 1])) {
          setShowHashtagAutocomplete(true);
          return;
        }
      }
    }
    setShowHashtagAutocomplete(false);
  }, []);

  // Handle cursor position updates
  const handleCursorChange = useCallback((e) => {
    setCursorPosition(e.target.selectionStart);
  }, []);

  // Handle hashtag selection from autocomplete
  const handleHashtagSelect = useCallback((newText, newCursorPosition) => {
    setText(newText);
    setCursorPosition(newCursorPosition);
    setShowHashtagAutocomplete(false);

    // Set cursor position in textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, []);

  // Handle paste event for images and videos
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      // Handle image paste
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        // Check if we already have a video or GIF
        if (video || gif) {
          showErrorToast('Remove existing media to paste an image');
          return;
        }

        // Check image count limit
        if (images.length >= 4) {
          showErrorToast('Maximum 4 images allowed');
          return;
        }

        // Validate image size (1MB max)
        if (file.size > 1024 * 1024) {
          showErrorToast('Image too large. Maximum size is 1MB.');
          return;
        }

        const newImage = {
          file,
          preview: URL.createObjectURL(file),
          alt: '',
        };
        setImages([...images, newImage]);
        return;
      }

      // Handle video paste
      if (item.type.startsWith('video/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        // Check if we already have images or GIF
        if (images.length > 0 || gif) {
          showErrorToast('Remove existing media to paste a video');
          return;
        }

        // Check if we already have a video
        if (video) {
          showErrorToast('Only one video allowed per post');
          return;
        }

        // Validate video type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
          showErrorToast('Invalid video type. Use MP4, WebM, or MOV.');
          return;
        }

        // Validate video size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          showErrorToast('Video too large. Maximum size is 50MB.');
          return;
        }

        setVideo({
          file,
          preview: URL.createObjectURL(file),
          alt: '',
        });
        return;
      }
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!canPost) return;

    setIsPosting(true);
    setUploadProgress(0);

    try {
      let embed = null;

      // Upload video if present (takes priority)
      if (video) {
        const formData = new FormData();
        formData.append('file', video.file);
        formData.append('alt', video.alt || '');

        const uploadResponse = await api.post('/media/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        embed = uploadResponse.data.embed;
      }
      // Use GIF as external embed
      else if (gif) {
        embed = {
          $type: 'app.bsky.embed.external',
          external: {
            uri: gif.url,
            title: gif.title || 'GIF',
            description: 'via GIPHY',
          },
        };
      }
      // Upload images if any
      else if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img, index) => {
          formData.append('files', img.file);
          formData.append(`alt${index}`, img.alt || '');
        });

        const uploadResponse = await api.post('/media/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        embed = uploadResponse.data.embed;
      }

      // Handle quote post embed
      if (quotePost && !embed) {
        embed = {
          $type: 'app.bsky.embed.record',
          record: {
            uri: quotePost.uri,
            cid: quotePost.cid,
          },
        };
      } else if (quotePost && embed) {
        // Combine quote with media using recordWithMedia
        embed = {
          $type: 'app.bsky.embed.recordWithMedia',
          record: {
            record: {
              uri: quotePost.uri,
              cid: quotePost.cid,
            },
          },
          media: embed,
        };
      }

      await postsService.createPost({
        text,
        replyTo,
        embed,
      });

      setText('');
      setImages([]);
      setVideo(null);
      setGif(null);
      setUploadProgress(0);
      setCursorPosition(0);
      setShowHashtagAutocomplete(false);
      showSuccessToast('Post created!');
      onClose();
    } catch (error) {
      showErrorToast(error.response?.data?.error || 'Failed to create post');
    }

    setIsPosting(false);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Clear video and GIF if adding images
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
    setGif(null);

    const remainingSlots = 4 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
    }));

    setImages([...images, ...newImages]);
    e.target.value = '';
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate video type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('Invalid video type. Use MP4, WebM, or MOV.');
      return;
    }

    // Validate video size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showErrorToast('Video too large. Maximum size is 50MB.');
      return;
    }

    // Clear images and GIF if adding video
    if (images.length > 0) {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    }
    setGif(null);

    setVideo({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
    });
    e.target.value = '';
  };

  const handleGifSelect = (selectedGif) => {
    // Clear images and video if adding GIF
    if (images.length > 0) {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    }
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
    setGif(selectedGif);
  };

  const removeGif = () => {
    setGif(null);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };

  const updateImageAlt = (index, alt) => {
    const newImages = [...images];
    newImages[index].alt = alt;
    setImages(newImages);
  };

  const updateVideoAlt = (alt) => {
    if (video) {
      setVideo({ ...video, alt });
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!text.trim() && images.length === 0 && !video && !gif) {
      showErrorToast('Nothing to save');
      return;
    }

    const result = await saveDraft({
      text,
      replyTo,
      quotePost,
      mediaIds: [], // TODO: Handle media in drafts
    });

    if (result.success) {
      showSuccessToast('Draft saved');
      resetForm();
      onClose();
    } else {
      showErrorToast('Failed to save draft');
    }
  };

  // Schedule post
  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      showErrorToast('Please select date and time');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledAt <= new Date()) {
      showErrorToast('Scheduled time must be in the future');
      return;
    }

    const result = await schedulePost({
      text,
      replyTo,
      quotePost,
      mediaIds: [],
      scheduledAt: scheduledAt.toISOString(),
    });

    if (result.success) {
      showSuccessToast('Post scheduled');
      resetForm();
      setShowScheduler(false);
      onClose();
    } else {
      showErrorToast(result.error || 'Failed to schedule post');
    }
  };

  // Load draft for editing
  const handleEditDraft = (draft) => {
    setText(draft.text || '');
    setEditingDraftId(draft.id);
    // Note: media handling for drafts would need additional work
  };

  // Reset form
  const resetForm = () => {
    setText('');
    setImages([]);
    setVideo(null);
    setGif(null);
    setUploadProgress(0);
    setCursorPosition(0);
    setShowHashtagAutocomplete(false);
    setScheduledDate('');
    setScheduledTime('');
    setEditingDraftId(null);
  };

  // Reset state when closing
  const handleClose = () => {
    if (text.trim() || images.length > 0 || video || gif) {
      if (!confirm('Discard this post?')) return;
    }
    resetForm();
    onClose();
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-lg bg-bg-secondary shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2 -ml-2 rounded-full hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Drafts button */}
            <button
              onClick={() => setShowDraftsManager(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-tertiary hover:bg-border transition-colors text-sm text-text-secondary"
            >
              <FileText className="w-4 h-4" />
              {(counts.drafts + counts.scheduled) > 0 && (
                <span className="text-primary font-medium">
                  {counts.drafts + counts.scheduled}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Schedule dropdown */}
            <Dropdown
              align="right"
              trigger={
                <Button variant="ghost" size="sm" title="Schedule">
                  <Clock className="w-4 h-4" />
                </Button>
              }
            >
              <div className="p-3 w-64">
                <p className="text-sm font-medium text-text-primary mb-3">Schedule Post</p>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-text-primary text-sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleSchedule}
                    disabled={!canPost || !scheduledDate || !scheduledTime}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            </Dropdown>

            {/* Save draft button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDraft}
              disabled={!hasContent}
              title="Save as draft"
            >
              <FileText className="w-4 h-4" />
            </Button>

            {/* Post button */}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canPost}
            >
              {isPosting ? <Loading size="sm" /> : 'Post'}
            </Button>
          </div>
        </div>

        {/* Composer Content */}
        <div className="p-4 h-[calc(100%-60px)] overflow-y-auto">
          <div className="flex gap-3">
            <Avatar src={user?.avatar} alt={user?.displayName} size="md" />

            <div className="flex-1 min-w-0">
              {/* Reply indicator */}
              {replyTo && (
                <div className="text-sm text-text-muted mb-2">
                  Replying to <span className="text-primary">@{replyTo.handle}</span>
                </div>
              )}

              {/* Text input with hashtag autocomplete */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onSelect={handleCursorChange}
                  onClick={handleCursorChange}
                  onPaste={handlePaste}
                  placeholder={replyTo ? "Post your reply" : "What's happening?"}
                  className="w-full bg-transparent border-0 p-0 resize-none text-text-primary placeholder-text-muted focus:outline-none focus:ring-0 text-lg min-h-[120px]"
                  disabled={isPosting}
                />

                {/* Hashtag Autocomplete */}
                <HashtagAutocomplete
                  text={text}
                  cursorPosition={cursorPosition}
                  onSelect={handleHashtagSelect}
                  textareaRef={textareaRef}
                  isVisible={showHashtagAutocomplete}
                  onClose={() => setShowHashtagAutocomplete(false)}
                />
              </div>

              {/* Video preview */}
              {video && (
                <div className="relative rounded-xl overflow-hidden mt-3">
                  <video
                    src={video.preview}
                    className="w-full max-h-64 object-contain bg-black"
                    controls
                  />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="text"
                    value={video.alt}
                    onChange={(e) => updateVideoAlt(e.target.value)}
                    placeholder="Add alt text for video"
                    className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 border-0"
                  />
                </div>
              )}

              {/* GIF preview */}
              {gif && (
                <div className="relative rounded-xl overflow-hidden mt-3">
                  <img
                    src={gif.preview || gif.url}
                    alt={gif.title || 'GIF'}
                    className="w-full max-h-64 object-contain bg-black"
                  />
                  <button
                    onClick={removeGif}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                    GIF via GIPHY
                  </div>
                </div>
              )}

              {/* Quote post preview */}
              {quotePost && (
                <div className="mt-3 rounded-xl border border-border p-3 bg-bg-tertiary/30">
                  <div className="flex items-start gap-2 mb-2">
                    {quotePost.author?.avatar && (
                      <img
                        src={quotePost.author.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {quotePost.author?.displayName || quotePost.author?.handle}
                      </div>
                      <div className="text-text-muted text-xs truncate">
                        @{quotePost.author?.handle}
                      </div>
                    </div>
                  </div>
                  {quotePost.record?.text && (
                    <p className="text-text-primary text-sm whitespace-pre-wrap break-words line-clamp-3">
                      {quotePost.record.text}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-text-muted">
                    Quoting this post
                  </div>
                </div>
              )}

              {/* Image previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden">
                      <img
                        src={img.preview}
                        alt={img.alt || `Image ${index + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImageAlt(index, e.target.value)}
                        placeholder="Add alt text"
                        className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 border-0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-bg-secondary">
          {/* Upload progress bar */}
          {isPosting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={images.length >= 4 || video || gif}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoSelect}
                className="hidden"
                disabled={video || images.length > 0 || gif}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4 || video || gif}
                aria-label="Add image"
                title={video || gif ? 'Remove media to add images' : 'Add image'}
              >
                <Image className={`w-5 h-5 text-primary ${video || gif ? 'opacity-50' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => videoInputRef.current?.click()}
                disabled={video || images.length > 0 || gif}
                aria-label="Add video"
                title={images.length > 0 || gif ? 'Remove media to add video' : 'Add video'}
              >
                <Film className={`w-5 h-5 text-primary ${images.length > 0 || gif ? 'opacity-50' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGifPicker(true)}
                disabled={video || images.length > 0 || gif}
                aria-label="Add GIF"
                title={video || images.length > 0 ? 'Remove media to add GIF' : 'Add GIF'}
              >
                <Sparkles className={`w-5 h-5 text-primary ${video || images.length > 0 ? 'opacity-50' : ''}`} />
              </Button>
            </div>

            {/* Character count */}
            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-bg-tertiary"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={75.4}
                      strokeDashoffset={75.4 - (75.4 * Math.min(charCount, MAX_POST_LENGTH)) / MAX_POST_LENGTH}
                      className={
                        isOverLimit
                          ? 'text-red-500'
                          : charCount > MAX_POST_LENGTH - 20
                          ? 'text-yellow-500'
                          : 'text-primary'
                      }
                    />
                  </svg>
                  {charCount > MAX_POST_LENGTH - 20 && (
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                        isOverLimit ? 'text-red-500' : 'text-text-secondary'
                      }`}
                    >
                      {MAX_POST_LENGTH - charCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GIF Picker Modal */}
      <GifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleGifSelect}
      />

      {/* Drafts Manager Modal */}
      <DraftsManager
        isOpen={showDraftsManager}
        onClose={() => setShowDraftsManager(false)}
        onEditDraft={handleEditDraft}
      />
    </Portal>
  );
}

export default SlideOutComposer;
