import { useState, useRef } from 'react';
import { Image, Video, X, Smile, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MAX_POST_LENGTH } from '../../utils/constants';
import postsService from '../../services/posts';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function PostComposer({ onPost, replyTo, placeholder = "What's happening?" }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_POST_LENGTH;
  const canPost = text.trim().length > 0 && !isOverLimit && !isPosting;

  const handleSubmit = async () => {
    if (!canPost) return;

    setIsPosting(true);

    try {
      let embed = null;

      // Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img, index) => {
          formData.append('files', img.file);
          formData.append(`alt${index}`, img.alt || '');
        });

        const uploadResponse = await api.post('/media/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        embed = uploadResponse.data.embed;
      }

      await postsService.createPost({
        text,
        replyTo,
        embed,
      });

      setText('');
      setImages([]);
      showSuccessToast('Post created!');
      onPost?.();
    } catch (error) {
      showErrorToast(error.response?.data?.error || 'Failed to create post');
    }

    setIsPosting(false);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const updateImageAlt = (index, alt) => {
    const newImages = [...images];
    newImages[index].alt = alt;
    setImages(newImages);
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.displayName} size="md" />

        <div className="flex-1 min-w-0">
          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 p-0 resize-none text-text-primary placeholder-text-muted focus:outline-none focus:ring-0"
            rows={3}
            disabled={isPosting}
          />

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

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={images.length >= 4}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4}
                aria-label="Add image"
              >
                <Image className="w-5 h-5 text-primary" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Character count */}
              <span
                className={`text-sm ${
                  isOverLimit
                    ? 'text-red-500'
                    : charCount > MAX_POST_LENGTH - 20
                    ? 'text-yellow-500'
                    : 'text-text-muted'
                }`}
              >
                {charCount}/{MAX_POST_LENGTH}
              </span>

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
        </div>
      </div>
    </div>
  );
}

export default PostComposer;
