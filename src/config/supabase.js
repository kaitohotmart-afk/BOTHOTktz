import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('tickets').select('count').single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}
