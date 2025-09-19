import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import { UserProfile, Match } from '@/types/user';
import { FiMessageSquare, FiUsers, FiSearch, FiClock, FiHeart } from 'react-icons/fi';

export default function MessagesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<Match[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    loadUserProfile();
  }, [user, loading, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setLoadingProfile(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Create a default profile if none exists
        const defaultProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          bio: '',
          age: '0',
          location: '',
          occupation: '',
          education: '',
          interests: [],
          socialProfiles: [],
          values: {
            coreValues: [],
            personalGoals: [],
            preferredCommunication: [],
            availability: {
              timezone: '',
              preferredTimes: [],
            },
          },
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
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Mock conversations data - in a real app, this would come from Firebase
  useEffect(() => {
    if (userProfile) {
      const mockConversations: Match[] = [
        {
          id: 'conv-1',
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
          id: 'conv-2',
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
          id: 'conv-3',
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
      setConversations(mockConversations);
    }
  }, [userProfile]);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    return conversation.matchReason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (loading || loadingProfile) {
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
          <p className="text-gray-600 mb-6">Please complete your profile to access messages.</p>
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <FiMessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-2 sm:mr-3" />
                Messages & Conversations
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Continue your conversations and build meaningful connections
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/discover')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center text-sm"
              >
                <FiUsers className="h-4 w-4 mr-2" />
                Find New People
              </button>
            </div>
          </div>
        </div>



        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  // In a real app, this would open the chat interface
                  console.log('Opening conversation:', conversation.id);
                  alert('Chat interface would open here in a real app');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiUsers className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Match #{conversation.id}
                        </h3>
                        <p className="text-sm text-gray-600">{conversation.matchReason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FiClock className="h-4 w-4 mr-1" />
                        {conversation.createdAt.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FiHeart className="h-4 w-4 mr-1" />
                        {conversation.matchScore}% match
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(conversation.status)}`}>
                      {getStatusLabel(conversation.status)}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {conversation.compatibilityFactors.valuesAlignment}% values
                    </div>
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
              <p className="mt-2 text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Start matching with people to begin conversations!'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/discover')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Discover People
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
