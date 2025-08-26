import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { calculateCompatibilityScore } from '@/services/matchingService';
import { FiUser, FiSearch, FiFilter, FiMapPin, FiTarget, FiHeart, FiMessageSquare, FiEye, FiUserMinus, FiFlag } from 'react-icons/fi';

interface ProfileDiscoveryProps {
  currentUser: UserProfile;
  onViewProfile: (profile: UserProfile) => void;
  onStartConversation: (profile: UserProfile) => void;
  onLikeProfile: (profile: UserProfile) => void;
  onUnfollowProfile: (profile: UserProfile) => void;
  onReportProfile: (profile: UserProfile) => void;
  onBlockUser: (profile: UserProfile) => void;
}

interface FilterOptions {
  values: string[];
  goals: string[];
  communication: string[];
  timezone: string;
  searchTerm: string;
}

export default function ProfileDiscovery({
  currentUser,
  onViewProfile,
  onStartConversation,
  onLikeProfile,
  onUnfollowProfile,
  onReportProfile,
  onBlockUser,
}: ProfileDiscoveryProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    values: [],
    goals: [],
    communication: [],
    timezone: '',
    searchTerm: '',
  });

  // Mock data - in real app, this would come from API
  const mockProfiles: UserProfile[] = [
    {
      id: 'user1',
      email: 'emma@example.com',
      name: 'Emma Rodriguez',
      bio: 'Software engineer passionate about building inclusive technology and mentoring junior developers. I love collaborating on open-source projects and helping others grow in their careers.',
      age: '28',
      location: 'San Francisco, CA',
      occupation: 'Senior Software Engineer',
      education: 'Master\'s in Computer Science',
      interests: ['Open Source', 'Mentoring', 'Diversity in Tech', 'Machine Learning'],
      socialProfiles: [],
      values: {
        coreValues: ['Growth', 'Empathy', 'Innovation', 'Collaboration'],
        personalGoals: ['Mentorship', 'Learning', 'Building Inclusive Tech', 'Career Development'],
        preferredCommunication: ['Video Calls', 'Text Chat', 'In-Person Meetings'],
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
        messageSource: 'anyone',
        showOnlineStatus: true,
        showReadReceipts: true,
        showTypingIndicators: true,
        allowProfileViews: true,
      },
    },
    {
      id: 'user2',
      email: 'michael@example.com',
      name: 'Michael Chang',
      bio: 'Product designer focused on creating user-centered experiences that solve real problems. I believe in designing with empathy and creating solutions that truly make a difference in people\'s lives.',
      age: '32',
      location: 'New York, NY',
      occupation: 'Senior Product Designer',
      education: 'Bachelor\'s in Design',
      interests: ['User Research', 'Design Systems', 'Accessibility', 'Social Impact'],
      socialProfiles: [],
      values: {
        coreValues: ['Authenticity', 'Collaboration', 'Purpose', 'Empathy'],
        personalGoals: ['Professional Networking', 'Support', 'Design Leadership', 'Social Impact'],
        preferredCommunication: ['In-Person Meetings', 'Video Calls', 'Collaborative Workshops'],
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
        messageSource: 'anyone',
        showOnlineStatus: true,
        showReadReceipts: true,
        showTypingIndicators: true,
        allowProfileViews: true,
      },
    },
    {
      id: 'user3',
      email: 'jessica@example.com',
      name: 'Jessica Kim',
      bio: 'Marketing strategist helping brands build authentic connections with their audiences. I specialize in data-driven storytelling and creating campaigns that resonate on a human level.',
      age: '29',
      location: 'Chicago, IL',
      occupation: 'Marketing Director',
      education: 'MBA in Marketing',
      interests: ['Data Analytics', 'Storytelling', 'Brand Strategy', 'Digital Marketing'],
      socialProfiles: [],
      values: {
        coreValues: ['Connection', 'Authenticity', 'Balance', 'Innovation'],
        personalGoals: ['Professional Networking', 'Collaboration', 'Industry Leadership', 'Creative Growth'],
        preferredCommunication: ['Text Chat', 'Voice Calls', 'Video Meetings'],
        availability: {
          timezone: 'CST',
          preferredTimes: ['Afternoon', 'Evening'],
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
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfiles(mockProfiles);
      setFilteredProfiles(mockProfiles);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, profiles]);

  const applyFilters = () => {
    let filtered = profiles.filter(profile => profile.id !== currentUser.id);

    // Search term filter
    if (filters.searchTerm) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (profile.bio && profile.bio.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Values filter
    if (filters.values.length > 0) {
      filtered = filtered.filter(profile =>
        filters.values.some(value => profile.values.coreValues.includes(value))
      );
    }

    // Goals filter
    if (filters.goals.length > 0) {
      filtered = filtered.filter(profile =>
        filters.goals.some(goal => profile.values.personalGoals.includes(goal))
      );
    }

    // Communication filter
    if (filters.communication.length > 0) {
      filtered = filtered.filter(profile =>
        filters.communication.some(method => profile.values.preferredCommunication.includes(method))
      );
    }

    // Timezone filter
    if (filters.timezone) {
      filtered = filtered.filter(profile => profile.values.availability.timezone === filters.timezone);
    }

    setFilteredProfiles(filtered);
  };

  const getCompatibilityScore = (profile: UserProfile) => {
    try {
      const compatibility = calculateCompatibilityScore(currentUser, profile);
      return compatibility.overallScore;
    } catch (error) {
      console.error('Error calculating compatibility score:', error);
      return 0; // Return 0 if calculation fails
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
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
          <h2 className="text-2xl font-bold text-gray-900">Discover People</h2>
          <p className="text-gray-600">Find meaningful connections based on your interests</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FiFilter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, bio, or interests..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Values Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Core Values</label>
              <div className="space-y-2">
                {['Authenticity', 'Growth', 'Connection', 'Empathy', 'Innovation', 'Collaboration', 'Balance', 'Purpose'].map((value) => (
                  <label key={value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.values.includes(value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, values: [...filters.values, value] });
                        } else {
                          setFilters({ ...filters, values: filters.values.filter(v => v !== value) });
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personal Goals</label>
              <div className="space-y-2">
                {['Professional Networking', 'Mentorship', 'Friendship', 'Collaboration', 'Learning', 'Support'].map((goal) => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.goals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, goals: [...filters.goals, goal] });
                        } else {
                          setFilters({ ...filters, goals: filters.goals.filter(g => g !== goal) });
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Communication Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Communication</label>
              <div className="space-y-2">
                {['Video Calls', 'Text Chat', 'Voice Calls', 'In-Person Meetings'].map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.communication.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, communication: [...filters.communication, method] });
                        } else {
                          setFilters({ ...filters, communication: filters.communication.filter(c => c !== method) });
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timezone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={filters.timezone}
                onChange={(e) => setFilters({ ...filters, timezone: e.target.value })}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Timezones</option>
                <option value="PST">PST</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiTarget className="h-4 w-4" />
            <span>Sorted by compatibility</span>
          </div>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const compatibilityScore = getCompatibilityScore(profile);
            return (
              <div
                key={profile.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Profile Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <FiMapPin className="h-3 w-3" />
                          <span>{profile.values.availability.timezone}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(compatibilityScore)}`}>
                      {compatibilityScore}%
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {profile.bio || 'No bio provided'}
                  </p>

                  {/* Values & Goals */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Core Values
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {profile.values.coreValues.slice(0, 3).map((value) => (
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
                        {profile.values.personalGoals.slice(0, 2).map((goal) => (
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
                      onClick={() => onViewProfile(profile)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FiEye className="inline h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => onStartConversation(profile)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <FiMessageSquare className="inline h-4 w-4 mr-1" />
                      Message
                    </button>
                    <button
                      onClick={() => onLikeProfile(profile)}
                      className="px-4 py-2 text-pink-500 hover:text-pink-700 transition-colors duration-200"
                    >
                      <FiHeart className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Secondary Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUnfollowProfile(profile)}
                      className="flex-1 bg-red-50 text-red-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200"
                    >
                      <FiUserMinus className="inline h-3 w-3 mr-1" />
                      Unfollow
                    </button>
                    <button
                      onClick={() => onReportProfile(profile)}
                      className="flex-1 bg-yellow-50 text-yellow-600 px-2 py-1.5 rounded-md text-xs font-medium hover:bg-yellow-100 transition-colors duration-200 border border-yellow-200"
                    >
                      <FiFlag className="inline h-3 w-3 mr-1" />
                      Report
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to block ${profile.name}? This will:\n\n• Remove any existing connection\n• Archive all conversations\n• Prevent future interactions\n• They won't be able to see your profile or send messages\n\nThis action cannot be easily undone.`)) {
                          onBlockUser(profile);
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
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No profiles found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search criteria or filters to find more people.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 