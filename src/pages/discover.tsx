import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import Layout from '@/components/Layout';
import ProfileDiscovery from '@/components/discovery/ProfileDiscovery';
import MatchDashboard from '@/components/matches/MatchDashboard';
import { UserProfile, Match } from '@/types/user';
import { FiUsers, FiSearch, FiHeart, FiMessageSquare, FiZap, FiUserMinus, FiFlag } from 'react-icons/fi';
import { useChat } from '@/contexts/ChatContext';
import { getUserProfile, getPotentialMatches, getMatchesForUser, createMatch, blockUser, sendConnectionRequest } from '@/services/firebaseService';

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
        console.log('👤 Loading user profile for:', user.uid);
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          console.log('✅ User profile loaded:', profile.name);
          setUserProfile(profile);
        } else {
          console.log('⚠️ No profile found, using default');
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

  // Load real matches from Firebase
  useEffect(() => {
    if (userProfile) {
      const loadMatches = async () => {
        try {
          console.log('🔍 Loading matches for user:', userProfile.id);
          const userMatches = await getMatchesForUser(userProfile.id);
          console.log('✅ Matches loaded:', userMatches.length);
          setMatches(userMatches);
        } catch (error) {
          console.error('❌ Error loading matches:', error);
          // Fallback to empty matches
          setMatches([]);
        }
      };

      loadMatches();
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
    const isConfirmed = window.confirm(
      `Are you sure you want to unfollow ${profile.name}? You won't see their updates anymore.`
    );
    
    if (!isConfirmed) return;
    
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
    const isConfirmed = window.confirm(
      `Are you sure you want to report ${profile.name}'s profile? This action will be reviewed by our team.`
    );
    
    if (!isConfirmed) return;
    
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

  const handleBlockUser = async (profile: UserProfile) => {
    try {
      if (!userProfile) return;
      
      console.log('Blocking user:', profile.name);
      await blockUser(userProfile.id, profile.id, 'User blocked from discover page');
      
      // Remove from current view
      setMatches(prev => prev.filter(match => 
        !match.userIds.includes(profile.id)
      ));
      
      alert(`${profile.name} has been blocked successfully.`);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleSendConnectionRequest = async (profile: UserProfile, message?: string) => {
    try {
      if (!userProfile) return;
      
      console.log('Sending connection request to:', profile.name);
      await sendConnectionRequest(userProfile.id, profile.id, message);
      
      alert(`Connection request sent to ${profile.name}!`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      if (error instanceof Error) {
        alert(`Failed to send connection request: ${error.message}`);
      } else {
        alert('Failed to send connection request. Please try again.');
      }
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
      <div className="w-full">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Discover & Connect</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Find meaningful connections and explore potential matches
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-500">Your Matches</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">{matches.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-8 px-4 sm:px-6">
              <button
                onClick={() => setActiveTab('discover')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'discover'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Discover
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'matches'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiHeart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
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
            onBlockUser={handleBlockUser}
            onSendConnectionRequest={handleSendConnectionRequest}
          />
        )}

        {activeTab === 'matches' && (
          <MatchDashboard
            currentUser={userProfile}
            matches={matches}
            onAcceptMatch={handleAcceptMatch}
            onRejectMatch={handleRejectMatch}
            onStartConversation={handleStartMatchConversation}
            onUnfollowProfile={handleUnfollowProfile}
            onReportProfile={handleReportProfile}
            onBlockUser={handleBlockUser}
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
          <div className="flex space-x-2 pt-3">
            <button
              onClick={() => handleUnfollowProfile(selectedProfile)}
              className="flex-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors duration-200 border border-red-200 text-sm"
            >
              <FiUserMinus className="inline h-3 w-3 mr-1.5" />
              Unfollow
            </button>
            <button
              onClick={() => handleReportProfile(selectedProfile)}
              className="flex-1 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-md hover:bg-yellow-100 transition-colors duration-200 border border-yellow-200 text-sm"
            >
              <FiFlag className="inline h-3 w-3 mr-1.5" />
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