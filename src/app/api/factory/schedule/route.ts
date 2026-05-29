import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { 
    productId,
    caption,
    hashtags,
    mediaUrl,
    scheduledTime 
  } = await req.json();

  try {
    // Calculate delay in milliseconds
    const delay = new Date(scheduledTime).getTime() - Date.now();

    // Add task to Redis queue
    await redis.zadd('instagram_schedule', {
      score: scheduledTime,
      member: JSON.stringify({
        productId,
        caption,
        hashtags,
        mediaUrl,
        status: 'scheduled'
      })
    });

    return NextResponse.json({
      success: true,
      message: `Post scheduled for ${scheduledTime}`
    });

  } catch (error) {
    console.error('Scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}
