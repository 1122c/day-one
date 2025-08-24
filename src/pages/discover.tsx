import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import ProfileDiscovery from '@/components/discovery/ProfileDiscovery';
import MatchDashboard from '@/components/matches/MatchDashboard';
import { UserProfile, Match } from '@/types/user';
import { FiUsers, FiSearch, FiHeart, FiMessageSquare, FiZap, FiUserMinus, FiFlag } from 'react-icons/fi';
import { useChat } from '@/contexts/ChatContext';

export default function DiscoverPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();
  const { openChat } = useChat();

  useEffect(() => {
    async function loadUserProfile() {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          // Ensure the profile has all required fields with defaults
          const profile: UserProfile = {
            id: user.uid,
            email: profileData.email || user.email || '',
            name: profileData.name || 'User',
            bio: profileData.bio || '',
            age: profileData.age || '',
            location: profileData.location || '',
            occupation: profileData.occupation || '',
            education: profileData.education || '',
            interests: profileData.interests || [],
            socialProfiles: profileData.socialProfiles || [],
            values: {
              coreValues: profileData.values?.coreValues || [],
              personalGoals: profileData.values?.personalGoals || [],
              preferredCommunication: profileData.values?.preferredCommunication || [],
              availability: profileData.values?.availability || {
                timezone: 'UTC',
                preferredTimes: ['Morning', 'Afternoon', 'Evening'],
              },
            },
            createdAt: profileData.createdAt || new Date(),
            updatedAt: profileData.updatedAt || new Date(),
            privacy: profileData.privacy || {
              profileVisibility: 'public',
              showEmail: false,
              showSocialProfiles: true,
              allowMessaging: true,
              messageSource: 'anyone',
              showOnlineStatus: true,
              showReadReceipts: true,
              showTypingIndicators: true,
              allowProfileViews: true,
            },
          };
          setUserProfile(profile);
        } else {
          // Create a default profile if none exists
          const defaultProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || 'User',
            bio: 'Professional looking to connect and grow',
            values: {
              coreValues: ['Growth', 'Connection', 'Learning', 'Authenticity'],
              personalGoals: ['Build meaningful relationships', 'Learn from others', 'Share experiences'],
              preferredCommunication: ['Respectful', 'Professional', 'Engaging'],
              availability: {
                timezone: 'UTC',
                preferredTimes: ['Morning', 'Afternoon', 'Evening'],
              },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            privacy: {
              profileVisibility: 'public',
              showEmail: false,
              showSocialProfiles: true,
              allowMessaging: true,
              messageSource: 'anyone',
              showOnlineStatus: true,
              showReadReceipts: true,
              showTypingIndicators: true,
              allowProfileViews: true,
            },
          };
          setUserProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    loadUserProfile();
  }, [user]);

  // Mock matches data - in a real app, this would come from Firebase
  useEffect(() => {
    if (userProfile) {
      const mockMatches: Match[] = [
        {
          id: 'match-1',
          userIds: [userProfile.id, 'user-2'],
          matchScore: 92,
          compatibilityFactors: {
            valuesAlignment: 95,
            goalsAlignment: 88,
            communicationStyle: 90,
          },
          matchReason: 'Strong alignment on core values and communication preferences',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'accepted',
        },
        {
          id: 'match-2',
          userIds: [userProfile.id, 'user-3'],
          matchScore: 87,
          compatibilityFactors: {
            valuesAlignment: 85,
            goalsAlignment: 90,
            communicationStyle: 88,
          },
          matchReason: 'Great synergy in personal goals and shared interests',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          status: 'accepted',
        },
        {
          id: 'match-3',
          userIds: [userProfile.id, 'user-4'],
          matchScore: 78,
          compatibilityFactors: {
            valuesAlignment: 75,
            goalsAlignment: 80,
            communicationStyle: 79,
          },
          matchReason: 'Good potential for growth and learning together',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: 'pending',
        },
      ];
      setMatches(mockMatches);
    }
  }, [userProfile]);

  const handleViewProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleStartConversation = (profile: UserProfile) => {
    if (!userProfile) return;
    
    // Create a mock match for the chat
    const mockMatch: Match = {
      id: `match-${userProfile.id}-${profile.id}`,
      userIds: [userProfile.id, profile.id],
      matchScore: 85, // Mock score
      compatibilityFactors: {
        valuesAlignment: 80,
        goalsAlignment: 85,
        communicationStyle: 90,
      },
      matchReason: 'Great potential for connection based on shared interests',
      createdAt: new Date(),
      status: 'pending',
    };
    
    openChat(userProfile, profile, mockMatch);
  };

  const handleLikeProfile = async (profile: UserProfile) => {
    try {
      // In a real app, this would save the like to the database
      // For now, we'll just show a success message
      console.log('Liked profile:', profile.name);
      
      // You could implement a like system here:
      // await saveLike(userProfile.id, profile.id);
      
      // Show success feedback (you could add a toast notification here)
      alert(`You liked ${profile.name}'s profile!`);
    } catch (error) {
      console.error('Error liking profile:', error);
      alert('Failed to like profile. Please try again.');
    }
  };

  const handleUnfollowProfile = async (profile: UserProfile) => {
    try {
      // In a real app, this would remove the follow relationship from the database
      console.log('Unfollowed profile:', profile.name);
      
      // You could implement an unfollow system here:
      // await removeFollow(userProfile.id, profile.id);
      
      // Show success feedback
      alert(`You unfollowed ${profile.name}. You won't see their updates anymore.`);
    } catch (error) {
      console.error('Error unfollowing profile:', error);
      alert('Failed to unfollow profile. Please try again.');
    }
  };

  const handleReportProfile = async (profile: UserProfile) => {
    try {
      // In a real app, this would submit a report to moderators
      console.log('Reported profile:', profile.name);
      
      // You could implement a reporting system here:
      // await submitReport(userProfile.id, profile.id, reason);
      
      // Show success feedback
      alert(`Thank you for reporting ${profile.name}'s profile. Our team will review it within 24 hours.`);
    } catch (error) {
      console.error('Error reporting profile:', error);
      alert('Failed to report profile. Please try again.');
    }
  };

  const handleAcceptMatch = (matchId: string) => {
    // In a real app, this would accept the match
    console.log('Accepted match:', matchId);
  };

  const handleRejectMatch = (matchId: string) => {
    // In a real app, this would reject the match
    console.log('Rejected match:', matchId);
  };

  const handleStartMatchConversation = (matchId: string) => {
    // In a real app, this would start a conversation with the match
    console.log('Starting conversation with match:', matchId);
  };

  if (loading || profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please complete your profile to access discover features.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Complete Profile
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover & Connect</h1>
              <p className="mt-2 text-gray-600">
                Find meaningful connections and explore potential matches
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Matches</p>
                <p className="text-2xl font-bold text-indigo-600">{matches.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('discover')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'discover'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiSearch className="inline h-4 w-4 mr-2" />
                Discover
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matches'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiHeart className="inline h-4 w-4 mr-2" />
                Matches ({matches.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'discover' && (
          <ProfileDiscovery
            currentUser={userProfile}
            onViewProfile={handleViewProfile}
            onStartConversation={handleStartConversation}
            onLikeProfile={handleLikeProfile}
            onUnfollowProfile={handleUnfollowProfile}
            onReportProfile={handleReportProfile}
          />
        )}

        {activeTab === 'matches' && (
          <MatchDashboard
            currentUser={userProfile}
            matches={matches}
            onAcceptMatch={handleAcceptMatch}
            onRejectMatch={handleRejectMatch}
            onStartConversation={handleStartMatchConversation}
          />
        )}

        {/* AI Suggestions Preview */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-indigo-100">
                <FiZap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI-Powered Conversation Helpers</h3>
                <p className="text-gray-600">
                  Get personalized ice breakers, conversation starters, and follow-up questions for meaningful connections.
                </p>
              </div>
            </div>
            <div className="text-sm text-indigo-600 font-medium">
              Available in Chat
            </div>
          </div>
        </div>

        {/* Profile View Modal */}
        {showProfileModal && selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProfile.name}</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Profile Content */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700">
                      {selectedProfile.bio || 'No bio provided'}
                    </p>
                  </div>

                  {/* Core Values */}
                  {selectedProfile.values.coreValues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Core Values</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.values.coreValues.map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal Goals */}
                  {selectedProfile.values.personalGoals.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Goals</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.values.personalGoals.map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communication Preferences */}
                  {selectedProfile.values.preferredCommunication.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Communication Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.values.preferredCommunication.map((method) => (
                          <span
                            key={method}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {selectedProfile.values.availability && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Availability</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Timezone</p>
                          <p className="text-gray-700">{selectedProfile.values.availability.timezone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Preferred Times</p>
                          <p className="text-gray-700">
                            {selectedProfile.values.availability.preferredTimes?.join(', ') || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        handleStartConversation(selectedProfile);
                      }}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FiMessageSquare className="inline h-4 w-4 mr-2" />
                      Start Conversation
                    </button>
                    <button
                      onClick={() => handleLikeProfile(selectedProfile)}
                      className="px-4 py-2 text-pink-500 hover:text-pink-700 transition-colors duration-200 border border-pink-300 rounded-md"
                    >
                      <FiHeart className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Secondary Action Buttons */}
                  <div className="flex space-x-3 pt-3">
                    <button
                      onClick={() => handleUnfollowProfile(selectedProfile)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors duration-200 border border-red-200"
                    >
                      <FiUserMinus className="inline h-4 w-4 mr-2" />
                      Unfollow
                    </button>
                    <button
                      onClick={() => handleReportProfile(selectedProfile)}
                      className="flex-1 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-100 transition-colors duration-200 border border-yellow-200"
                    >
                      <FiFlag className="inline h-4 w-4 mr-2" />
                      Report Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 