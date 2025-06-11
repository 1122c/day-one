import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { sendMessage, getMessages, markMessageAsRead } from '@/services/chatService';
import ChatWindow from '@/components/chat/ChatWindow';

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';

// Mock the hooks and services
jest.mock('react-firebase-hooks/auth');
jest.mock('@/lib/firebase', () => ({
  auth: {},
}));
jest.mock('@/services/chatService');

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockUser = {
  uid: 'user1',
  email: 'test@example.com',
};

const mockMatch = {
  id: 'match1',
  userIds: ['user1', 'user2'],
  users: ['user1', 'user2'],
  status: 'accepted' as const,
  matchScore: 0.85,
  compatibilityFactors: {
    valuesAlignment: 0.9,
    goalsAlignment: 0.8,
    communicationStyle: 0.85,
  },
  matchReason: 'High compatibility in values and interests',
  createdAt: new Date(),
};

const mockMessages = [
  {
    id: '1',
    matchId: 'match1',
    senderId: 'user1',
    content: 'Hello!',
    createdAt: new Date().toISOString(),
    status: 'read',
  },
  {
    id: '2',
    matchId: 'match1',
    senderId: 'user2',
    content: 'Hi there!',
    createdAt: new Date().toISOString(),
    status: 'unread',
  },
];

describe('ChatWindow', () => {
  beforeEach(() => {
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false, null]);
    (getMessages as jest.Mock).mockResolvedValue(mockMessages);
    (sendMessage as jest.Mock).mockImplementation(({ matchId, senderId, content }) => ({
      id: '3',
      matchId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    }));
    (markMessageAsRead as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat window with messages', async () => {
    render(<ChatWindow match={mockMatch} onClose={() => {}} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check if messages are loaded
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('sends a new message', async () => {
    render(<ChatWindow match={mockMatch} onClose={() => {}} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /message/i });
    const sendButton = screen.getByRole('button', { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.click(sendButton);
    });

    expect(sendMessage).toHaveBeenCalledWith('match1', 'New message');
  });

  it('marks unread messages as read', async () => {
    render(<ChatWindow match={mockMatch} onClose={() => {}} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check if markMessageAsRead was called for unread messages
    expect(markMessageAsRead).toHaveBeenCalledWith('2');
  });

  it('handles error when sending message', async () => {
    (sendMessage as jest.Mock).mockRejectedValue(new Error('Failed to send message'));

    render(<ChatWindow match={mockMatch} onClose={() => {}} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /message/i });
    const sendButton = screen.getByRole('button', { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.click(sendButton);
    });

    expect(screen.getByText('Failed to send message')).toBeInTheDocument();
  });

  it('closes chat window', async () => {
    const onClose = jest.fn();
    render(<ChatWindow match={mockMatch} onClose={onClose} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
}); 