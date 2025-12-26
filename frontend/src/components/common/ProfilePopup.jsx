import { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import api from '../../services/api';
import usersService from '../../services/users';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/helpers';
import Avatar from './Avatar';
import Button from './Button';
import Portal from './Portal';
import { showSuccessToast, showErrorToast } from './Toast';

function ProfilePopup({ actor, isOpen, onClose }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followUri, setFollowUri] = useState(null);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  useEffect(() => {
    if (isOpen && actor) {
      fetchProfile();
    }
  }, [isOpen, actor]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.profile-popup')) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const actorId = actor.did || actor.handle;
      const response = await api.get(`/users/${actorId}`);
      setProfile(response.data.profile);
      setIsFollowing(!!response.data.profile.viewer?.following);
      setFollowUri(response.data.profile.viewer?.following || null);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
    setIsLoading(false);
  };

  const handleFollow = async () => {
    if (!profile) return;
    setIsUpdatingFollow(true);

    try {
      if (isFollowing && followUri) {
        await usersService.unfollow(profile.did, followUri);
        setIsFollowing(false);
        setFollowUri(null);
        showSuccessToast(`Unfollowed @${profile.handle}`);
      } else {
        const result = await usersService.follow(profile.did);
        setIsFollowing(true);
        setFollowUri(result.uri);
        showSuccessToast(`Following @${profile.handle}`);
      }
    } catch (error) {
      showErrorToast(isFollowing ? 'Failed to unfollow' : 'Failed to follow');
    }
    setIsUpdatingFollow(false);
  };

  if (!isOpen) return null;

  const isOwnProfile = user?.did === actor?.did || user?.did === profile?.did;

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Popup - centered */}
      <div className="profile-popup fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] max-h-[85vh] bg-bg-secondary rounded-xl shadow-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div>
            {/* Banner */}
            {profile.banner ? (
              <div className="h-32 bg-bg-tertiary">
                <img
                  src={profile.banner}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
            )}

            {/* Profile info */}
            <div className="px-5 pb-5">
              {/* Avatar and follow button row */}
              <div className="-mt-12 mb-3 flex justify-between items-end">
                <Avatar
                  src={profile.avatar}
                  alt={profile.displayName}
                  size="xl"
                  className="border-4 border-bg-secondary"
                />
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                  >
                    {isUpdatingFollow ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Name and handle */}
              <h3 className="text-xl font-bold text-text-primary">
                {profile.displayName || profile.handle}
              </h3>
              <p className="text-text-muted">@{profile.handle}</p>

              {/* Bio */}
              {profile.description && (
                <p className="mt-3 text-text-secondary whitespace-pre-wrap">
                  {profile.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 text-sm">
                <span className="text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {formatNumber(profile.followersCount || 0)}
                  </span>{' '}
                  followers
                </span>
                <span className="text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {formatNumber(profile.followsCount || 0)}
                  </span>{' '}
                  following
                </span>
                <span className="text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {formatNumber(profile.postsCount || 0)}
                  </span>{' '}
                  posts
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-text-muted">
            Profile not found
          </div>
        )}
      </div>
    </Portal>
  );
}

export default ProfilePopup;
