import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Match } from '@/types/user';

interface ChatContextType {
  isChatOpen: boolean;
  isMinimized: boolean;
  currentChatUser: UserProfile | null;
  currentMatch: Match | null;
  openChat: (user: UserProfile, match?: Match) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState<UserProfile | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const openChat = (user: UserProfile, match?: Match) => {
    setCurrentChatUser(user);
    setCurrentMatch(match || null);
    setIsChatOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsMinimized(false);
    setCurrentChatUser(null);
    setCurrentMatch(null);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  const value: ChatContextType = {
    isChatOpen,
    isMinimized,
    currentChatUser,
    currentMatch,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
