import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

console.log("🔑 OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("🔑 API Key length:", process.env.OPENAI_API_KEY?.length || 0);

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, prompt, systemPrompt, data } = req.body
    console.log("📝 Request received:", { type, prompt: prompt?.substring(0, 100), systemPrompt: systemPrompt?.substring(0, 100), dataKeys: Object.keys(data || {}) })

    // Handle new service-based requests
    if (type === 'conversation' || type === 'matching') {
      if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt' })
      }

      console.log("🤖 Making OpenAI API call for", type);
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant that helps people make meaningful connections.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: type === 'conversation' ? 500 : 300,
        temperature: type === 'conversation' ? 0.8 : 0.7,
      })

      const result = completion.choices[0].message.content;
      console.log("✅ OpenAI response received for", type, "length:", result?.length || 0);
      return res.status(200).json({ suggestions: result })
    }

    // Handle legacy requests
    if (!data) {
      return res.status(400).json({ error: 'Missing data' })
    }

    let legacyPrompt = ''
    let model = 'gpt-3.5-turbo'

    switch (type) {
      case 'match':
        const { userA, userB } = data
        legacyPrompt = `Compare these two users for compatibility:
          A: ${JSON.stringify(userA)}
          B: ${JSON.stringify(userB)}
        `
        break

      case 'bio':
        const { values } = data
        legacyPrompt = `Create a professional and engaging bio based on these values and goals:
          Core Values: ${values.coreValues.join(', ')}
          Personal Goals: ${values.personalGoals.join(', ')}
          Communication Style: ${values.preferredCommunication.join(', ')}
          
          The bio should be concise (max 200 characters), professional, and highlight the person's values and goals.`
        break

      case 'profile_suggestions':
        const { userProfile } = data
        legacyPrompt = `Analyze this user profile and suggest improvements:

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
          
          Format each suggestion on a new line.`
        break

      case 'value_insights':
        const { userValues } = data
        legacyPrompt = `Analyze these user values and provide insights about potential connections and growth areas:
          Core Values: ${userValues.coreValues.join(', ')}
          Personal Goals: ${userValues.personalGoals.join(', ')}
          Communication Style: ${userValues.preferredCommunication.join(', ')}
          
          Provide 2-3 insights about what these values suggest about the person and potential areas for connection.`
        break

      case 'image':
        legacyPrompt = data.prompt
        model = 'dall-e-3'
        break

      case 'text':
        legacyPrompt = data.prompt
        break

      default:
        return res.status(400).json({ error: 'Invalid request type' })
    }

    console.log("🤖 Generated prompt:", legacyPrompt.substring(0, 200) + (legacyPrompt.length > 200 ? "..." : ""));
    
    if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: legacyPrompt,
        n: 1,
        size: "1024x1024",
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated')
      }

      console.log("🖼️ Image generated successfully");
      return res.status(200).json({ result: response.data[0].url })
    } else {
      console.log("💬 Making OpenAI API call...");
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: legacyPrompt }],
      })

      const result = completion.choices[0].message.content;
      console.log("✅ OpenAI response received, length:", result?.length || 0);
      return res.status(200).json({ result })
    }
  } catch (err: any) {
    console.error('OpenAI error:', err)
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      type: err.type,
      code: err.code
    })
    return res.status(500).json({ 
      error: 'OpenAI request failed',
      details: err.message || 'Unknown error',
      type: err.type || 'unknown'
    })
  }
} 