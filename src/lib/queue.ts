import { Redis } from '@upstash/redis';
import { logError } from './logger';

// Create a safe redis instance that won't crash if env variables are missing during build time
const redisUrl = process.env.UPSTASH_REDIS_URL || '';
const redisToken = process.env.UPSTASH_REDIS_TOKEN || '';

const redis = new Redis({
    url: redisUrl,
    token: redisToken,
});

export async function enqueueTask(taskId: string, payload: any) {
    if (!redisUrl) return; // Prevent crashes if redis is not configured yet
    
    try {
        await redis.zadd('queue', { score: Date.now(), member: JSON.stringify({ taskId, payload }) });
    } catch (error: any) {
        logError(error, { task_id: taskId, payload: payload });
    }
}

export async function processQueue(options?: any) {
    if (!redisUrl) return { ok: true, processed: 0, successCount: 0, failCount: 0, durationMs: 0 };
    
    let processed = 0;
    let successCount = 0;
    let failCount = 0;
    const start = Date.now();

    while (true) {
        try {
            // @upstash/redis uses zrange with options instead of zRangeWithScores
            const tasks: string[] = await redis.zrange('queue', 0, 9);
            if (!tasks || tasks.length === 0) break;

            for (const member of tasks) {
                try {
                    const task: { taskId: string; payload: any } = JSON.parse(member);
                    await processTask(task.taskId, task.payload);
                    await redis.zrem('queue', member);
                    processed++;
                    successCount++;
                } catch (error: any) {
                    logError(error, { member_payload: member });
                    processed++;
                    failCount++;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
            logError(error);
            break; // prevent infinite error loops
        }
    }
    
    return {
        ok: true,
        processed,
        successCount,
        failCount,
        durationMs: Date.now() - start
    };
}

async function processTask(taskId: string, payload: any) {
    // Implement your task processing logic here (e.g., exports, emails, analytics aggregation)
    console.log(`Processing task: ${taskId}`, payload);
}

export async function getQueueHealth() {
    let isLive = false;
    let pendingCount = 0;
    try {
        if (redisUrl) {
            isLive = true;
            pendingCount = await redis.zcard('queue');
        }
    } catch (e) {
        isLive = false;
    }

    return {
        healthy: isLive,
        pendingCount,
        processingCount: 0, // Mocked for now
        failedCount: 0, // Mocked for now
        oldestPendingAge: 0,
        providerName: "Upstash Redis",
        providerIsLive: isLive
    };
}
