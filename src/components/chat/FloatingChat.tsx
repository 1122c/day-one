import { useState, useEffect, useRef } from 'react';
import { UserProfile, Match } from '@/types/user';
import { FiMessageSquare, FiX, FiSend, FiMinimize, FiMaximize } from 'react-icons/fi';
import AISuggestions from '@/components/ai/AISuggestions';

interface FloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  currentUser: UserProfile | null;
  matchedUser: UserProfile | null;
  match?: Match;
}

export default function FloatingChat({
  isOpen,
  onClose,
  onMinimize,
  currentUser,
  matchedUser,
  match,
}: FloatingChatProps) {
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'matched';
    timestamp: Date;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial greeting when chat opens
  useEffect(() => {
    if (isOpen && matchedUser && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          text: `Hi! I'm ${matchedUser.name}. Nice to meet you! 👋`,
          sender: 'matched',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, matchedUser, messages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || !matchedUser) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    setSendingMessage(true);

    // Simulate response delay
    setTimeout(() => {
      const responseMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thanks for your message! I'd love to continue this conversation. What interests you most about what we have in common?`,
        sender: 'matched' as const,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
      setSendingMessage(false);
    }, 1500);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setMessageText(suggestion);
    setShowAISuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <FiMessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">
              {matchedUser ? `Chat with ${matchedUser.name}` : 'New Chat'}
            </h3>
            <p className="text-xs text-white/80">
              {matchedUser ? `${match?.matchScore || 0}% match` : 'Start a conversation'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
            title="Minimize"
          >
            <FiMinimize className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
            title="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {sendingMessage && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions Toggle */}
      {currentUser && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className={`w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              showAISuggestions 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">✨</span>
              <span className="text-base">
                {showAISuggestions ? 'Hide AI Suggestions' : 'Get AI Ice Breakers & Discussion Starters!'}
              </span>
              <span className="text-lg">✨</span>
            </div>
          </button>
          {!showAISuggestions && (
            <p className="text-xs text-center text-gray-600 mt-2">
              Click to get personalized conversation starters and ice breakers
            </p>
          )}
        </div>
      )}

      {/* AI Suggestions Panel */}
      {showAISuggestions && currentUser && (
        <div className="border-t-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-white max-h-64 overflow-y-auto">
          <div className="p-3 bg-indigo-100 border-b border-indigo-200">
            <h4 className="text-sm font-semibold text-indigo-800 text-center">
              🤖 AI-Powered Conversation Helpers
            </h4>
          </div>
          <AISuggestions
            currentUser={currentUser}
            matchedUser={matchedUser}
            match={match}
            onUseSuggestion={handleUseSuggestion}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendingMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
