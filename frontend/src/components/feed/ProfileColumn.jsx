import { useState, useEffect } from 'react';
import { Calendar, Link as LinkIcon, MapPin, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber, formatDate } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Post from '../posts/Post';

function ProfileColumn({ column }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  const profileDid = column.profileDid || user?.did;

  useEffect(() => {
    if (profileDid) {
      fetchProfile();
    }
  }, [profileDid]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const [profileRes, feedRes] = await Promise.all([
        api.get(`/users/${profileDid}`),
        api.get(`/users/${profileDid}/feed`),
      ]);
      setProfile(profileRes.data.profile);
      setFeed(feedRes.data.feed || []);
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
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
    <div className="flex-1 overflow-y-auto scrollbar-hide">
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
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border sticky top-0 bg-bg-secondary">
        {['posts', 'replies', 'likes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {/* Feed */}
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
    </div>
  );
}

export default ProfileColumn;
