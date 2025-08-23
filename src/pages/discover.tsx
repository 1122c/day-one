import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import ProfileDiscovery from '@/components/discovery/ProfileDiscovery';
import MatchDashboard from '@/components/matches/MatchDashboard';
import AISuggestions from '@/components/ai/AISuggestions';
import { UserProfile, Match } from '@/types/user';
import { FiUsers, FiSearch, FiHeart, FiMessageSquare, FiZap } from 'react-icons/fi';

export default function DiscoverPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const router = useRouter();

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
            bio: '',
            values: {
              coreValues: [],
              personalGoals: [],
              preferredCommunication: [],
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
        // Create a fallback profile on error
        const fallbackProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          bio: '',
          values: {
            coreValues: [],
            personalGoals: [],
            preferredCommunication: [],
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
            showOnlineStatus: true,
            showReadReceipts: true,
            showTypingIndicators: true,
            allowProfileViews: true,
          },
        };
        setUserProfile(fallbackProfile);
      } finally {
        setProfileLoading(false);
      }
    }

    loadUserProfile();
  }, [user]);

  // Mock matches data
  useEffect(() => {
    if (userProfile) {
      const mockMatches: Match[] = [
        {
          id: 'match1',
          userIds: [userProfile.id, 'user2'],
          matchScore: 87,
          compatibilityFactors: {
            valuesAlignment: 90,
            goalsAlignment: 85,
            communicationStyle: 80,
          },
          matchReason: 'Strong alignment in growth mindset and professional development goals. Both value authentic connections and prefer video-based communication.',
          createdAt: new Date(),
          status: 'pending',
        },
        {
          id: 'match2',
          userIds: [userProfile.id, 'user3'],
          matchScore: 92,
          compatibilityFactors: {
            valuesAlignment: 95,
            goalsAlignment: 90,
            communicationStyle: 85,
          },
          matchReason: 'Exceptional compatibility with shared values of empathy and collaboration. Both are passionate about supporting others and building meaningful relationships.',
          createdAt: new Date(),
          status: 'pending',
        },
      ];
      setMatches(mockMatches);
    }
  }, [userProfile]);

  if (loading || profileLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your discovery experience...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't load your profile. This might happen if you haven't completed onboarding yet.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Complete Onboarding
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleViewProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleStartConversation = (profile: UserProfile) => {
    setMessageRecipient(profile);
    setShowMessageModal(true);
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

  const handleSendMessage = async () => {
    if (!messageRecipient || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      // In a real app, this would save the message to the database
      // For now, we'll just show a success message
      console.log('Sending message to:', messageRecipient.name);
      console.log('Message:', messageText);
      
      // You could implement message sending here:
      // await sendMessage(userProfile.id, messageRecipient.id, messageText);
      
      // Show success feedback
      alert(`Message sent to ${messageRecipient.name}!`);
      
      // Close modal and reset
      setShowMessageModal(false);
      setMessageRecipient(null);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

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
                Discover People
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
                Your Matches
                {matches.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {matches.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'discover' ? (
            <div className="p-6">
              <ProfileDiscovery
                currentUser={userProfile}
                onViewProfile={handleViewProfile}
                onStartConversation={handleStartConversation}
                onLikeProfile={handleLikeProfile}
              />
            </div>
          ) : (
            <div className="p-6">
              <MatchDashboard
                currentUser={userProfile}
                matches={matches}
                onAcceptMatch={handleAcceptMatch}
                onRejectMatch={handleRejectMatch}
                onStartConversation={handleStartMatchConversation}
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <FiUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profiles Viewed</p>
                <p className="text-lg font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiHeart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profiles Liked</p>
                <p className="text-lg font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiMessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversations</p>
                <p className="text-lg font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiSearch className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Match Score</p>
                <p className="text-lg font-semibold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <button
            onClick={() => router.push('/chat')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            View AI Suggestions
          </button>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && messageRecipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Message {messageRecipient.name}
                </h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageRecipient(null);
                    setMessageText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Suggestions */}
                <div className="lg:col-span-1">
                  <h4 className="text-md font-medium text-gray-900 mb-4">AI-Powered Conversation Starters</h4>
                  <AISuggestions
                    currentUser={userProfile}
                    matchedUser={messageRecipient}
                    onUseSuggestion={(suggestion: string) => setMessageText(suggestion)}
                  />
                </div>

                {/* Message Form */}
                <div className="lg:col-span-1">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Compose Your Message</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message
                      </label>
                      <textarea
                        id="messageText"
                        rows={6}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message to start a conversation... or click on an AI suggestion above to use it!"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowMessageModal(false);
                          setMessageRecipient(null);
                          setMessageText('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !messageText.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Sending...
                          </div>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 