import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { topic, audience, productType, tone } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{
        role: "system",
        content: `You are a viral product creator specializing in short-form, high-conversion digital products for Instagram audiences. Create a ${productType} about ${topic} targeting ${audience} with a ${tone} tone. Structure it EXACTLY as a JSON object with: "title", "subtitle", "hook", "sections" (array of 3-5 strings), "cta", "upsell". Keep sections concise and actionable.`
      }, {
        role: "user",
        content: `Create a product about ${topic}`
      }],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || '{}';
    // Sometimes models wrap json in markdown block
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const product = JSON.parse(cleanedContent);

    return NextResponse.json({
      success: true,
      product
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product' },
      { status: 500 }
    );
  }
}
