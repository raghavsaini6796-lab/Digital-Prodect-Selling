import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize a client specifically for this service to ensure it works even if @/lib/supabase is missing or misconfigured
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function captureLead(email: string, source: string, campaign: string, funnelStage: string, tags?: any[], metadata?: any) {
    const { data, error } = await supabase.from('leads').insert({
        email,
        source,
        campaign,
        funnel_stage: funnelStage,
        tags: tags || [],
        metadata: metadata || {}
    }).select(); // Added .select() to ensure returning data[0] works as expected in Supabase v2

    if (error) throw new Error(error.message);
    return data?.[0] || null;
}

export async function getLeads() {
    const { data, error } = await supabase.from('leads').select('*');

    if (error) throw new Error(error.message);
    return data;
}
