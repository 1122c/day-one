import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, Match } from '@/types/user';

interface ChatContextType {
  isChatOpen: boolean;
  isMinimized: boolean;
  currentUser: UserProfile | null; // The logged-in user
  matchedUser: UserProfile | null; // The user they're chatting with
  currentMatch: Match | null;
  openChat: (currentUser: UserProfile, matchedUser: UserProfile, match?: Match) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // The logged-in user
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null); // The user they're chatting with
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const openChat = (currentUser: UserProfile, matchedUser: UserProfile, match?: Match) => {
    setCurrentUser(currentUser);
    setMatchedUser(matchedUser);
    setCurrentMatch(match || null);
    setIsChatOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsMinimized(false);
    setCurrentUser(null);
    setMatchedUser(null);
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
    currentUser,
    matchedUser,
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
