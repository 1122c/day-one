m import { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Match } from '@/types/user';
import { sendMessage, getMessagesForConversation, markMessageAsRead, getOrCreateConversation, Message } from '@/services/chatService';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

interface ChatWindowProps {
  match: Match;
  onClose: () => void;
}

export default function ChatWindow({ match, onClose }: ChatWindowProps) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [match.id]);

  const loadMessages = async () => {
    try {
      if (!user) return;
      
      // Get the other user's ID from the match
      const otherUserId = match.userIds.find(id => id !== user.uid);
      if (!otherUserId) {
        throw new Error('Could not find other user in match');
      }
      
      // Get or create conversation between the two users
      const conversationId = await getOrCreateConversation(user.uid, otherUserId);
      const loadedMessages = await getMessagesForConversation(conversationId);
      setMessages(loadedMessages);
      
      // Mark unread messages as read
      loadedMessages
        .filter(msg => !msg.read && msg.senderId !== user.uid)
        .forEach(msg => markMessageAsRead(msg.id!));
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      // Get the other user's ID from the match
      const otherUserId = match.userIds.find(id => id !== user.uid);
      if (!otherUserId) {
        throw new Error('Could not find other user in match');
      }
      
      // Get or create conversation between the two users
      const conversationId = await getOrCreateConversation(user.uid, otherUserId);
      const messageId = await sendMessage(
        conversationId,
        user.uid,
        newMessage.trim(),
        'text'
      );
      
      // Add the new message to the local state
      const newMessageObj: Message = {
        id: messageId,
        conversationId,
        senderId: user.uid,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        messageType: 'text'
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as React.FormEvent);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white sm:rounded-lg w-full h-full sm:max-w-2xl sm:h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close chat"
          >
            <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 ${
                    message.senderId === user?.uid
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {message.timestamp instanceof Timestamp
                      ? message.timestamp.toDate().toLocaleTimeString()
                      : new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t">
          <div className="flex items-center space-x-2">
            <label htmlFor="messageInput" className="sr-only">Type your message</label>
            <textarea
              id="messageInput"
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 min-h-[40px] max-h-[120px] p-2 sm:p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px]"
            >
              Send
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 