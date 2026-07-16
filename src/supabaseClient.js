import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase: No se encontraron VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env. " +
    "La aplicación funcionará utilizando localStorage de forma local."
  );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
