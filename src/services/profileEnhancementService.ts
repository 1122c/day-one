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

export const generateBioSuggestions = async (userProfile: UserProfile): Promise<string[]> => {
  const prompt = `Generate 3 professional bio suggestions based on this user profile:

    Name: ${userProfile.name}
    Core Values: ${userProfile.values.coreValues.join(', ')}
    Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    Current Bio: ${userProfile.bio}
    
    Generate 3 bio suggestions that:
    1. Highlight their core values and goals
    2. Show personality while maintaining professionalism
    3. Are concise but impactful
    4. Include specific achievements or interests
    5. End with a clear call to action
    
    Format each suggestion on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating bio suggestions:', error);
    throw error;
  }
};

export const generateProfileCompletionSuggestions = async (userProfile: UserProfile): Promise<string[]> => {
  const prompt = `Analyze this user profile and suggest improvements:

    Name: ${userProfile.name}
    Core Values: ${userProfile.values.coreValues.join(', ')}
    Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    Bio: ${userProfile.bio}
    Social Profiles: ${Object.keys(userProfile.socialProfiles || {}).join(', ')}
    
    Generate 3 specific suggestions to improve their profile that:
    1. Address any missing or incomplete sections
    2. Enhance existing content
    3. Add relevant social proof
    4. Improve visibility and engagement
    5. Better align with their goals
    
    Format each suggestion on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating profile completion suggestions:', error);
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

export const generateValueAlignmentAnalysis = async (userProfile: UserProfile): Promise<string> => {
  const prompt = `Analyze the alignment between this user's values and goals:

    Name: ${userProfile.name}
    Core Values: ${userProfile.values.coreValues.join(', ')}
    Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    Bio: ${userProfile.bio}
    
    Provide a thoughtful analysis that includes:
    1. How well their goals align with their values
    2. Potential areas of misalignment
    3. Opportunities for better integration
    4. Suggestions for goal refinement
    5. Ways to better communicate their values
    
    Keep the analysis concise but insightful.`;

  try {
    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating value alignment analysis:', error);
    throw error;
  }
};

export const generateGoalAchievementSuggestions = async (userProfile: UserProfile): Promise<string[]> => {
  const prompt = `Generate actionable suggestions to help achieve these goals:

    Name: ${userProfile.name}
    Core Values: ${userProfile.values.coreValues.join(', ')}
    Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    
    Generate 3 specific suggestions that:
    1. Break down goals into actionable steps
    2. Leverage their core values
    3. Consider their communication preferences
    4. Include potential challenges and solutions
    5. Suggest relevant connections or resources
    
    Format each suggestion on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating goal achievement suggestions:', error);
    throw error;
  }
}; 