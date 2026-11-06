import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno de Vite (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Verifica si las credenciales de Supabase están correctamente definidas en el entorno
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('TU_PROYECTO') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('TU_ANON_PUBLIC_KEY')
  );
};

/**
 * Cliente de Supabase inicializado con persistencia de sesión en localStorage
 * y soporte para enlaces de confirmación/recuperación en URL.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : null;

/**
 * Traduce errores habituales de Supabase Auth a mensajes claros en español.
 */
export const translateSupabaseError = (error) => {
  if (!error) return '';
  const msg = error.message || String(error);

  if (msg.includes('Invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de ingresar. Por favor revisa tu bandeja de entrada o spam.';
  }
  if (msg.includes('User already registered')) {
    return 'Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.';
  }
  if (msg.includes('Password should be at least 6 characters')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('invalid format') || msg.includes('email address')) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'No se pudo conectar con el servidor de Supabase. Revisa tu conexión a internet o las credenciales del archivo .env.';
  }
  if (msg.includes('rate limit')) {
    return 'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.';
  }
  return msg;
};
