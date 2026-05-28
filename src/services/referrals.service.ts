import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize a client specifically for this service
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createReferral(refererId: string, referredId: string) {
    const { data, error } = await supabase.from('referrals').insert({
        referer_id: refererId,
        referred_id: referredId
    }).select(); // Added .select() to ensure returning data

    if (error) throw new Error(error.message);
    return data?.[0] || null;
}

export async function getReferralById(referralId: number) {
    const { data, error } = await supabase.from('referrals').select('*').eq('id', referralId);

    if (error) throw new Error(error.message);
    return data?.[0] || null;
}
