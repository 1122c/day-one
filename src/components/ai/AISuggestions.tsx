import { useState, useEffect } from 'react';
import { UserProfile, Match } from '@/types/user';
import { generateMatchSuggestions, generateInitialMessage, generateFollowUpQuestions } from '@/services/matchingService';
import { FiZap, FiMessageSquare, FiTarget, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';

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
  const [activeTab, setActiveTab] = useState<'conversation' | 'profile' | 'connections'>('conversation');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (match && matchedUser) {
      generateSuggestions();
    }
  }, [match, matchedUser, conversationHistory]);

  const generateSuggestions = async () => {
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
          id: 'initial-1',
          type: 'conversation_starter',
          content: initialMessage,
          category: 'First Message',
          used: false,
        },
        ...followUpQuestions.map((question, index) => ({
          id: `followup-${index}`,
          type: 'follow_up' as const,
          content: question,
          category: 'Follow-up Question',
          used: false,
        })),
        // Match suggestions
        ...matchSuggestions.map((suggestion, index) => ({
          id: `suggestion-${index}`,
          type: 'connection_idea' as const,
          content: suggestion,
          category: 'Connection Idea',
          used: false,
        })),
        // Profile tips
        {
          id: 'profile-1',
          type: 'profile_tip',
          content: 'Consider adding more specific examples of your work or interests to make your profile more engaging.',
          category: 'Profile Enhancement',
          used: false,
        },
        {
          id: 'profile-2',
          type: 'profile_tip',
          content: 'Your core values are well-defined. Try adding how you live these values in your daily life.',
          category: 'Profile Enhancement',
          used: false,
        },
      ];

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
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
    switch (activeTab) {
      case 'conversation':
        return suggestions.filter(s => 
          s.type === 'conversation_starter' || s.type === 'follow_up'
        );
      case 'profile':
        return suggestions.filter(s => s.type === 'profile_tip');
      case 'connections':
        return suggestions.filter(s => s.type === 'connection_idea');
      default:
        return suggestions;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'conversation':
        return FiMessageSquare;
      case 'profile':
        return FiTarget;
      case 'connections':
        return FiZap;
      default:
        return FiZap;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'conversation_starter':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'follow_up':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'profile_tip':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'connection_idea':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">AI Suggestions</h3>
          </div>
          <button
            onClick={generateSuggestions}
            className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'conversation', label: 'Conversation', count: suggestions.filter(s => s.type === 'conversation_starter' || s.type === 'follow_up').length },
            { id: 'profile', label: 'Profile Tips', count: suggestions.filter(s => s.type === 'profile_tip').length },
            { id: 'connections', label: 'Connection Ideas', count: suggestions.filter(s => s.type === 'connection_idea').length },
          ].map((tab) => {
            const Icon = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Suggestions */}
      <div className="p-6">
        <div className="space-y-4">
          {getFilteredSuggestions().map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-4 ${getSuggestionColor(suggestion.type)} ${
                suggestion.used ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {suggestion.category}
                    </span>
                    {suggestion.used && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Used
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{suggestion.content}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleCopySuggestion(suggestion)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors duration-200"
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
              {activeTab === 'conversation' 
                ? 'Start a conversation to get personalized suggestions.'
                : 'Complete your profile to receive tailored recommendations.'
              }
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