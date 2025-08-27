import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import { FiUsers, FiPlus, FiUserMinus, FiFlag, FiMessageSquare, FiEye, FiX, FiClock } from 'react-icons/fi';
import { UserProfile } from '@/types/user';
import { blockUser } from '@/services/firebaseService';
import ConnectionRequests from '@/components/connections/ConnectionRequests';

export default function ConnectionsPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

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

  const handleBlockUser = async (profile: UserProfile) => {
    try {
      if (!userProfile) return;
      
      console.log('Blocking user:', profile.name);
      await blockUser(userProfile.id, profile.id, 'User blocked from connections page');
      
      alert(`${profile.name} has been blocked successfully.`);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleViewProfile = (connection: UserProfile) => {
    setSelectedConnection(connection);
    setShowProfileModal(true);
  };

  const calculateOverlap = (connection: UserProfile) => {
    if (!userProfile) return { values: 0, goals: 0, interests: 0, overall: 0 };

    // Calculate values overlap
    const sharedValues = userProfile.values.coreValues.filter(value => 
      connection.values.coreValues.includes(value)
    );
    const valuesOverlap = userProfile.values.coreValues.length > 0 
      ? (sharedValues.length / userProfile.values.coreValues.length) * 100 
      : 0;

    // Calculate goals overlap
    const sharedGoals = userProfile.values.personalGoals.filter(goal => 
      connection.values.personalGoals.includes(goal)
    );
    const goalsOverlap = userProfile.values.personalGoals.length > 0 
      ? (sharedGoals.length / userProfile.values.personalGoals.length) * 100 
      : 0;

    // Calculate interests overlap
    const userInterests = userProfile.interests || [];
    const connectionInterests = connection.interests || [];
    const sharedInterests = userInterests.filter(interest => 
      connectionInterests.includes(interest)
    );
    const interestsOverlap = userInterests.length > 0 
      ? (sharedInterests.length / userInterests.length) * 100 
      : 0;

    // Calculate overall overlap (weighted average)
    const overallOverlap = Math.round((valuesOverlap * 0.4 + goalsOverlap * 0.4 + interestsOverlap * 0.2));

    return {
      values: Math.round(valuesOverlap),
      goals: Math.round(goalsOverlap),
      interests: Math.round(interestsOverlap),
      overall: overallOverlap,
      sharedValues,
      sharedGoals,
      sharedInterests
    };
  };

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
        personalGoals: ['Mentorship', 'Technical Leadership'],
        preferredCommunication: ['Video Calls', 'Text Chat'],
        availability: {
          timezone: 'PST',
          preferredTimes: ['Evening', 'Weekends'],
        },
      },
      interests: ['Software Engineering', 'Mentoring', 'System Design'],
      socialProfiles: [],
      age: '30',
      location: 'San Francisco, CA',
      occupation: 'Senior Software Engineer',
      education: 'BS Computer Science',
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
      email: 'sarah@example.com',
      name: 'Sarah Johnson',
      bio: 'UX designer focused on creating inclusive and accessible digital experiences.',
      values: {
        coreValues: ['Empathy', 'Accessibility', 'User-Centered Design'],
        personalGoals: ['Design Leadership', 'Social Impact'],
        preferredCommunication: ['Video Calls', 'In-Person Meetings'],
        availability: {
          timezone: 'EST',
          preferredTimes: ['Morning', 'Afternoon'],
        },
      },
      interests: ['User Experience', 'Accessibility', 'Design Systems'],
      socialProfiles: [],
      age: '28',
      location: 'New York, NY',
      occupation: 'UX Designer',
      education: 'BFA Design',
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Connections</h1>
          <p className="mt-2 text-gray-600">Manage your professional and personal connections</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('connections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connections'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUsers className="inline h-4 w-4 mr-2" />
                Connections
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {mockConnections.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiClock className="inline h-4 w-4 mr-2" />
                Requests
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'connections' ? (
              <div>
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
                              onClick={() => handleViewProfile(connection)}
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
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to block ${connection.name}? This will:\n\n• Remove any existing connection\n• Archive all conversations\n• Prevent future interactions\n• They won't be able to see your profile or send messages\n\nThis action cannot be easily undone.`)) {
                                  handleBlockUser(connection);
                                }
                              }}
                              className="flex-1 bg-gray-50 text-gray-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                            >
                              <FiUserMinus className="inline h-3 w-3 mr-1" />
                              Block
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <ConnectionRequests 
                  currentUser={userProfile}
                  onViewProfile={handleViewProfile}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiUsers className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedConnection.name}</h2>
                    <p className="text-gray-600">{selectedConnection.occupation}</p>
                    <p className="text-sm text-gray-500">{selectedConnection.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Compatibility Overlap */}
              {userProfile && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiUsers className="h-5 w-5 mr-2 text-indigo-600" />
                    Compatibility with You
                  </h3>
                  {(() => {
                    const overlap = calculateOverlap(selectedConnection);
                    return (
                      <div className="space-y-4">
                        {/* Overall Match */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Overall Match</span>
                            <span className="font-bold text-indigo-600">{overlap.overall}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${overlap.overall}%` }}
                            />
                          </div>
                        </div>

                        {/* Values Alignment */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Values Alignment</span>
                            <span className="font-bold text-blue-600">{overlap.values}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${overlap.values}%` }}
                            />
                          </div>
                        </div>

                        {/* Goals Alignment */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Goals Alignment</span>
                            <span className="font-bold text-green-600">{overlap.goals}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${overlap.goals}%` }}
                            />
                          </div>
                        </div>

                        {/* Interests Overlap */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Interests Overlap</span>
                            <span className="font-bold text-purple-600">{overlap.interests}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${overlap.interests}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Bio */}
              {selectedConnection.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700">{selectedConnection.bio}</p>
                </div>
              )}

              {/* Core Values */}
              {selectedConnection.values.coreValues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.values.coreValues.map((value) => {
                      const isShared = userProfile && userProfile.values.coreValues.includes(value);
                      return (
                        <span
                          key={value}
                          className={`px-3 py-2 rounded-full text-sm font-medium ${
                            isShared 
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {value}
                          {isShared && <span className="ml-1 text-xs">✓</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personal Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedConnection.values.personalGoals.map((goal) => {
                    const isShared = userProfile && userProfile.values.personalGoals.includes(goal);
                    return (
                      <span
                        key={goal}
                        className={`px-3 py-2 rounded-full text-sm font-medium ${
                          isShared 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {goal}
                        {isShared && <span className="ml-1 text-xs">✓</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Communication Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedConnection.values.preferredCommunication.map((method) => (
                    <span
                      key={method}
                      className="px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              {selectedConnection.interests && selectedConnection.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.interests.map((interest) => {
                      const isShared = userProfile && userProfile.interests && userProfile.interests.includes(interest);
                      return (
                        <span
                          key={interest}
                          className={`px-3 py-2 rounded-full text-sm font-medium ${
                            isShared 
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {interest}
                          {isShared && <span className="ml-1 text-xs">✓</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedConnection.education && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  <p className="text-gray-700">{selectedConnection.education}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/messages?user=${selectedConnection.id}`)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  <FiMessageSquare className="inline h-4 w-4 mr-2" />
                  Send Message
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
