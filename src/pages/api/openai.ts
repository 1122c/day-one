import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

console.log("🔑 OPENAI_API_KEY:", process.env.OPENAI_API_KEY);


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({ error: 'Missing type or data' })
    }

    let prompt = ''
    let model = 'gpt-3.5-turbo'

    switch (type) {
      case 'match':
        const { userA, userB } = data
        prompt = `Compare these two users for compatibility:
          A: ${JSON.stringify(userA)}
          B: ${JSON.stringify(userB)}
        `
        break

      case 'bio':
        const { values } = data
        prompt = `Create a professional and engaging bio based on these values and goals:
          Core Values: ${values.coreValues.join(', ')}
          Personal Goals: ${values.personalGoals.join(', ')}
          Communication Style: ${values.preferredCommunication.join(', ')}
          
          The bio should be concise (max 200 characters), professional, and highlight the person's values and goals.`
        break

      case 'profile_suggestions':
        const { userProfile } = data
        prompt = `Analyze this user profile and suggest improvements:

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
        prompt = `Analyze these user values and provide insights about potential connections and growth areas:
          Core Values: ${userValues.coreValues.join(', ')}
          Personal Goals: ${userValues.personalGoals.join(', ')}
          Communication Style: ${userValues.preferredCommunication.join(', ')}
          
          Provide 2-3 insights about what these values suggest about the person and potential areas for connection.`
        break

      case 'image':
        prompt = data.prompt
        model = 'dall-e-3'
        break

      case 'text':
        prompt = data.prompt
        break

      default:
        return res.status(400).json({ error: 'Invalid request type' })
    }

    if (type === 'image') {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated')
      }

      return res.status(200).json({ result: response.data[0].url })
    } else {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
      })

      return res.status(200).json({ result: completion.choices[0].message.content })
    }
  } catch (err: any) {
    console.error('OpenAI error:', err)
    return res.status(500).json({ error: 'OpenAI request failed' })
  }
} 