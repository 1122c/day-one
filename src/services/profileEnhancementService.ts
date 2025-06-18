import { UserProfile, UserValues } from '@/types/user';

const callOpenAI = async (type: string, data: any) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result;
};

export const generateBioSuggestion = async (values: UserValues): Promise<string> => {
  try {
    return await callOpenAI('bio', { values });
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
    const response = await callOpenAI('text', { prompt });
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating bio suggestions:', error);
    throw error;
  }
};

export const generateProfileCompletionSuggestions = async (userProfile: UserProfile): Promise<string[]> => {
  try {
    const result = await callOpenAI('profile_suggestions', { userProfile });
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating profile completion suggestions:', error);
    throw error;
  }
};

export const generateValueInsights = async (values: UserValues): Promise<string> => {
  try {
    return await callOpenAI('value_insights', { userValues: values });
  } catch (error) {
    console.error('Error generating value insights:', error);
    throw error;
  }
};

export const generateValueAlignmentAnalysis = async (userProfile: UserProfile): Promise<string> => {
  try {
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

    return await callOpenAI('text', { prompt });
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
    const response = await callOpenAI('text', { prompt });
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating goal achievement suggestions:', error);
    throw error;
  }
};

export const enhanceProfiles = async (userA: any, userB: any) => {
  try {
    return await callOpenAI('match', { userA, userB });
  } catch (error) {
    console.error('Error enhancing profiles:', error);
    throw error;
  }
}; 