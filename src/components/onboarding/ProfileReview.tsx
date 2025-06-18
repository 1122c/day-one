import { UserProfile, SocialProfile } from '@/types/user';
import { FiLinkedin, FiTwitter, FiInstagram, FiMusic, FiHeart } from 'react-icons/fi';

interface ProfileReviewProps {
  profile: Partial<UserProfile>;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'linkedin':
      return <FiLinkedin className="h-5 w-5 text-blue-600" />;
    case 'twitter':
      return <FiTwitter className="h-5 w-5 text-sky-600" />;
    case 'instagram':
      return <FiInstagram className="h-5 w-5 text-pink-600" />;
    case 'tiktok':
      return <FiMusic className="h-5 w-5 text-black" />;
    case 'onlyfans':
      return <FiHeart className="h-5 w-5 text-pink-500" />;
    default:
      return null;
  }
};

export default function ProfileReview({ profile, onEdit, onSubmit, isSubmitting, error }: ProfileReviewProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Your Profile</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1 text-gray-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-gray-900">{profile.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Bio</p>
              <p className="mt-1 text-gray-900">{profile.bio}</p>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Core Values</h3>
            <div className="flex flex-wrap gap-2">
              {profile.values?.coreValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>

          {/* Personal Goals */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Goals</h3>
            <div className="flex flex-wrap gap-2">
              {profile.values?.personalGoals.map((goal) => (
                <span
                  key={goal}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Communication Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Preferred Methods</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.values?.preferredCommunication.map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Availability</p>
                <div className="mt-2">
                  <p className="text-gray-900">Timezone: {profile.values?.availability.timezone}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.values?.availability.preferredTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          {profile.socialProfiles && profile.socialProfiles.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Profiles</h3>
              <div className="space-y-4">
                {profile.socialProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getPlatformIcon(profile.platform)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{profile.platform}</p>
                      <p className="text-sm text-gray-500">@{profile.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
} 