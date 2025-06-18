// src/pages/api/match.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userA, userB } = req.body

    if (!userA || !userB) {
      return res.status(400).json({ error: 'Missing user data' })
    }

    const prompt = `
      Compare these two users for compatibility:
      A: ${JSON.stringify(userA)}
      B: ${JSON.stringify(userB)}
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    })

    return res.status(200).json({ result: completion.choices[0].message.content })
  } catch (err: any) {
    console.error('OpenAI error:', err)
    return res.status(500).json({ error: 'OpenAI request failed' })
  }
}
