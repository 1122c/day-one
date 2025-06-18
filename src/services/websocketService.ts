import { Message } from '@/types/chat';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'online' | 'offline';
  data: any;
  timestamp: number;
}

export interface TypingIndicator {
  userId: string;
  matchId: string;
  isTyping: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private connectionHandlers: Map<string, (connected: boolean) => void> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // In production, this would be your WebSocket server URL
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.notifyConnectionHandlers(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Notify all registered handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  public sendMessage(message: WebSocketMessage) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  public sendChatMessage(message: Message) {
    this.sendMessage({
      type: 'message',
      data: message,
      timestamp: Date.now(),
    });
  }

  public sendTypingIndicator(matchId: string, userId: string, isTyping: boolean) {
    this.sendMessage({
      type: 'typing',
      data: { matchId, userId, isTyping },
      timestamp: Date.now(),
    });
  }

  public sendReadReceipt(matchId: string, messageIds: string[]) {
    this.sendMessage({
      type: 'read',
      data: { matchId, messageIds },
      timestamp: Date.now(),
    });
  }

  public sendOnlineStatus(userId: string, isOnline: boolean) {
    this.sendMessage({
      type: isOnline ? 'online' : 'offline',
      data: { userId },
      timestamp: Date.now(),
    });
  }

  public onMessage(handler: (message: WebSocketMessage) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.messageHandlers.set(id, handler);
    
    return () => {
      this.messageHandlers.delete(id);
    };
  }

  public onConnectionChange(handler: (connected: boolean) => void): () => void {
    const id = Math.random().toString(36).substr(2, 9);
    this.connectionHandlers.set(id, handler);
    
    return () => {
      this.connectionHandlers.delete(id);
    };
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();

// Fallback to polling if WebSocket is not available
export class PollingService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private messageHandlers: Map<string, (messages: Message[]) => void> = new Map();

  public startPolling(matchId: string, handler: (messages: Message[]) => void) {
    // Stop existing polling for this match
    this.stopPolling(matchId);

    // Start new polling
    const interval = setInterval(() => {
      handler([]); // This would call the actual message fetching logic
    }, 3000); // Poll every 3 seconds

    this.intervals.set(matchId, interval);
    this.messageHandlers.set(matchId, handler);
  }

  public stopPolling(matchId: string) {
    const interval = this.intervals.get(matchId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(matchId);
      this.messageHandlers.delete(matchId);
    }
  }

  public stopAllPolling() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.messageHandlers.clear();
  }
}

export const pollingService = new PollingService(); 