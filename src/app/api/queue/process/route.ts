import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Opt out of caching since this is a queue processor
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch the next task to process from our AI Generations table
        // (Matching Qwen's queue logic but using our actual database table)
        const { data: taskData, error } = await supabase
            .from('ai_generations')
            .select('*')
            .eq('status', 'Processing')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (error || !taskData) {
            // No tasks to process or error fetching
            return NextResponse.json({ message: 'No tasks to process' }, { status: 204 });
        }

        // 2. Process the task in the background
        await processTask(taskData.id, taskData.prompt);

        // 3. Mark the task as completed
        const { error: completeError } = await supabase
            .from('ai_generations')
            .update({ status: 'Ready' }) // Our schema uses 'Ready' for completed
            .eq('id', taskData.id);

        if (completeError) {
            console.error('Error updating task to completed:', completeError);
            return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
        }

        return NextResponse.json({ message: `Task ${taskData.id} processed successfully` }, { status: 200 });
    } catch (error: any) {
        console.error('Error processing queue:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

async function processTask(taskId: string, content: string) {
    try {
        console.log(`[Queue Processor] Starting background task for: ${taskId}`);
        
        // Simulate long-running task to prevent Vercel Timeout
        await new Promise(resolve => setTimeout(resolve, 5000));

        // AI Generation Logic would go here
        // e.g. const response = await fetch('https://openrouter.ai/api/v1/chat/completions', ...)
        
        // Instagram Automation Logic would go here
        // e.g. const postResponse = await fetch('https://graph.facebook.com/v19.0/me/media', ...)

        console.log(`[Queue Processor] Task ${taskId} completed successfully in background.`);
    } catch (error) {
        console.error(`[Queue Processor] Error processing task ${taskId}:`, error);
        throw error;
    }
}
