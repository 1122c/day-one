import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import AISuggestions from '@/components/ai/AISuggestions';
import { UserProfile, Match } from '@/types/user';
import { FiMessageSquare, FiUsers, FiZap, FiPlus, FiSearch } from 'react-icons/fi';

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'ai-suggestions' | 'new-chat'>('conversations');
  const [conversations, setConversations] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
              preferredTimes: profileData.values?.preferredTimes || [],
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

  // Mock conversations data
  useEffect(() => {
    if (userProfile) {
      const mockConversations: Match[] = [
        {
          id: 'conv1',
          userIds: [userProfile.id, 'user2'],
          matchScore: 87,
          compatibilityFactors: {
            valuesAlignment: 90,
            goalsAlignment: 85,
            communicationStyle: 80,
          },
          matchReason: 'Strong alignment in growth mindset and professional development goals.',
          createdAt: new Date(),
          status: 'pending',
        },
        {
          id: 'conv2',
          userIds: [userProfile.id, 'user3'],
          matchScore: 92,
          compatibilityFactors: {
            valuesAlignment: 95,
            goalsAlignment: 90,
            communicationStyle: 85,
          },
          matchReason: 'Exceptional compatibility with shared values of empathy and collaboration.',
          createdAt: new Date(),
          status: 'pending',
        },
      ];
      setConversations(mockConversations);
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
                <p className="text-gray-600">Loading your chat experience...</p>
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

  const filteredConversations = conversations.filter(conv => 
    conv.matchReason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chat & Conversations</h1>
              <p className="mt-2 text-gray-600">
                Connect with your matches and get AI-powered conversation suggestions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Conversations</p>
                <p className="text-2xl font-bold text-indigo-600">{conversations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'conversations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiMessageSquare className="inline h-4 w-4 mr-2" />
                Conversations
                {conversations.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {conversations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('ai-suggestions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ai-suggestions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiZap className="inline h-4 w-4 mr-2" />
                AI Suggestions
              </button>
              <button
                onClick={() => setActiveTab('new-chat')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'new-chat'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiPlus className="inline h-4 w-4 mr-2" />
                Start New Chat
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'conversations' && (
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="space-y-4">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        // In a real app, this would open the chat
                        console.log('Opening conversation:', conversation.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FiUsers className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Match #{conversation.id}</h3>
                              <p className="text-sm text-gray-600">{conversation.matchReason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            conversation.matchScore >= 90 ? 'text-green-600 bg-green-100' :
                            conversation.matchScore >= 80 ? 'text-blue-600 bg-blue-100' :
                            conversation.matchScore >= 70 ? 'text-yellow-600 bg-yellow-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {conversation.matchScore}%
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {conversation.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {searchTerm ? 'No conversations found' : 'No conversations yet'}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {searchTerm 
                        ? 'Try adjusting your search terms.'
                        : 'Start matching with people to begin conversations!'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai-suggestions' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Conversation Helpers</h3>
                <p className="text-gray-600">
                  Get personalized suggestions for starting conversations, follow-up questions, and connection ideas.
                </p>
              </div>
              
              {userProfile && (
                <AISuggestions
                  currentUser={userProfile}
                  onUseSuggestion={(suggestion: string) => {
                    console.log('Using suggestion:', suggestion);
                    // In a real app, this could copy to clipboard or open a new message
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'new-chat' && (
            <div className="p-6">
              <div className="text-center py-12">
                <FiPlus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Start a New Conversation</h3>
                <p className="mt-2 text-gray-600 mb-6">
                  Discover new people and start meaningful conversations with AI-powered suggestions.
                </p>
                <button
                  onClick={() => router.push('/discover')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Go to Discover
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
