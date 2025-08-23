import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "@/contexts/ChatContext";
import FloatingChat from "@/components/chat/FloatingChat";
import { useChat } from "@/contexts/ChatContext";

function AppContent({ Component, pageProps }: { Component: any; pageProps: any }) {
  const { isChatOpen, isMinimized, currentUser, matchedUser, currentMatch, closeChat, minimizeChat } = useChat();

  return (
    <>
      <Component {...pageProps} />
      <FloatingChat
        isOpen={isChatOpen && !isMinimized}
        onClose={closeChat}
        onMinimize={minimizeChat}
        currentUser={currentUser}
        matchedUser={matchedUser}
        match={currentMatch || undefined}
      />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </ChatProvider>
  );
}
