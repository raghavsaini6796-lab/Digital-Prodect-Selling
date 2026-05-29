import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { title, subtitle } = await req.json();

  try {
    const prompt = `Create a premium, minimalistic, Instagram-ready cover image for a digital product titled "${title}" with subtitle "${subtitle}". The image should be modern, clean, and attention-grabbing with a subtle gradient background.`;
    
    // Using Pollinations AI for free image generation (no API key required)
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Cover generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover image' },
      { status: 500 }
    );
  }
}
