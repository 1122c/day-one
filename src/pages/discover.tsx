import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import ProfileDiscovery from '@/components/discovery/ProfileDiscovery';
import MatchDashboard from '@/components/matches/MatchDashboard';
import { UserProfile, Match } from '@/types/user';
import { FiUsers, FiSearch, FiHeart, FiMessageSquare } from 'react-icons/fi';

export default function DiscoverPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');
  const [matches, setMatches] = useState<Match[]>([]);
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
          setUserProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  if (!userProfile) {
    router.push('/');
    return null;
  }

  const handleViewProfile = (profile: UserProfile) => {
    // In a real app, this would navigate to a profile view page
    console.log('Viewing profile:', profile.name);
  };

  const handleStartConversation = (profile: UserProfile) => {
    // In a real app, this would start a conversation
    console.log('Starting conversation with:', profile.name);
  };

  const handleLikeProfile = (profile: UserProfile) => {
    // In a real app, this would like the profile
    console.log('Liked profile:', profile.name);
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
    </Layout>
  );
} 