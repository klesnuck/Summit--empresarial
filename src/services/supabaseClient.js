import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Puedes definir estas variables en un archivo .env:
// VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
// VITE_SUPABASE_ANON_KEY=tu-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://TU_PROYECTO.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_ANON_PUBLIC_KEY';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    !supabaseUrl.includes('TU_PROYECTO') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('TU_ANON_PUBLIC_KEY')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

