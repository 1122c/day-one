import { UserProfile, UserValues } from '@/types/user';
import { generateResponse } from './openaiService';

export const generateBioSuggestion = async (values: UserValues): Promise<string> => {
  const prompt = `Create a professional and engaging bio based on these values and goals:
    Core Values: ${values.coreValues.join(', ')}
    Personal Goals: ${values.personalGoals.join(', ')}
    Communication Style: ${values.preferredCommunication.join(', ')}
    
    The bio should be concise (max 200 characters), professional, and highlight the person's values and goals.`;

  try {
    const suggestion = await generateResponse(prompt);
    return suggestion;
  } catch (error) {
    console.error('Error generating bio suggestion:', error);
    throw error;
  }
};

export const generateProfileCompletionSuggestions = async (profile: Partial<UserProfile>): Promise<string[]> => {
  const prompt = `Based on this partial user profile, suggest 3 specific improvements to make the profile more complete and engaging:
    Name: ${profile.name || 'Not provided'}
    Bio: ${profile.bio || 'Not provided'}
    Core Values: ${profile.values?.coreValues?.join(', ') || 'Not provided'}
    Personal Goals: ${profile.values?.personalGoals?.join(', ') || 'Not provided'}
    
    Provide specific, actionable suggestions.`;

  try {
    const suggestions = await generateResponse(prompt);
    return suggestions.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating profile suggestions:', error);
    throw error;
  }
};

export const generateValueInsights = async (values: UserValues): Promise<string> => {
  const prompt = `Analyze these user values and provide insights about potential connections and growth areas:
    Core Values: ${values.coreValues.join(', ')}
    Personal Goals: ${values.personalGoals.join(', ')}
    Communication Style: ${values.preferredCommunication.join(', ')}
    
    Provide 2-3 insights about what these values suggest about the person and potential areas for connection.`;

  try {
    const insights = await generateResponse(prompt);
    return insights;
  } catch (error) {
    console.error('Error generating value insights:', error);
    throw error;
  }
}; 