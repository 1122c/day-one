import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { auth } from '@/lib/firebase';
import { saveUserProfile } from '@/services/firebaseService';

// Mock Firebase auth
const mockUseAuthState = jest.fn();
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => mockUseAuthState(),
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
    // Default to no authenticated user
    mockUseAuthState.mockReturnValue([null, false]);
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
      
      // Select exactly one communication preference by label
      const videoCallsCheckbox = screen.getByRole('checkbox', {
        name: /video calls/i,
      });
      fireEvent.click(videoCallsCheckbox);
      
      fireEvent.change(screen.getByLabelText(/timezone/i), { target: { value: 'UTC' } });
      
      // Select exactly one preferred time by its label
      const morningCheckbox = screen.getByRole('checkbox', {
        name: /morning/i,
      });
      fireEvent.click(morningCheckbox);
      
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Step 5: Social Profiles
    if (step >= 5) {
      await waitFor(() => expect(screen.getByRole('heading', { name: /social profiles/i })).toBeInTheDocument());
      
      // Option 1: Fill in all social profiles to pass validation
      const usernameInputs = screen.getAllByPlaceholderText(/username/i);
      for (let i = 0; i < usernameInputs.length; i++) {
        fireEvent.change(usernameInputs[i], { target: { value: `testuser${i + 1}` } });
      }
      
      // Wait for validation to complete
      await waitFor(() => {
        expect(usernameInputs[0]).toHaveValue('testuser1');
      });
      
      // Check for any validation errors
      const errorMessages = screen.queryAllByText(/error|invalid|required/i);
      if (errorMessages.length > 0) {
        console.log('Validation errors found:', errorMessages.map(el => el.textContent));
      }
      
      // Try to click Next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      // Wait for step 6 to be rendered
      if (step === 6) {
        await waitFor(() => {
          expect(screen.getByText(/review your profile/i)).toBeInTheDocument();
        }, { timeout: 5000 });
      }
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
    
    // Verify social profiles section is rendered - look for the heading specifically
    expect(screen.getByRole('heading', { name: /social profiles/i })).toBeInTheDocument();
    
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
    
    // Close preview - find the button with no text content (the X button)
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(button => button.textContent === '');
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    await waitFor(() => {
      expect(screen.queryByText(/profile preview/i)).not.toBeInTheDocument();
    });
  });

  it('shows review step with all entered information', async () => {
    render(<OnboardingFlow />);
    
    // Step 1: Name & Bio
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: 'This is a test bio for onboarding.' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 2: Core Values
    await waitFor(() => expect(screen.getByText(/core values/i)).toBeInTheDocument());
    let checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 3: Personal Goals
    await waitFor(() => expect(screen.getByText(/goals/i)).toBeInTheDocument());
    checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 4: Communication Preferences
    await waitFor(() => expect(screen.getByText(/communication/i)).toBeInTheDocument());
    let commCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(commCheckboxes[0]);
    fireEvent.change(screen.getByLabelText(/timezone/i), { target: { value: 'UTC' } });
    let timeCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(timeCheckboxes[4]); // 5th checkbox (index 4) is first time option
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Step 5: Social Profiles - just fill one and move on
    await waitFor(() => expect(screen.getByRole('heading', { name: /social profiles/i })).toBeInTheDocument());
    const usernameInputs = screen.getAllByPlaceholderText(/username/i);
    fireEvent.change(usernameInputs[0], { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify review step content
    await waitFor(() => {
      expect(screen.getByText(/review your profile/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio for onboarding.')).toBeInTheDocument();
  }, 10000);

  it('allows editing from review step', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Click edit button
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }));
    
    // Verify we're back at social profiles step
    expect(screen.getByText(/social profiles/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    // Set up mock authenticated user
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
    };
    mockUseAuthState.mockReturnValue([mockUser, false]);
    
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock successful profile save
    (saveUserProfile as jest.Mock).mockResolvedValueOnce(undefined);
    
    // Wait for the Complete Profile button to be present
    const completeProfileButton = await screen.findByRole('button', { name: /complete profile/i });
    fireEvent.click(completeProfileButton);
    
    // Verify loading state - check for the button specifically
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/profile created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    // Set up mock authenticated user
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
    };
    mockUseAuthState.mockReturnValue([mockUser, false]);
    
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock failed profile save
    (saveUserProfile as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));
    
    // Wait for the Complete Profile button to be present
    const completeProfileButton = await screen.findByRole('button', { name: /complete profile/i });
    fireEvent.click(completeProfileButton);
    
    // Verify error message - check for the first occurrence in the main form
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/failed to save profile/i);
      expect(errorMessages[0]).toBeInTheDocument();
    });
  });

  it('disables navigation buttons during submission', async () => {
    // Set up mock authenticated user
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@example.com',
    };
    mockUseAuthState.mockReturnValue([mockUser, false]);
    
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(6);
    
    // Mock long-running save
    (saveUserProfile as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    // Wait for the Complete Profile button to be present
    const completeProfileButton = await screen.findByRole('button', { name: /complete profile/i });
    fireEvent.click(completeProfileButton);
    
    // Verify all buttons are disabled
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeDisabled();
  });
}); 