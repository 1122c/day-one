import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '@/components/Layout';
import MatchDashboard from '@/components/matches/MatchDashboard';
import { UserProfile, Match } from '@/types/user';
import { useChat } from '@/contexts/ChatContext';

export default function MatchesPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const router = useRouter();
  const { openChat } = useChat();

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
    alert('Match accepted! You can now start a conversation.');
  };

  const handleRejectMatch = (matchId: string) => {
    console.log('Rejecting match:', matchId);
    // TODO: Implement match rejection logic
    alert('Match rejected. You won\'t see this person in your suggestions anymore.');
  };

  const handleStartConversation = (matchId: string) => {
    console.log('Starting conversation with match:', matchId);
    
    // Find the matched user profile
    const match = mockMatches.find(m => m.id === matchId);
    if (match) {
      const matchedUserId = match.userIds.find(id => id !== userProfile.id);
      // For now, we'll use a mock profile since we don't have the actual user data
      // In a real app, you'd fetch the actual user profile
      const mockMatchedUser: UserProfile = {
        id: matchedUserId || 'unknown',
        name: matchedUserId === 'user2' ? 'Alex Chen' : 'Sarah Johnson',
        email: matchedUserId === 'user2' ? 'alex@example.com' : 'sarah@example.com',
        bio: matchedUserId === 'user2' 
          ? 'Product manager passionate about building meaningful products that help people connect and grow together.'
          : 'UX designer focused on creating inclusive and accessible digital experiences that bring people together.',
        age: matchedUserId === 'user2' ? '28' : '32',
        location: matchedUserId === 'user2' ? 'San Francisco, CA' : 'New York, NY',
        occupation: matchedUserId === 'user2' ? 'Product Manager' : 'UX Designer',
        education: matchedUserId === 'user2' ? 'MBA, Stanford University' : 'BFA, Parsons School of Design',
        interests: matchedUserId === 'user2' 
          ? ['Product Strategy', 'User Research', 'Team Leadership']
          : ['User Experience', 'Accessibility', 'Design Systems'],
        socialProfiles: [],
        values: {
          coreValues: matchedUserId === 'user2' 
            ? ['Growth', 'Connection', 'Innovation']
            : ['Empathy', 'Authenticity', 'Collaboration'],
          personalGoals: matchedUserId === 'user2' 
            ? ['Professional Networking', 'Mentorship']
            : ['Learning', 'Support'],
          preferredCommunication: matchedUserId === 'user2' 
            ? ['Video Calls', 'Text Chat']
            : ['Video Calls', 'In-Person Meetings'],
          availability: {
            timezone: matchedUserId === 'user2' ? 'PST' : 'EST',
            preferredTimes: matchedUserId === 'user2' ? ['Evening', 'Weekends'] : ['Morning', 'Afternoon'],
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
      
      // Open the chat with the matched user
      openChat(userProfile, mockMatchedUser, match);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Suggested Users</h1>
          <p className="mt-2 text-gray-600">Discover people who align with your values and goals</p>
        </div>
        
        <MatchDashboard 
          currentUser={userProfile}
          matches={mockMatches}
          onAcceptMatch={handleAcceptMatch}
          onRejectMatch={handleRejectMatch}
          onStartConversation={handleStartConversation}
          onUnfollowProfile={handleUnfollowProfile}
          onReportProfile={handleReportProfile}
        />
      </div>
    </Layout>
  );
}
