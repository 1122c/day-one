import { useState, useEffect } from 'react';
import { UserProfile, Match } from '@/types/user';
import { calculateCompatibilityScore } from '@/services/matchingService';
import { FiHeart, FiMessageSquare, FiUser, FiTarget, FiClock, FiStar, FiUserMinus, FiFlag } from 'react-icons/fi';

interface MatchDashboardProps {
  currentUser: UserProfile;
  matches: Match[];
  onAcceptMatch: (matchId: string) => void;
  onRejectMatch: (matchId: string) => void;
  onStartConversation: (matchId: string) => void;
  onUnfollowProfile: (profile: UserProfile) => void;
  onReportProfile: (profile: UserProfile) => void;
  onBlockUser: (profile: UserProfile) => void;
}

interface MatchWithProfile extends Match {
  matchedUser: UserProfile;
}

export default function MatchDashboard({
  currentUser,
  matches,
  onAcceptMatch,
  onRejectMatch,
  onStartConversation,
  onUnfollowProfile,
  onReportProfile,
  onBlockUser,
}: MatchDashboardProps) {
  const [matchDetails, setMatchDetails] = useState<MatchWithProfile[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the matched user profiles here. mock data for now.
    const loadMatchDetails = async () => {
      const mockProfiles: UserProfile[] = [
        {
          id: 'user2',
          email: 'alex@example.com',
          name: 'Alex Chen',
          bio: 'Product manager passionate about building meaningful products that help people connect and grow together.',
          age: '28',
          location: 'San Francisco, CA',
          occupation: 'Product Manager',
          education: 'MBA, Stanford University',
          interests: ['Product Strategy', 'User Research', 'Team Leadership'],
          socialProfiles: [],
          values: {
            coreValues: ['Growth', 'Connection', 'Innovation'],
            personalGoals: ['Professional Networking', 'Mentorship'],
            preferredCommunication: ['Video Calls', 'Text Chat'],
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
          id: 'user3',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          bio: 'UX designer focused on creating inclusive and accessible digital experiences that bring people together.',
          age: '32',
          location: 'New York, NY',
          occupation: 'UX Designer',
          education: 'BFA, Parsons School of Design',
          interests: ['User Experience', 'Accessibility', 'Design Systems'],
          socialProfiles: [],
          values: {
            coreValues: ['Empathy', 'Authenticity', 'Collaboration'],
            personalGoals: ['Learning', 'Support'],
            preferredCommunication: ['Video Calls', 'In-Person Meetings'],
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

      const details: MatchWithProfile[] = matches.map((match) => {
        const matchedUserId = match.userIds.find(id => id !== currentUser.id);
        const matchedUser = mockProfiles.find(p => p.id === matchedUserId) || mockProfiles[0];
        return { ...match, matchedUser };
      });

      setMatchDetails(details);
      setLoading(false);
    };

    loadMatchDetails();
  }, [matches, currentUser.id]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Matches</h2>
          <p className="text-gray-600">Discover meaningful connections based on your values and goals</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FiHeart className="h-4 w-4" />
          <span>{matches.length} potential connections</span>
        </div>
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchDetails.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Match Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{match.matchedUser.name}</h3>
                    <p className="text-sm text-gray-500">Product Manager</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(match.matchScore)}`}>
                  {match.matchScore}%
                </div>
              </div>

              {/* Compatibility Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Values Alignment</span>
                  <span className="font-medium">{match.compatibilityFactors.valuesAlignment}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.valuesAlignment}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Goals Alignment</span>
                  <span className="font-medium">{match.compatibilityFactors.goalsAlignment}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.goalsAlignment}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Communication</span>
                  <span className="font-medium">{match.compatibilityFactors.communicationStyle}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${match.compatibilityFactors.communicationStyle}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Match Reason */}
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {match.matchReason}
              </p>

              {/* Shared Values & Goals */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Shared Values
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.matchedUser.values.coreValues
                      .filter(value => currentUser.values.coreValues.includes(value))
                      .slice(0, 3)
                      .map((value) => (
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
                    Shared Goals
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {match.matchedUser.values.personalGoals
                      .filter(goal => currentUser.values.personalGoals.includes(goal))
                      .slice(0, 2)
                      .map((goal) => (
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
            <div className="px-6 pb-6">
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => {
                    console.log('Accept button clicked for match:', match.id);
                    onAcceptMatch(match.id);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  <FiHeart className="inline h-4 w-4 mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => {
                    console.log('Message button clicked for match:', match.id);
                    onStartConversation(match.id);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  <FiMessageSquare className="inline h-4 w-4 mr-1" />
                  Message
                </button>
                <button
                  onClick={() => {
                    console.log('Reject button clicked for match:', match.id);
                    onRejectMatch(match.id);
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <FiStar className="h-4 w-4" />
                </button>
              </div>
              
              {/* Secondary Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Unfollow button clicked for profile:', match.matchedUser.name);
                    onUnfollowProfile(match.matchedUser);
                  }}
                  className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200"
                >
                  <FiUserMinus className="inline h-3 w-3 mr-1" />
                  Unfollow
                </button>
                <button
                  onClick={() => {
                    console.log('Report button clicked for profile:', match.matchedUser.name);
                    onReportProfile(match.matchedUser);
                  }}
                  className="flex-1 bg-yellow-50 text-yellow-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-yellow-100 transition-colors duration-200 border border-yellow-200"
                >
                  <FiFlag className="inline h-3 w-3 mr-1" />
                  Report
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to block ${match.matchedUser.name}? This will:\n\n• Remove any existing connection\n• Archive all conversations\n• Prevent future interactions\n• They won't be able to see your profile or send messages\n\nThis action cannot be easily undone.`)) {
                      console.log('Block button clicked for profile:', match.matchedUser.name);
                      onBlockUser(match.matchedUser);
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

      {/* Empty State */}
      {matchDetails.length === 0 && (
        <div className="text-center py-12">
          <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matches yet</h3>
          <p className="mt-2 text-gray-600">
            We're working on finding meaningful connections for you. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
} 