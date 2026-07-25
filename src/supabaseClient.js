import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://api.santiagohorianski.com:8443';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase: No se encontraron VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env. " +
    "La aplicación funcionará utilizando localStorage de forma local."
  );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
