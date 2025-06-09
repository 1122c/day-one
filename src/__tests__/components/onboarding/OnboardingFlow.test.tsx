import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/services/firebaseService';

// Mock Firebase auth
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [null, false],
}));

// Mock Firebase services
jest.mock('@/services/firebaseService', () => ({
  saveUserProfile: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('OnboardingFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to fill required fields for each step
  async function fillRequiredFieldsAndGoToStep(step: number) {
    // Step 1: Name & Bio
    if (step > 1) {
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'This is a test bio for onboarding.' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Step 2: Core Values
    if (step > 2) {
      await waitFor(() => expect(screen.getByText(/core values/i)).toBeInTheDocument());
      let checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Step 3: Personal Goals
    if (step > 3) {
      await waitFor(() => expect(screen.getByText(/goals/i)).toBeInTheDocument());
      let checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Step 4: Communication Preferences
    if (step > 4) {
      await waitFor(() => expect(screen.getByText(/communication/i)).toBeInTheDocument());
      // Select at least one communication preference
      let commCheckboxes = screen.getAllByRole('checkbox', { name: /.*/ });
      fireEvent.click(commCheckboxes[0]);
      // Select timezone
      fireEvent.change(screen.getByLabelText(/timezone/i), { target: { value: 'UTC' } });
      // Select at least one preferred time
      let timeCheckboxes = screen.getAllByRole('checkbox', { name: /.*/ });
      fireEvent.click(timeCheckboxes[timeCheckboxes.length - 1]);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Step 5: Social Profiles
    if (step > 5) {
      await waitFor(() => expect(screen.getByText(/social profiles/i)).toBeInTheDocument());
      const usernameInputs = screen.getAllByPlaceholderText(/username/i);
      fireEvent.change(usernameInputs[0], { target: { value: 'testuser' } });
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
  }

  it('renders the first step with name and bio fields', () => {
    render(<OnboardingFlow />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<OnboardingFlow />);
    // Try to go to next step without filling fields
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/bio must be at least 10 characters/i)).toBeInTheDocument();
  });

  it('allows adding and removing social profiles', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(5);
    
    // Verify social profiles section is rendered
    expect(screen.getByText(/social profiles/i)).toBeInTheDocument();
    
    // Check initial social profile fields
    const usernameInputs = screen.getAllByPlaceholderText(/username/i);
    expect(usernameInputs.length).toBeGreaterThan(0);
    
    // Remove a profile
    const removeButtons = screen.getAllByTitle(/remove profile/i);
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      await waitFor(() => {
        expect(screen.getAllByPlaceholderText(/username/i).length).toBeLessThan(usernameInputs.length);
      });
    }
    
    // Add a new profile
    const addButton = screen.getByRole('button', { name: /add another profile/i });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/username/i).length).toBeGreaterThan(0);
    });
  });

  it('handles social profile preview', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(5);
    
    // Fill in a social profile
    const usernameInput = screen.getAllByPlaceholderText(/username/i)[0];
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    // Click preview button
    const previewButtons = screen.getAllByTitle(/preview profile/i);
    fireEvent.click(previewButtons[0]);
    
    // Verify preview modal
    expect(screen.getByText(/profile preview/i)).toBeInTheDocument();
    expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
    
    // Close preview
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText(/profile preview/i)).not.toBeInTheDocument();
    });
  });

  it('validates social profile URLs', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(5);
    
    // Fill in an invalid URL
    const urlInputs = screen.getAllByPlaceholderText(/profile url/i);
    fireEvent.change(urlInputs[0], { target: { value: 'invalid-url' } });
    
    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/please enter a valid url/i)).toBeInTheDocument();
  });

  it('shows review step with all entered information', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Verify review step content
    expect(screen.getByText(/review your profile/i)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio for onboarding.')).toBeInTheDocument();
    expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
  });

  it('allows editing from review step', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    
    // Verify we're back at social profiles step
    expect(screen.getByText(/social profiles/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock successful profile save
    (saveUserProfile as jest.Mock).mockResolvedValueOnce(undefined);
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }));
    
    // Verify loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/profile created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock failed profile save
    (saveUserProfile as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument();
    });
  });

  it('disables navigation buttons during submission', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock long-running save
    (saveUserProfile as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /complete profile/i }));
    
    // Verify all buttons are disabled
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeDisabled();
  });
}); 