import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/services/firebaseService';
import PrivacySettings from '@/components/settings/PrivacySettings';

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
jest.mock('@/services/firebaseService', () => ({
  saveUserProfile: jest.fn(),
}));

const mockUser = {
  uid: 'user1',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'user1',
  name: 'Test User',
  displayName: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  location: 'Test Location',
  interests: ['interest1', 'interest2'],
  values: {
    coreValues: ['value1', 'value2'],
    personalGoals: ['goal1', 'goal2'],
    preferredCommunication: ['email', 'chat'],
    availability: {
      timezone: 'UTC',
      preferredTimes: ['morning', 'evening'],
    },
  },
  privacy: {
    profileVisibility: 'public' as const,
    showEmail: true,
    showSocialProfiles: true,
    allowMessaging: true,
    showOnlineStatus: true,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PrivacySettings', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    (useAuthState as jest.Mock).mockReturnValue([mockUser, false, null]);
    (saveUserProfile as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders privacy settings form', () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/profile visibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show social profiles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allow messaging/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show online status/i)).toBeInTheDocument();
  });

  it('updates profile visibility', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const visibilitySelect = screen.getByLabelText(/profile visibility/i);
    await act(async () => {
      fireEvent.change(visibilitySelect, { target: { value: 'private' } });
    });

    expect(saveUserProfile).toHaveBeenCalledWith('user1', {
      ...mockProfile,
      privacy: {
        ...mockProfile.privacy,
        profileVisibility: 'private',
      },
    });
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('toggles email visibility', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const emailCheckbox = screen.getByLabelText(/show email/i);
    await act(async () => {
      fireEvent.click(emailCheckbox);
    });

    expect(saveUserProfile).toHaveBeenCalledWith('user1', {
      ...mockProfile,
      privacy: {
        ...mockProfile.privacy,
        showEmail: false,
      },
    });
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('toggles social profiles visibility', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const socialCheckbox = screen.getByLabelText(/show social profiles/i);
    await act(async () => {
      fireEvent.click(socialCheckbox);
    });

    expect(saveUserProfile).toHaveBeenCalledWith('user1', {
      ...mockProfile,
      privacy: {
        ...mockProfile.privacy,
        showSocialProfiles: false,
      },
    });
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('toggles messaging permissions', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const messagingCheckbox = screen.getByLabelText(/allow messaging/i);
    await act(async () => {
      fireEvent.click(messagingCheckbox);
    });

    expect(saveUserProfile).toHaveBeenCalledWith('user1', {
      ...mockProfile,
      privacy: {
        ...mockProfile.privacy,
        allowMessaging: false,
      },
    });
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('toggles online status visibility', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const statusCheckbox = screen.getByLabelText(/show online status/i);
    await act(async () => {
      fireEvent.click(statusCheckbox);
    });

    expect(saveUserProfile).toHaveBeenCalledWith('user1', {
      ...mockProfile,
      privacy: {
        ...mockProfile.privacy,
        showOnlineStatus: false,
      },
    });
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('handles error when updating settings', async () => {
    (saveUserProfile as jest.Mock).mockRejectedValue(new Error('Failed to update profile'));

    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const visibilitySelect = screen.getByLabelText(/profile visibility/i);
    await act(async () => {
      fireEvent.change(visibilitySelect, { target: { value: 'private' } });
    });

    expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
  });

  it('disables form controls while updating', async () => {
    render(<PrivacySettings profile={mockProfile} onUpdate={mockOnUpdate} />);

    const visibilitySelect = screen.getByLabelText(/profile visibility/i);
    const emailCheckbox = screen.getByLabelText(/show email/i);
    const socialCheckbox = screen.getByLabelText(/show social profiles/i);
    const messagingCheckbox = screen.getByLabelText(/allow messaging/i);
    const statusCheckbox = screen.getByLabelText(/show online status/i);

    await act(async () => {
      fireEvent.change(visibilitySelect, { target: { value: 'private' } });
    });

    expect(visibilitySelect).toBeDisabled();
    expect(emailCheckbox).toBeDisabled();
    expect(socialCheckbox).toBeDisabled();
    expect(messagingCheckbox).toBeDisabled();
    expect(statusCheckbox).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
}); 