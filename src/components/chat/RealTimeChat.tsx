import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Match } from '@/types/user';
import { Message, TypingIndicator, OnlineStatus } from '@/types/chat';
import { sendMessage, getMessages, markMessageAsRead } from '@/services/chatService';
import { websocketService, pollingService, WebSocketMessage } from '@/services/websocketService';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiPaperclip, FiSmile, FiWifi, FiWifiOff } from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

interface RealTimeChatProps {
  match: Match;
  onClose: () => void;
}

export default function RealTimeChat({ match, onClose }: RealTimeChatProps) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isTypingTimeout, setIsTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [match.id]);

  // WebSocket connection and message handling
  useEffect(() => {
    const unsubscribeMessage = websocketService.onMessage(handleWebSocketMessage);
    const unsubscribeConnection = websocketService.onConnectionChange(setIsConnected);

    // Send online status
    if (user) {
      websocketService.sendOnlineStatus(user.uid, true);
    }

    // Fallback to polling if WebSocket is not available
    if (!websocketService.isWebSocketConnected()) {
      pollingService.startPolling(match.id, handlePollingUpdate);
    }

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      pollingService.stopPolling(match.id);
      
      // Send offline status
      if (user) {
        websocketService.sendOnlineStatus(user.uid, false);
      }
    };
  }, [match.id, user]);

  const handleWebSocketMessage = useCallback((wsMessage: WebSocketMessage) => {
    switch (wsMessage.type) {
      case 'message':
        const newMessage = wsMessage.data as Message;
        if (newMessage.senderId !== user?.uid) {
          setMessages(prev => [...prev, newMessage]);
          // Mark as read if chat is open
          if (newMessage.id) {
            markMessageAsRead(newMessage.id);
          }
        }
        break;
      
      case 'typing':
        const typingData = wsMessage.data as TypingIndicator;
        if (typingData.userId !== user?.uid) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (typingData.isTyping) {
              newSet.add(typingData.userId);
            } else {
              newSet.delete(typingData.userId);
            }
            return newSet;
          });
        }
        break;
      
      case 'read':
        const readData = wsMessage.data;
        setMessages(prev => 
          prev.map(msg => 
            readData.messageIds.includes(msg.id) 
              ? { ...msg, status: 'read' as const }
              : msg
          )
        );
        break;
      
      case 'online':
      case 'offline':
        const statusData = wsMessage.data as OnlineStatus;
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (wsMessage.type === 'online') {
            newSet.add(statusData.userId);
          } else {
            newSet.delete(statusData.userId);
          }
          return newSet;
        });
        break;
    }
  }, [user]);

  const handlePollingUpdate = useCallback((newMessages: Message[]) => {
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const filteredNewMessages = newMessages.filter(m => !existingIds.has(m.id));
      return [...prev, ...filteredNewMessages];
    });
  }, []);

  const loadMessages = async () => {
    try {
      const loadedMessages = await getMessages(match.id);
      setMessages(loadedMessages);
      
      // Mark unread messages as read
      loadedMessages
        .filter(msg => msg.status === 'sent' && msg.senderId !== user?.uid)
        .forEach(msg => {
          if (msg.id) {
            markMessageAsRead(msg.id);
          }
        });
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

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Clear typing indicator
    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout);
      setIsTypingTimeout(null);
    }
    setIsTyping(false);
    websocketService.sendTypingIndicator(match.id, user.uid, false);

    try {
      const message = await sendMessage({
        matchId: match.id,
        senderId: user.uid,
        content: messageContent,
        status: 'sent',
      });
      
      // Add message to local state
      setMessages(prev => [...prev, message]);
      
      // Send via WebSocket for real-time delivery
      websocketService.sendChatMessage(message);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      websocketService.sendTypingIndicator(match.id, user?.uid || '', true);
    }

    // Clear existing timeout
    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      websocketService.sendTypingIndicator(match.id, user?.uid || '', false);
    }, 2000);

    setIsTypingTimeout(timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as React.FormEvent);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // In a real app, you'd upload the file to storage and get a URL
      console.log('File upload:', file.name);
      // For now, just add a placeholder message
      const message: Message = {
        matchId: match.id,
        senderId: user.uid,
        content: `📎 ${file.name}`,
        status: 'sent',
        createdAt: new Date(),
        messageType: 'file',
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      };
      setMessages(prev => [...prev, message]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date | any) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />;
      case 'sent':
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
      case 'delivered':
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'read':
        return <div className="w-3 h-3 bg-indigo-600 rounded-full" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Chat</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {isConnected ? (
                  <FiWifi className="h-3 w-3 text-green-500" />
                ) : (
                  <FiWifiOff className="h-3 w-3 text-red-500" />
                )}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                {typingUsers.size > 0 && (
                  <span className="text-indigo-600">
                    {Array.from(typingUsers).join(', ')} typing...
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close chat"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === user?.uid
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.messageType === 'file' ? (
                    <div className="flex items-center space-x-2">
                      <FiPaperclip className="h-4 w-4" />
                      <span className="text-sm">{message.metadata?.fileName}</span>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-75">
                      {formatTime(message.createdAt)}
                    </p>
                    {message.senderId === user?.uid && (
                      <div className="ml-2">
                        {getMessageStatusIcon(message.status)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full min-h-[40px] max-h-[120px] p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                disabled={loading}
                rows={1}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Attach file"
              >
                <FiPaperclip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Add emoji"
              >
                <FiSmile className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
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