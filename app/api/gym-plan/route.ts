import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const { calibrationData } = await req.json()
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `You are an expert strength coach. Damodar is 14, 115lbs, vegetarian, no eggs, skinny fat, new to lifting. Here is his week 1 calibration data: ${JSON.stringify(calibrationData)}. Generate his exact week 2 workout plan. Return ONLY valid JSON: {"push": [{"name": "...", "sets": 4, "reps": 8, "weight": 45, "notes": "..."}], "lower": [...], "pull": [...], "full": [...]}`
      }],
      response_format: { type: 'json_object' },
    })
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'))
  } catch {
    return NextResponse.json({})
  }
}
