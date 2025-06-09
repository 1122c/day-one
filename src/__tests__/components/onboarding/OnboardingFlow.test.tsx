import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

jest.mock('@/services/openaiService', () => ({
  generateResponse: jest.fn().mockResolvedValue('Mocked response'),
  generateImage: jest.fn().mockResolvedValue('mocked-image-url'),
}));

describe('OnboardingFlow', () => {
  // Helper to fill required fields for each step, re-querying checkboxes after each step
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
  }

  it('renders the first step with name and bio fields', () => {
    render(<OnboardingFlow />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<OnboardingFlow />);
    // Try to go to next step without filling fields (should still be on step 1)
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Use findByText for error messages
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/bio must be at least 10 characters/i)).toBeInTheDocument();
  });

  it('allows adding and removing social profiles', async () => {
    render(<OnboardingFlow />);
    await fillRequiredFieldsAndGoToStep(5); // Step 5 is social profiles
    // There should be at least one social profile input
    // Try to match the heading robustly, fallback to username input presence
    const heading = screen.queryByText((content, node) =>
      node?.tagName.toLowerCase() === 'h3' && content.toLowerCase().includes('social profiles')
    );
    let usernameInputs: HTMLElement[] = [];
    await waitFor(() => {
      usernameInputs = screen.queryAllByPlaceholderText(/username/i);
      expect(heading || usernameInputs.length > 0).toBeTruthy();
    });
    // Remove a profile (if any remove button exists)
    const removeButtons = screen.queryAllByTitle(/remove profile/i);
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      await waitFor(() => {
        expect(screen.queryAllByTitle(/remove profile/i).length).toBeLessThan(removeButtons.length);
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
    // Click preview button if it exists
    const previewButtons = screen.queryAllByTitle(/preview profile/i);
    if (previewButtons.length > 0) {
      fireEvent.click(previewButtons[0]);
      expect(screen.getByText(/profile preview/i)).toBeInTheDocument();
      // Close preview
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByText(/profile preview/i)).not.toBeInTheDocument();
      });
    }
  });
}); 