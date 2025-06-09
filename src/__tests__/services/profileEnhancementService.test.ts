import { generateBioSuggestion, generateValueInsights } from '@/services/profileEnhancementService';
import { UserValues } from '@/types/user';

// Mock the OpenAI service
jest.mock('@/services/openaiService', () => ({
  generateResponse: jest.fn().mockResolvedValue('Mocked response'),
}));

describe('Profile Enhancement Service', () => {
  const mockValues: UserValues = {
    coreValues: ['Authenticity', 'Growth', 'Connection'],
    personalGoals: ['Professional Networking', 'Mentorship'],
    preferredCommunication: ['Video Calls', 'Text Chat'],
    availability: {
      timezone: 'UTC',
      preferredTimes: ['Morning', 'Evening'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBioSuggestion', () => {
    it('generates a bio suggestion based on user values', async () => {
      const suggestion = await generateBioSuggestion(mockValues);
      expect(suggestion).toBe('Mocked response');
    });

    it('handles errors gracefully', async () => {
      const mockError = new Error('API Error');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.requireMock('@/services/openaiService').generateResponse.mockRejectedValueOnce(mockError);

      await expect(generateBioSuggestion(mockValues)).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Error generating bio suggestion:', mockError);
    });
  });

  describe('generateValueInsights', () => {
    it('generates value insights based on user values', async () => {
      const insights = await generateValueInsights(mockValues);
      expect(insights).toBe('Mocked response');
    });

    it('handles errors gracefully', async () => {
      const mockError = new Error('API Error');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.requireMock('@/services/openaiService').generateResponse.mockRejectedValueOnce(mockError);

      await expect(generateValueInsights(mockValues)).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Error generating value insights:', mockError);
    });
  });
}); 