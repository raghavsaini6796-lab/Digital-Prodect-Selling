import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL,
    "X-Title": "Automated Cash-Cow Machine",
  },
});

export async function POST() {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{
        role: "system",
        content: `You are Deep Research Agent 3000 - an expert at identifying viral internet trends. Analyze current social media trends and recommend 1 digital product that would sell as a low-ticket (₹49-99) impulse buy. Return JSON with:

{
  "topic": "Highly viral trending topic",
  "audience": "Specific audience",
  "productType": "cheat-sheet|template|guide",
  "price": 49 or 99,
  "viralHook": "Ultra-curiosity-inducing hook"
}

Make it extremely click-worthy and leverage current internet trends.`
      }],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || '{}';
    // Sometimes models wrap json in markdown block
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const research = JSON.parse(cleanedContent);

    return NextResponse.json({ success: true, research });

  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Research failed' },
      { status: 500 }
    );
  }
}
