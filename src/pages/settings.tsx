import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PrivacySettings from '@/components/settings/PrivacySettings';
import { UserProfile } from '@/types/user';
import { getUserProfile, saveUserProfile } from '@/services/firebaseService';
import { FiUser, FiShield, FiBell, FiGlobe, FiSave, FiEdit3 } from 'react-icons/fi';

export default function SettingsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && !profile) {
      loadUserProfile();
    }
  }, [user, profile]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoadingProfile(true);
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // If still loading auth state, show loading
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  // If no user is authenticated, redirect to signin
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'privacy', name: 'Privacy', icon: FiShield },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'preferences', name: 'Preferences', icon: FiGlobe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Profile Settings</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
              >
                <FiEdit3 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            {loadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : profile ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => {
                        const updatedProfile = {
                          ...profile,
                          name: e.target.value
                        };
                        setProfile(updatedProfile);
                      }}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      disabled
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex-1 space-y-3">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload from computer
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Create a local URL for preview
                                const imageUrl = URL.createObjectURL(file);
                                const updatedProfile = {
                                  ...profile,
                                  profilePicture: imageUrl
                                };
                                setProfile(updatedProfile);
                                
                                // Store the file for later upload
                                // Note: In a real app, you'd upload this to a service like Firebase Storage
                                console.log('File selected:', file.name, 'Size:', file.size);
                              }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Supported formats: JPG, PNG, GIF (max 5MB)
                          </p>
                        </div>
                        
                        {/* URL Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or use image URL
                          </label>
                          <input
                            type="url"
                            value={profile.profilePicture || ''}
                            onChange={(e) => {
                              const updatedProfile = {
                                ...profile,
                                profilePicture: e.target.value
                              };
                              setProfile(updatedProfile);
                            }}
                            placeholder="Enter image URL (optional)"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Paste a direct image URL (e.g., from Imgur, your website, etc.)
                          </p>
                        </div>
                        
                        {/* Remove Picture Option */}
                        {profile.profilePicture && (
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedProfile = {
                                  ...profile,
                                  profilePicture: undefined
                                };
                                setProfile(updatedProfile);
                              }}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove profile picture
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={profile.bio || ''}
                    onChange={(e) => {
                      const updatedProfile = {
                        ...profile,
                        bio: e.target.value
                      };
                      setProfile(updatedProfile);
                    }}
                    disabled={!isEditing}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Additional Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="text"
                      value={profile.age || ''}
                      onChange={(e) => {
                        const updatedProfile = {
                          ...profile,
                          age: e.target.value
                        };
                        setProfile(updatedProfile);
                      }}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => {
                        const updatedProfile = {
                          ...profile,
                          location: e.target.value
                        };
                        setProfile(updatedProfile);
                      }}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={profile.occupation || ''}
                      onChange={(e) => {
                        const updatedProfile = {
                          ...profile,
                          occupation: e.target.value
                        };
                        setProfile(updatedProfile);
                      }}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Your profession or role"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      value={profile.education || ''}
                      onChange={(e) => {
                        const updatedProfile = {
                          ...profile,
                          education: e.target.value
                        };
                        setProfile(updatedProfile);
                      }}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Degree, institution, or learning path"
                      />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <textarea
                    rows={3}
                    value={profile.interests?.join(', ') || ''}
                    onChange={(e) => {
                      const interestsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                      const updatedProfile = {
                        ...profile,
                        interests: interestsArray
                      };
                      setProfile(updatedProfile);
                    }}
                    disabled={!isEditing}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Your interests, hobbies, or passions (comma-separated)"
                  />
                </div>

                {/* Social Profiles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Profiles
                  </label>
                  <div className="space-y-3">
                    {profile.socialProfiles?.map((social, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={social.platform}
                          disabled={!isEditing}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                          <option value="discord">Discord</option>
                          <option value="onlyfans">OnlyFans</option>
                        </select>
                        <input
                          type="url"
                          value={social.url}
                          disabled={!isEditing}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Profile URL"
                        />
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        + Add Social Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Core Values */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Core Values
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {[
                        'Authenticity', 'Growth', 'Connection', 'Empathy', 'Innovation',
                        'Collaboration', 'Balance', 'Purpose', 'Creativity', 'Leadership',
                        'Learning', 'Community', 'Adventure', 'Stability', 'Excellence', 'Compassion'
                      ].map((value) => (
                        <label key={value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.values?.coreValues?.includes(value) || false}
                            onChange={(e) => {
                              const currentValues = profile.values?.coreValues || [];
                              const newValues = e.target.checked
                                ? [...currentValues, value]
                                : currentValues.filter(v => v !== value);
                              
                              const updatedProfile = {
                                ...profile,
                                values: {
                                  ...profile.values,
                                  coreValues: newValues
                                }
                              };
                              setProfile(updatedProfile);
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{value}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.values?.coreValues?.map((value) => (
                        <span
                          key={value}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {value}
                        </span>
                      ))}
                      {(!profile.values?.coreValues || profile.values.coreValues.length === 0) && (
                        <span className="text-gray-500 text-sm">No core values selected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Personal Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Goals
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {[
                        'Professional Networking', 'Mentorship', 'Friendship', 'Collaboration',
                        'Learning', 'Support', 'Career Growth', 'Skill Development',
                        'Business Partnership', 'Creative Projects', 'Personal Development',
                        'Community Building', 'Travel & Adventure', 'Health & Wellness',
                        'Financial Success', 'Social Impact'
                      ].map((goal) => (
                        <label key={goal} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.values?.personalGoals?.includes(goal) || false}
                            onChange={(e) => {
                              const currentGoals = profile.values?.personalGoals || [];
                              const newGoals = e.target.checked
                                ? [...currentGoals, goal]
                                : currentGoals.filter(g => g !== goal);
                              
                              const updatedProfile = {
                                ...profile,
                                values: {
                                  ...profile.values,
                                  personalGoals: newGoals
                                }
                              };
                              setProfile(updatedProfile);
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{goal}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.values?.personalGoals?.map((goal) => (
                        <span
                          key={goal}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {goal}
                        </span>
                      ))}
                      {(!profile.values?.personalGoals || profile.values.personalGoals.length === 0) && (
                        <span className="text-gray-500 text-sm">No personal goals selected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Communication Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Preferences
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {[
                        'Video Calls', 'Text Chat', 'Voice Calls', 'In-Person Meetings',
                        'Email', 'Social Media', 'Group Chats', 'Workshops',
                        'Conferences', 'Coffee Meetings'
                      ].map((method) => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.values?.preferredCommunication?.includes(method) || false}
                            onChange={(e) => {
                              const currentMethods = profile.values?.preferredCommunication || [];
                              const newMethods = e.target.checked
                                ? [...currentMethods, method]
                                : currentMethods.filter(m => m !== method);
                              
                              const updatedProfile = {
                                ...profile,
                                values: {
                                  ...profile.values,
                                  preferredCommunication: newMethods
                                }
                              };
                              setProfile(updatedProfile);
                            }}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{method}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.values?.preferredCommunication?.map((method) => (
                        <span
                          key={method}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {method}
                        </span>
                      ))}
                      {(!profile.values?.preferredCommunication || profile.values.preferredCommunication.length === 0) && (
                        <span className="text-gray-500 text-sm">No communication preferences selected</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profile.values?.availability?.timezone || ''}
                      disabled={!isEditing}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select timezone</option>
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="PST">PST</option>
                      <option value="CST">CST</option>
                      <option value="MST">MST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Times
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {[
                          'Early Morning (6-9 AM)', 'Morning (9 AM-12 PM)', 'Afternoon (12-5 PM)',
                          'Evening (5-9 PM)', 'Late Evening (9 PM-12 AM)', 'Weekend', 'Weekday'
                        ].map((time) => (
                          <label key={time} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.values?.availability?.preferredTimes?.includes(time) || false}
                              onChange={(e) => {
                                const currentTimes = profile.values?.availability?.preferredTimes || [];
                                const newTimes = e.target.checked
                                  ? [...currentTimes, time]
                                  : currentTimes.filter(t => t !== time);
                                
                                const updatedProfile = {
                                  ...profile,
                                  values: {
                                    ...profile.values,
                                    availability: {
                                      ...profile.values?.availability,
                                      preferredTimes: newTimes
                                    }
                                  }
                                };
                                setProfile(updatedProfile);
                              }}
                              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{time}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.values?.availability?.preferredTimes?.map((time) => (
                          <span
                            key={time}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {time}
                          </span>
                        ))}
                        {(!profile.values?.availability?.preferredTimes || profile.values.availability.preferredTimes.length === 0) && (
                          <span className="text-gray-500 text-sm">No preferred times selected</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!user || !profile) return;
                        
                        try {
                          setLoadingProfile(true);
                          await saveUserProfile(user.uid, profile);
                          setIsEditing(false);
                          // Show success message or toast here if you want
                        } catch (error) {
                          console.error('Error saving profile:', error);
                          // Show error message here if you want
                        } finally {
                          setLoadingProfile(false);
                        }
                      }}
                      disabled={loadingProfile}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingProfile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No profile data found. Please complete your onboarding first.</p>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Complete Profile Setup
                </button>
              </div>
            )}
          </div>
        );

      case 'privacy':
        return profile ? (
          <PrivacySettings profile={profile} onUpdate={setProfile} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Profile data needed for privacy settings.</p>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">New Matches</h3>
                  <p className="text-sm text-gray-500">Get notified when you have new potential matches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile Views</h3>
                  <p className="text-sm text-gray-500">Get notified when someone views your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="CST">CST</option>
                  <option value="MST">MST</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings, privacy, and preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
}
