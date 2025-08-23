import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import MatchDashboard from '@/components/matches/MatchDashboard';
import { UserProfile, Match } from '@/types/user';

export default function MatchesPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
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

  // Mock matches data for now
  const mockMatches: Match[] = [
    {
      id: 'match-1',
      userIds: [userProfile.id, 'user2'],
      matchScore: 85,
      compatibilityFactors: {
        valuesAlignment: 80,
        goalsAlignment: 85,
        communicationStyle: 90,
      },
      matchReason: 'Great potential for connection based on shared values and goals',
      createdAt: new Date(),
      status: 'pending',
    },
    {
      id: 'match-2',
      userIds: [userProfile.id, 'user3'],
      matchScore: 78,
      compatibilityFactors: {
        valuesAlignment: 75,
        goalsAlignment: 80,
        communicationStyle: 85,
      },
      matchReason: 'Strong alignment in communication preferences and growth mindset',
      createdAt: new Date(),
      status: 'accepted',
    },
  ];

  const handleAcceptMatch = (matchId: string) => {
    console.log('Accepting match:', matchId);
    // TODO: Implement match acceptance logic
  };

  const handleRejectMatch = (matchId: string) => {
    console.log('Rejecting match:', matchId);
    // TODO: Implement match rejection logic
  };

  const handleStartConversation = (matchId: string) => {
    console.log('Starting conversation with match:', matchId);
    // TODO: Implement conversation start logic
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Suggested Users</h1>
          <p className="mt-2 text-gray-600">Discover people who align with your values and goals</p>
        </div>
        
        <MatchDashboard 
          currentUser={userProfile}
          matches={mockMatches}
          onAcceptMatch={handleAcceptMatch}
          onRejectMatch={handleRejectMatch}
          onStartConversation={handleStartConversation}
        />
      </div>
    </Layout>
  );
}
