import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { updateEmail } from 'firebase/auth';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Ensure privacy object exists with default values
  const privacy = profile.privacy || {
    profileVisibility: 'public',
    showEmail: false,
    showSocialProfiles: true,
    allowMessaging: true,
    showOnlineStatus: true,
    showReadReceipts: true,
    showTypingIndicators: true,
    allowProfileViews: true,
  };

  const handlePrivacyChange = async (field: keyof UserProfile['privacy'], value: any) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage('');

    try {
      const updatedProfile = {
        ...profile,
        privacy: {
          ...privacy, // Use the local privacy object with defaults
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

  const handleEmailUpdate = async () => {
    if (!user || !newEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if new email is different from current
    if (newEmail.trim() === profile.email) {
      setError('New email address must be different from current email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update email in Firebase Auth
      await updateEmail(user, newEmail.trim());
      
      // Update profile with new email
      const updatedProfile = {
        ...profile,
        email: newEmail.trim(),
      };

      await saveUserProfile(user.uid, updatedProfile);
      onUpdate(updatedProfile);
      setSuccessMessage('Email address updated successfully');
      setSuccess(true);
      setNewEmail('');
      
      // Show success message
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error updating email:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign back in to update your email address.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to update email address');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateProfile = async () => {
    if (!user) return;

    setDeactivateLoading(true);
    setError(null);

    try {
      // Update profile to mark as deactivated
      const updatedProfile = {
        ...profile,
        isDeactivated: true,
        deactivatedAt: new Date(),
      };

      await saveUserProfile(user.uid, updatedProfile);
      onUpdate(updatedProfile);
      
      // Sign out the user
      await auth.signOut();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('Error deactivating profile:', err);
      setError('Failed to deactivate profile. Please try again.');
    } finally {
      setDeactivateLoading(false);
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
            value={privacy.profileVisibility}
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
              checked={privacy.showEmail}
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
              checked={privacy.showSocialProfiles}
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
              checked={privacy.allowMessaging}
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
              checked={privacy.showOnlineStatus}
              onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Show online status</span>
          </label>
        </div>

        {/* Email Update Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
          <div className="space-y-4">
            {/* Current Email Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Email Address
              </label>
              <p className="text-sm text-gray-600 font-mono">{profile.email}</p>
            </div>
            
            {/* New Email Input */}
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                New Email Address
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (error) setError(null); // Clear error when user types
                }}
                placeholder="Enter new email address"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                You'll need to verify your new email address before the change takes effect.
              </p>
            </div>
            
            {/* Update Button */}
            <button
              type="button"
              onClick={handleEmailUpdate}
              disabled={loading || !newEmail.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </div>
              ) : (
                'Update Email Address'
              )}
            </button>
          </div>
        </div>

        {/* Account Deactivation Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Deactivate Profile</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Deactivating your profile will hide it from other users and pause all matching activities. 
                    You can reactivate at any time by signing back in.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateModal(true)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deactivate Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          {successMessage || 'Privacy settings updated successfully'}
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Deactivate Profile</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to deactivate your profile? This will:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Hide your profile from other users</li>
                <li>Pause all matching activities</li>
                <li>Sign you out of the application</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                <strong>You can reactivate at any time by signing back in.</strong>
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={deactivateLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivateProfile}
                disabled={deactivateLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deactivateLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deactivating...
                  </div>
                ) : (
                  'Deactivate Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 