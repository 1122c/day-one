import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import { FiUsers, FiPlus, FiUserMinus, FiFlag, FiMessageSquare, FiEye } from 'react-icons/fi';
import { UserProfile } from '@/types/user';

export default function ConnectionsPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        setLoadingProfile(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Create a basic profile if none exists
          const basicProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
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
                timezone: 'UTC',
                preferredTimes: [],
              },
            },
            privacy: {
              profileVisibility: 'public',
              showEmail: false,
              showSocialProfiles: true,
              allowMessaging: true,
              messageSource: 'connections',
              showOnlineStatus: true,
              showReadReceipts: true,
              showTypingIndicators: true,
              allowProfileViews: true,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUserProfile(basicProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  // Mock connections data
  const mockConnections: UserProfile[] = [
    {
      id: 'conn1',
      email: 'mike@example.com',
      name: 'Mike Rodriguez',
      bio: 'Software engineer passionate about building scalable applications and mentoring junior developers.',
      values: {
        coreValues: ['Innovation', 'Learning', 'Collaboration'],
        personalGoals: ['Technical Leadership', 'Community Building'],
        preferredCommunication: ['Slack', 'Video Calls'],
        availability: {
          timezone: 'PST',
          preferredTimes: ['Evening', 'Weekends'],
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showSocialProfiles: true,
        allowMessaging: true,
        messageSource: 'connections',
        showOnlineStatus: true,
        showReadReceipts: true,
        showTypingIndicators: true,
        allowProfileViews: true,
      },
    },
    {
      id: 'conn2',
      email: 'lisa@example.com',
      name: 'Lisa Thompson',
      bio: 'Marketing strategist focused on growth hacking and building authentic brand relationships.',
      values: {
        coreValues: ['Authenticity', 'Growth', 'Connection'],
        personalGoals: ['Brand Building', 'Networking'],
        preferredCommunication: ['Email', 'LinkedIn'],
        availability: {
          timezone: 'EST',
          preferredTimes: ['Morning', 'Afternoon'],
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showSocialProfiles: true,
        allowMessaging: true,
        messageSource: 'connections',
        showOnlineStatus: true,
        showReadReceipts: true,
        showTypingIndicators: true,
        allowProfileViews: true,
      },
    },
  ];

  const handleUnfollowProfile = async (profile: UserProfile) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to unfollow ${profile.name}? You won't see their updates anymore.`
    );
    
    if (!isConfirmed) return;
    
    try {
      console.log('Unfollowed profile:', profile.name);
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
      console.log('Reported profile:', profile.name);
      alert(`Thank you for reporting ${profile.name}'s profile. Our team will review it within 24 hours.`);
    } catch (error) {
      console.error('Error reporting profile:', error);
      alert('Failed to report profile. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Connections</h1>
          <p className="mt-2 text-gray-600">Manage your professional and personal connections</p>
        </div>
        
        {mockConnections.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start building your network by discovering new people.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/discover')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Discover People
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Connection Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiUsers className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                        <p className="text-sm text-gray-500">Professional Connection</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {connection.bio}
                  </p>

                  {/* Shared Values & Goals */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Core Values
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {connection.values.coreValues.slice(0, 3).map((value) => (
                          <span
                            key={value}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Goals
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {connection.values.personalGoals.slice(0, 2).map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => router.push(`/discover?user=${connection.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FiEye className="inline h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/messages?user=${connection.id}`)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FiMessageSquare className="inline h-4 w-4 mr-1" />
                      Message
                    </button>
                  </div>
                  
                  {/* Secondary Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUnfollowProfile(connection)}
                      className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200"
                    >
                      <FiUserMinus className="inline h-3 w-3 mr-1" />
                      Unfollow
                    </button>
                    <button
                      onClick={() => handleReportProfile(connection)}
                      className="flex-1 bg-yellow-50 text-yellow-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-yellow-100 transition-colors duration-200 border border-yellow-200"
                    >
                      <FiFlag className="inline h-3 w-3 mr-1" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
