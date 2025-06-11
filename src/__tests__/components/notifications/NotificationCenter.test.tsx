import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notificationService';

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
jest.mock('@/services/notificationService');

const mockUser = {
  uid: 'user1',
  email: 'test@example.com',
};

const mockNotifications = [
  {
    id: '1',
    userId: 'user1',
    type: 'match',
    title: 'New Match!',
    message: 'You have a new match with John Doe',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from Jane Smith',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

describe('NotificationCenter', () => {
  beforeEach(() => {
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false, null]);
    (getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);
    (markAllNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification bell with unread count', async () => {
    render(<NotificationCenter />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const unreadBadge = screen.getByText('2', { selector: 'span' });
    expect(unreadBadge).toBeInTheDocument();
  });

  it('displays notifications when bell is clicked', async () => {
    render(<NotificationCenter />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText('New Match!')).toBeInTheDocument();
    expect(screen.getByText('New Message')).toBeInTheDocument();
  });

  it('marks a notification as read', async () => {
    render(<NotificationCenter />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    const markAsReadButtons = screen.getAllByRole('button', { name: /mark as read/i });
    await act(async () => {
      fireEvent.click(markAsReadButtons[0]);
    });

    expect(markNotificationAsRead).toHaveBeenCalledWith('1');
  });

  it('marks all notifications as read', async () => {
    render(<NotificationCenter />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    const markAllAsReadButton = screen.getByRole('button', { name: /mark all as read/i });
    await act(async () => {
      fireEvent.click(markAllAsReadButton);
    });

    expect(markAllNotificationsAsRead).toHaveBeenCalledWith('user1');
  });

  it('handles error when loading notifications', async () => {
    (getNotifications as jest.Mock).mockRejectedValue(new Error('Failed to load notifications'));

    render(<NotificationCenter />);

    // Open the dropdown to show the error
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
    });
  });

  it('closes notification center', async () => {
    render(<NotificationCenter />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the dropdown to close
    await waitFor(() => {
      expect(screen.queryByText('New Match!')).not.toBeInTheDocument();
    });
  });
}); 