import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import { saveUserProfile } from '@/services/firebaseService';

interface PrivacySettingsProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function PrivacySettings({ profile, onUpdate }: PrivacySettingsProps) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePrivacyChange = async (field: keyof UserProfile['privacy'], value: any) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = {
        ...profile,
        privacy: {
          ...profile.privacy,
          [field]: value,
        },
      };

      await saveUserProfile(user.uid, updatedProfile);
      onUpdate(updatedProfile);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div>
          <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            value={profile.privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="public">Public - Anyone can view your profile</option>
            <option value="matches">Matches Only - Only your matches can view your profile</option>
            <option value="private">Private - Only you can view your profile</option>
          </select>
        </div>

        {/* Email Visibility */}
        <div>
          <label htmlFor="showEmail" className="flex items-center">
            <input
              id="showEmail"
              type="checkbox"
              checked={profile.privacy.showEmail}
              onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Show email address</span>
          </label>
        </div>

        {/* Social Profiles Visibility */}
        <div>
          <label htmlFor="showSocialProfiles" className="flex items-center">
            <input
              id="showSocialProfiles"
              type="checkbox"
              checked={profile.privacy.showSocialProfiles}
              onChange={(e) => handlePrivacyChange('showSocialProfiles', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Show social profiles</span>
          </label>
        </div>

        {/* Messaging Permissions */}
        <div>
          <label htmlFor="allowMessaging" className="flex items-center">
            <input
              id="allowMessaging"
              type="checkbox"
              checked={profile.privacy.allowMessaging}
              onChange={(e) => handlePrivacyChange('allowMessaging', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Allow messaging from matches</span>
          </label>
        </div>

        {/* Online Status */}
        <div>
          <label htmlFor="showOnlineStatus" className="flex items-center">
            <input
              id="showOnlineStatus"
              type="checkbox"
              checked={profile.privacy.showOnlineStatus}
              onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Show online status</span>
          </label>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 text-green-600 text-sm rounded-md">
          Privacy settings updated successfully
        </div>
      )}
    </div>
  );
} 