import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Link as LinkIcon, MapPin, Users, UserPlus, ChevronRight, Package } from 'lucide-react';
import api from '../../services/api';
import usersService from '../../services/users';
import { useAuth } from '../../hooks/useAuth';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useKeyboardStore } from '../../stores/keyboardStore';
import { formatNumber, formatDate } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Post from '../posts/Post';
import { showSuccessToast, showErrorToast } from '../common/Toast';

function ProfileColumn({ column }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [suggestedFollows, setSuggestedFollows] = useState([]);
  const [knownFollowers, setKnownFollowers] = useState([]);
  const [starterPacks, setStarterPacks] = useState([]);
  const [showSuggested, setShowSuggested] = useState(false);
  const [showKnown, setShowKnown] = useState(false);
  const containerRef = useRef(null);
  const { registerColumnRef, unregisterColumnRef } = useKeyboardStore();

  const profileDid = column.profileDid || user?.did;

  // Register scroll container ref for keyboard navigation
  useEffect(() => {
    registerColumnRef(column.id, containerRef);
    return () => unregisterColumnRef(column.id);
  }, [column.id, registerColumnRef, unregisterColumnRef]);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, feedRes] = await Promise.all([
        api.get(`/users/${profileDid}`),
        api.get(`/users/${profileDid}/feed`),
      ]);
      setProfile(profileRes.data.profile);
      setFeed(feedRes.data.feed || []);

      // Fetch suggested follows and known followers for other users' profiles
      if (profileDid !== user?.did) {
        try {
          const [suggestedRes, knownRes] = await Promise.all([
            usersService.getSuggestedFollows(profileDid),
            usersService.getKnownFollowers(profileDid, { limit: 10 }),
          ]);
          setSuggestedFollows(suggestedRes.slice(0, 5));
          setKnownFollowers(knownRes.followers || []);
        } catch (err) {
          // Non-critical, just log
          console.log('Could not fetch suggested/known followers:', err.message);
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
    setIsLoading(false);
  }, [profileDid, user?.did]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-refresh based on column settings (default: 60 seconds)
  useAutoRefresh(fetchProfile, column.refreshInterval ?? 60, true);

  // Handle follow from suggested follows
  const handleFollow = async (actor) => {
    try {
      await usersService.follow(actor.did);
      // Update the suggested follows list to reflect the follow
      setSuggestedFollows((prev) =>
        prev.map((a) =>
          a.did === actor.did
            ? { ...a, viewer: { ...a.viewer, following: true } }
            : a
        )
      );
      showSuccessToast(`Following @${actor.handle}`);
    } catch (error) {
      showErrorToast('Failed to follow');
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        Profile not found
      </div>
    );
  }

  const isOwnProfile = user?.did === profile.did;

  return (
    <div ref={containerRef} className="column-content">
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
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="-mt-12 mb-3 flex justify-between items-end">
          <Avatar
            src={profile.avatar}
            alt={profile.displayName}
            size="xl"
            className="border-4 border-bg-secondary"
          />
          {!isOwnProfile && (
            <Button variant={profile.viewer?.following ? 'secondary' : 'primary'}>
              {profile.viewer?.following ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Name and handle */}
        <h2 className="text-xl font-bold text-text-primary">
          {profile.displayName}
        </h2>
        <p className="text-text-muted">@{profile.handle}</p>

        {/* Bio */}
        {profile.description && (
          <p className="mt-3 text-text-primary whitespace-pre-wrap">
            {profile.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm">
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

        {/* Join date */}
        {profile.createdAt && (
          <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
            <Calendar className="w-4 h-4" />
            Joined {formatDate(profile.createdAt)}
          </div>
        )}

        {/* Known/Mutual Followers */}
        {!isOwnProfile && knownFollowers.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowKnown(!showKnown)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>
                Followed by{' '}
                {knownFollowers.slice(0, 2).map((f, i) => (
                  <span key={f.did}>
                    {i > 0 && ', '}
                    <span className="text-text-primary">{f.displayName || f.handle}</span>
                  </span>
                ))}
                {knownFollowers.length > 2 && (
                  <span> and {knownFollowers.length - 2} others you follow</span>
                )}
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showKnown ? 'rotate-90' : ''}`}
              />
            </button>
            {showKnown && (
              <div className="mt-2 space-y-2">
                {knownFollowers.map((follower) => (
                  <div
                    key={follower.did}
                    className="flex items-center gap-2 p-2 rounded-lg bg-bg-tertiary"
                  >
                    <Avatar src={follower.avatar} alt={follower.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {follower.displayName || follower.handle}
                      </p>
                      <p className="text-xs text-text-muted truncate">@{follower.handle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Follows */}
        {!isOwnProfile && suggestedFollows.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowSuggested(!showSuggested)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Similar accounts to follow</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showSuggested ? 'rotate-90' : ''}`}
              />
            </button>
            {showSuggested && (
              <div className="mt-2 space-y-2">
                {suggestedFollows.map((actor) => (
                  <div
                    key={actor.did}
                    className="flex items-center gap-2 p-2 rounded-lg bg-bg-tertiary"
                  >
                    <Avatar src={actor.avatar} alt={actor.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {actor.displayName || actor.handle}
                      </p>
                      <p className="text-xs text-text-muted truncate">@{actor.handle}</p>
                    </div>
                    {!actor.viewer?.following && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleFollow(actor)}
                      >
                        Follow
                      </Button>
                    )}
                    {actor.viewer?.following && (
                      <span className="text-xs text-text-muted">Following</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border sticky top-0 bg-bg-secondary">
        {['posts', 'replies', 'likes', 'packs'].map((tab) => (
          <button
            key={tab}
            onClick={async () => {
              setActiveTab(tab);
              // Fetch starter packs on first click
              if (tab === 'packs' && starterPacks.length === 0) {
                try {
                  const result = await usersService.getStarterPacks(profileDid);
                  setStarterPacks(result.starterPacks || []);
                } catch (err) {
                  console.error('Failed to fetch starter packs:', err);
                }
              }
            }}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed content */}
      {activeTab !== 'packs' && (
        <div>
          {feed.map((item, index) => (
            <Post key={item.post?.uri || index} item={item} />
          ))}

          {feed.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              No {activeTab} yet
            </div>
          )}
        </div>
      )}

      {/* Starter Packs */}
      {activeTab === 'packs' && (
        <div className="p-4 space-y-3">
          {starterPacks.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              No starter packs yet
            </div>
          )}
          {starterPacks.map((pack) => (
            <div
              key={pack.uri}
              className="p-4 rounded-lg bg-bg-tertiary border border-border hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {pack.avatar ? (
                  <img
                    src={pack.avatar}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">
                    {pack.record?.name || 'Starter Pack'}
                  </h3>
                  {pack.record?.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                      {pack.record.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pack.listItemCount || 0} members
                    </span>
                    {pack.joinedAllTimeCount > 0 && (
                      <span>{formatNumber(pack.joinedAllTimeCount)} joined</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileColumn;
