import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Typically the service role key is SUPABASE_SERVICE_ROLE_KEY
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ADMIN_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminSupabase = createClient(supabaseUrl, supabaseAdminKey);

export async function logEvent(eventType: string, userId?: string, productId?: string, metadata?: any, source?: string) {
    const { data, error } = await adminSupabase.from('analytics_events').insert([
        {
            event_type: eventType,
            user_id: userId,
            product_id: productId,
            metadata,
            source
        }
    ]);

    if (error) throw new Error(error.message);
}

export async function fetchMetrics(metricName: string): Promise<{ metric_value: number; recorded_at: Date }[]> {
    const { data, error } = await adminSupabase.from('system_metrics')
        .select('*')
        .eq('metric_name', metricName)
        .order('recorded_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data;
}

export async function logMetric(metricName: string, metricValue: number, metricType: string) {
    const { data, error } = await adminSupabase.from('system_metrics').insert([
        {
            metric_name: metricName,
            metric_value: metricValue,
            metric_type: metricType
        }
    ]);

    if (error) throw new Error(error.message);
}
