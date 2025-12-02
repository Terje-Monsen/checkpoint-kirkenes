// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Bruk service role key KUN på server (aldri i frontend)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
