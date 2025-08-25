import { useState, useEffect } from 'react';
import { UserProfile, Match } from '@/types/user';
import { generateMatchSuggestions, generateInitialMessage, generateFollowUpQuestions } from '@/services/matchingService';
import { generateIceBreakers, generateConversationStarters, generateGrowthSuggestions } from '@/services/conversationService';
import { FiZap, FiMessageSquare, FiTarget, FiRefreshCw, FiCopy, FiCheck, FiPlus, FiX } from 'react-icons/fi';

interface AISuggestionsProps {
  currentUser: UserProfile;
  match?: Match;
  matchedUser?: UserProfile;
  conversationHistory?: string[];
  onUseSuggestion: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  type: 'conversation_starter' | 'follow_up' | 'profile_tip' | 'connection_idea';
  content: string;
  category: string;
  used: boolean;
  timestamp: Date;
}

export default function AISuggestions({
  currentUser,
  match,
  matchedUser,
  conversationHistory = [],
  onUseSuggestion,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ice-breakers' | 'discussion-starters' | 'profile' | 'connections'>('ice-breakers');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  useEffect(() => {
    console.log("🔍 AISuggestions useEffect triggered:", {
      hasMatch: !!match,
      hasMatchedUser: !!matchedUser,
      hasCurrentUser: !!currentUser,
      currentUserData: currentUser ? {
        name: currentUser.name,
        hasValues: !!currentUser.values,
        coreValues: currentUser.values?.coreValues,
        personalGoals: currentUser.values?.personalGoals,
        preferredCommunication: currentUser.values?.preferredCommunication
      } : null
    });
    
    // Only generate suggestions if we don't already have them and have a current user
    if (currentUser && suggestions.length === 0 && !loading) {
      console.log("🚀 Generating initial suggestions");
      generateSuggestions();
    } else if (currentUser && suggestions.length > 0) {
      console.log("✅ Already have suggestions, skipping generation");
    }
  }, [match?.id, matchedUser?.id, conversationHistory.length, currentUser?.id]); // Use stable IDs instead of objects

  // Monitor suggestions state changes
  useEffect(() => {
    console.log("📊 Suggestions state changed:", {
      count: suggestions.length,
      loading,
      generationCount
    });
    
    // If we have suggestions and we're not loading, don't generate more
    if (suggestions.length > 0 && !loading && generationCount > 0) {
      console.log("✅ Already have suggestions, skipping regeneration");
      return;
    }
  }, [suggestions, loading, generationCount]);

  const generateSuggestions = async (isNewGeneration: boolean = false) => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log("🚫 generateSuggestions called while already loading, skipping");
      return;
    }

    console.log("🚀 generateSuggestions called:", {
      hasMatch: !!match,
      hasMatchedUser: !!matchedUser,
      hasCurrentUser: !!currentUser,
      willCallMatchSpecific: !!(match && matchedUser),
      willCallGeneral: !!(currentUser && (!match || !matchedUser))
    });
    
    // For now, always use general suggestions to ensure they work
    // TODO: Fix match-specific suggestions later
    if (currentUser) {
      console.log("🌟 Calling generateGeneralSuggestions for general use");
      await generateGeneralSuggestions(isNewGeneration);
    }
    else {
      console.log("❌ No conditions met for generating suggestions");
      return;
    }
  };

  const generateMatchSpecificSuggestions = async (isNewGeneration: boolean = false) => {
    if (!match || !matchedUser) return;

    setLoading(true);
    try {
      const [matchSuggestions, initialMessage, followUpQuestions] = await Promise.all([
        generateMatchSuggestions(currentUser, matchedUser),
        generateInitialMessage(currentUser, matchedUser),
        conversationHistory.length > 0 
          ? generateFollowUpQuestions(currentUser, matchedUser, conversationHistory)
          : Promise.resolve([]),
      ]);

      const newSuggestions: Suggestion[] = [
        // Conversation starters
        {
          id: `initial-${Date.now().toString()}-${Math.random().toString()}`,
          type: 'conversation_starter',
          content: initialMessage,
          category: 'First Message',
          used: false,
          timestamp: new Date(),
        },
        ...followUpQuestions.map((question, index) => ({
          id: `followup-${Date.now().toString()}-${index}-${Math.random().toString()}`,
          type: 'follow_up' as const,
          content: question,
          category: 'Follow-up Question',
          used: false,
          timestamp: new Date(),
        })),
        // Match suggestions
        ...matchSuggestions.map((suggestion, index) => ({
          id: `suggestion-${Date.now().toString()}-${index}-${Math.random().toString()}`,
          type: 'connection_idea' as const,
          content: suggestion,
          category: 'Connection Idea',
          used: false,
          timestamp: new Date(),
        })),
        // Profile tips
        {
          id: `profile-1-${Date.now().toString()}-${Math.random().toString()}`,
          type: 'profile_tip',
          content: 'Consider adding more specific examples of your work or interests to make your profile more engaging.',
          category: 'Profile Enhancement',
          used: false,
          timestamp: new Date(),
        },
        {
          id: `profile-2-${Date.now().toString()}-${Math.random().toString()}`,
          type: 'profile_tip',
          content: 'Your core values are well-defined. Try adding how you live these values in your daily life.',
          category: 'Profile Enhancement',
          used: false,
          timestamp: new Date(),
        },
      ];

      if (isNewGeneration) {
        // Add new suggestions to existing ones
        setSuggestions(prev => [...prev, ...newSuggestions]);
        setGenerationCount(prev => prev + 1);
      } else {
        // Replace all suggestions (initial load)
        setSuggestions(newSuggestions);
        setGenerationCount(1);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUpSuggestions = async () => {
    if (!match || !matchedUser || conversationHistory.length === 0) return;

    setLoading(true);
    try {
      const followUpQuestions = await generateFollowUpQuestions(currentUser, matchedUser, conversationHistory);
      
      const newFollowUpSuggestions: Suggestion[] = followUpQuestions.map((question, index) => ({
        id: `followup-new-${Date.now().toString()}-${index}-${Math.random().toString()}`,
        type: 'follow_up' as const,
        content: question,
        category: 'Follow-up Question',
        used: false,
        timestamp: new Date(),
      }));

      setSuggestions(prev => [...prev, ...newFollowUpSuggestions]);
      setGenerationCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating follow-up suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGeneralSuggestions = async (isNewGeneration: boolean = false) => {
    console.log("🌟 generateGeneralSuggestions called with currentUser:", currentUser);
    if (!currentUser) return;
    
    // Double-check loading state
    if (loading) {
      console.log("🚫 generateGeneralSuggestions called while already loading, skipping");
      return;
    }

    setLoading(true);
    
    // Add a timeout to prevent loading state from getting stuck
    const loadingTimeout = setTimeout(() => {
      console.log("⏰ Loading timeout reached, resetting loading state");
      setLoading(false);
    }, 30000); // 30 second timeout
    
    try {
      // For general suggestions, create a flexible mock profile that works for any conversation
      const mockProfile: UserProfile = {
        id: 'general-conversation',
        name: 'New Connection',
        email: 'new@connection.com',
        bio: 'Someone you\'d like to start a conversation with',
        age: '25',
        location: 'Various locations',
        occupation: 'Various professions',
        education: 'Various backgrounds',
        interests: ['Networking', 'Learning', 'Growth', 'Connection'],
        socialProfiles: [],
        values: {
          coreValues: ['Growth', 'Connection', 'Authenticity', 'Learning'],
          personalGoals: ['Build relationships', 'Learn from others', 'Share experiences', 'Network'],
          preferredCommunication: ['Respectful', 'Engaging', 'Professional', 'Friendly'],
          availability: {
            timezone: 'Various',
            preferredTimes: ['Flexible'],
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

      console.log("🤖 About to call conversation service functions");
      console.log("🤖 Current user data:", {
        name: currentUser.name,
        hasValues: !!currentUser.values,
        coreValues: currentUser.values?.coreValues,
        personalGoals: currentUser.values?.personalGoals,
        bio: currentUser.bio
      });
      console.log("🤖 Mock profile data:", {
        name: mockProfile.name,
        bio: mockProfile.bio
      });
      
      // Generate AI-powered suggestions using the conversation service
      const [iceBreakers, conversationStarters, growthSuggestions] = await Promise.all([
        generateIceBreakers(currentUser, mockProfile),
        generateConversationStarters(currentUser, mockProfile),
        generateGrowthSuggestions(currentUser, mockProfile),
      ]);
      console.log("✅ Conversation service calls completed:", {
        iceBreakersCount: iceBreakers.length,
        conversationStartersCount: conversationStarters.length,
        growthSuggestionsCount: growthSuggestions.length
      });
      
      console.log("📝 Raw AI responses:", {
        iceBreakers,
        conversationStarters,
        growthSuggestions
      });

      // Validate that we got actual content from the AI
      if (!iceBreakers.length && !conversationStarters.length && !growthSuggestions.length) {
        console.error("❌ All AI responses are empty - this suggests an API issue");
        throw new Error("AI responses are empty");
      }

      const newSuggestions: Suggestion[] = [
        // Ice Breakers from AI
        ...iceBreakers.map((content, index) => ({
          id: `icebreaker-${Date.now().toString()}-${index}-${Math.random().toString()}`,
          type: 'conversation_starter' as const,
          content,
          category: 'Ice Breaker',
          used: false,
          timestamp: new Date(),
        })),
        // Discussion Starters from AI
        ...conversationStarters.map((content, index) => ({
          id: `discussion-${Date.now().toString()}-${index}-${Math.random().toString()}`,
          type: 'follow_up' as const,
          content,
          category: 'Discussion Starter',
          used: false,
          timestamp: new Date(),
        })),
        // Growth suggestions from AI
        ...growthSuggestions.map((content, index) => ({
          id: `growth-${Date.now().toString()}-${index}-${Math.random().toString()}`,
          type: 'connection_idea' as const,
          content,
          category: 'Growth Opportunity',
          used: false,
          timestamp: new Date(),
        })),
        // Profile enhancement tips
        {
          id: `profile-1-${Date.now().toString()}-${Math.random().toString()}`,
          type: 'profile_tip',
          content: 'Consider adding more specific examples of your work or interests to make your profile more engaging.',
          category: 'Profile Enhancement',
          used: false,
          timestamp: new Date(),
        },
        {
          id: `profile-2-${Date.now().toString()}-${Math.random().toString()}`,
          type: 'profile_tip',
          content: 'Your core values are well-defined. Try adding how you live these values in your daily life.',
          category: 'Profile Enhancement',
          used: false,
          timestamp: new Date(),
        },
      ];

      console.log("🎯 Created suggestions array:", newSuggestions);
      console.log("🎯 Suggestions breakdown:", {
        conversationStarters: newSuggestions.filter(s => s.type === 'conversation_starter').length,
        followUps: newSuggestions.filter(s => s.type === 'follow_up').length,
        profileTips: newSuggestions.filter(s => s.type === 'profile_tip').length,
        connectionIdeas: newSuggestions.filter(s => s.type === 'connection_idea').length,
        total: newSuggestions.length
      });
      
      if (isNewGeneration) {
        // Add new suggestions to existing ones
        setSuggestions(prev => {
          const newState = [...prev, ...newSuggestions];
          console.log("➕ Added to existing suggestions. New state:", newState.length);
          return newState;
        });
        setGenerationCount(prev => prev + 1);
        console.log("➕ Added to existing suggestions");
      } else {
        // Replace all suggestions (initial load)
        setSuggestions(newSuggestions);
        setGenerationCount(prev => prev + 1);
        console.log("🔄 Replaced all suggestions with", newSuggestions.length, "items");
      }
    } catch (error) {
      console.error('Error generating general suggestions:', error);
      console.error('Error details:', error);
    } finally {
      clearTimeout(loadingTimeout);
      console.log("🏁 Setting loading to false");
      setLoading(false);
    }
  };

  const clearOldSuggestions = () => {
    setSuggestions([]);
    setGenerationCount(0);
  };

  const handleUseSuggestion = (suggestion: Suggestion) => {
    onUseSuggestion(suggestion.content);
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id ? { ...s, used: true } : s
      )
    );
  };

  const handleCopySuggestion = async (suggestion: Suggestion) => {
    try {
      await navigator.clipboard.writeText(suggestion.content);
      setCopiedId(suggestion.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy suggestion:', error);
    }
  };

  const getFilteredSuggestions = () => {
    console.log("🔍 getFilteredSuggestions called with:", {
      totalSuggestions: suggestions.length,
      activeTab,
      showOnlyNew
    });
    
    let filtered = suggestions;
    
    // Sort by recency (newest first)
    filtered = [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (showOnlyNew) {
      filtered = filtered.filter(s => isNewSuggestion(s.timestamp));
    }
    
    const result = (() => {
      switch (activeTab) {
        case 'ice-breakers':
          return filtered.filter(s => s.type === 'conversation_starter');
        case 'discussion-starters':
          return filtered.filter(s => s.type === 'follow_up');
        default:
          return filtered;
      }
    })();
    
    console.log("🔍 Filtered suggestions result:", {
      activeTab,
      resultCount: result.length,
      resultTypes: result.map(s => s.type)
    });
    
    return result;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'ice-breakers':
        return FiMessageSquare;
      case 'discussion-starters':
        return FiMessageSquare;
      default:
        return FiMessageSquare;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'conversation_starter':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'follow_up':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const isNewSuggestion = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    return diffInMinutes < 5; // Consider suggestions "new" if generated within last 5 minutes
  };

  console.log("🎨 AISuggestions render:", {
    loading,
    suggestionsCount: suggestions.length,
    activeTab,
    filteredSuggestionsCount: getFilteredSuggestions().length
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center space-x-2">
          <FiRefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-gray-600">Generating AI suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiZap className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">AI Suggestions</h3>
              {suggestions.length > 0 && (
                <span className="text-xs text-gray-500">{suggestions.length} suggestions available</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {conversationHistory.length > 0 && (
              <button
                onClick={generateFollowUpSuggestions}
                disabled={loading}
                className="flex items-center space-x-1 px-2 py-1.5 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiMessageSquare className="h-3 w-3" />
                <span>Follow-ups</span>
              </button>
            )}
            <button
              onClick={() => generateSuggestions(true)}
              disabled={loading}
              className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-500 text-white text-xs rounded-md hover:bg-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="h-3 w-3" />
              <span>New</span>
            </button>
            <button
              onClick={() => generateSuggestions(false)}
              disabled={loading}
              className="flex items-center space-x-1 px-2 py-1.5 text-indigo-600 hover:text-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className="h-3 w-3" />
            </button>
            {suggestions.length > 0 && (
              <button
                onClick={clearOldSuggestions}
                disabled={loading}
                className="flex items-center space-x-1 px-2 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-6 px-6">
          {[
            { 
              id: 'ice-breakers', 
              label: 'Ice Breakers', 
              count: suggestions.filter(s => s.type === 'conversation_starter').length,
              description: 'Fun questions to start conversations'
            },
            { 
              id: 'discussion-starters', 
              label: 'Discussion Starters', 
              count: suggestions.filter(s => s.type === 'follow_up').length,
              description: 'Deep topics for meaningful conversations'
            },
          ].map((tab) => {
            const Icon = getTabIcon(tab.id);
            return (
              <div key={tab.id} className="relative group">
                <button
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-lg ${
                    activeTab === tab.id
                      ? tab.id === 'ice-breakers' 
                        ? 'border-blue-500 text-blue-700 bg-blue-50'
                        : 'border-purple-500 text-purple-700 bg-purple-50'
                      : tab.id === 'ice-breakers'
                        ? 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                        : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? tab.id === 'ice-breakers'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                  <div className="text-center leading-relaxed">
                    {tab.description}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Suggestions */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setShowOnlyNew(!showOnlyNew)}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
              showOnlyNew 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <FiPlus className="h-4 w-4" />
            <span>{showOnlyNew ? 'Show All' : 'Show New Only'}</span>
          </button>
          <span className="text-sm text-gray-500">
            {showOnlyNew 
              ? `${getFilteredSuggestions().length} new suggestions`
              : `${getFilteredSuggestions().length} total suggestions`
            }
          </span>
        </div>
        <div className="space-y-3">
          {getFilteredSuggestions().map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                suggestion.used ? 'opacity-60' : 'hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {suggestion.category}
                    </span>
                    {suggestion.used && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Used
                      </span>
                    )}
                    {isNewSuggestion(suggestion.timestamp) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        New
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {getRelativeTime(suggestion.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 font-medium">{suggestion.content}</p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <button
                    onClick={() => handleCopySuggestion(suggestion)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    title="Copy suggestion"
                  >
                    {copiedId === suggestion.id ? (
                      <FiCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <FiCopy className="h-4 w-4" />
                    )}
                  </button>
                  {!suggestion.used && (
                    <button
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredSuggestions().length === 0 && (
          <div className="text-center py-8">
            <FiZap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No suggestions available</h3>
            <p className="mt-2 text-gray-600">
              Start a conversation to get personalized ice breakers and discussion starters.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          AI suggestions are personalized based on your profile and conversation context. 
          They help you make meaningful connections and improve your experience.
        </p>
      </div>
    </div>
  );
} 