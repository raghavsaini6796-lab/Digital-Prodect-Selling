import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { content } = reqBody;

        if (!content) throw new Error('Missing required field: content');

        // Initialize Supabase client securely from server context
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Insert the task into the AI Generations queue table
        const { data: taskData, error } = await supabase
            .from('ai_generations')
            .insert([{ 
                prompt: content, 
                status: 'Processing',
                user_id: user.id,
                generation_type: 'Background Queue'
            }])
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        // Vercel Timeout Fix: Immediately return 201 so Vercel doesn't block!
        // Background task will be handled by our Cron process or Next.js background execution.
        return NextResponse.json(taskData, { status: 201 });

    } catch (error: any) {
        console.error('Error adding task to queue:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
