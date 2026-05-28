import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    RECAPTCHA_SECRET_KEY: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    VERCEL_ANALYTICS_ID: z.string().optional(),
    
    // Qwen additions:
    RAZORPAY_KEY_SECRET: z.string().optional(),
    META_APP_SECRET: z.string().optional(),
    AI_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ANALYTICS_ID: process.env.VERCEL_ANALYTICS_ID,
    
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    META_APP_SECRET: process.env.META_APP_SECRET,
    AI_API_KEY: process.env.AI_API_KEY || process.env.OPENAI_API_KEY
});
