import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, translateSupabaseError } from '../services/supabaseClient';
import { SummitAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('summit_sesion_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper para armar un objeto de usuario enriquecido con metadatos y perfil
  const buildEnrichedUser = useCallback((authUser, userProfile = null) => {
    if (!authUser) return null;

    const email = authUser.email || userProfile?.correo || '';
    const metadata = authUser.user_metadata || {};
    const appMetadata = authUser.app_metadata || {};

    const nombre = userProfile?.nombre || metadata.nombre || email.split('@')[0] || 'Asistente';
    const apellidoPaterno = userProfile?.apellido_paterno || metadata.apellido_paterno || '';
    const apellidoMaterno = userProfile?.apellido_materno || metadata.apellido_materno || '';
    const telefono = userProfile?.telefono || metadata.telefono || '';
    const rol = userProfile?.rol || appMetadata.rol || 'asistente';

    return {
      ...authUser,
      ...(userProfile || {}),
      id: authUser.id,
      usuario_id: userProfile?.id || null,
      correo: email,
      email: email,
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      telefono,
      rol,
    };
  }, []);

  // Cargar perfil desde la tabla public.usuarios en Supabase
  const fetchProfile = useCallback(async (authUser) => {
    if (!isSupabaseConfigured() || !supabase || !authUser) return null;

    try {
      const email = authUser.email?.trim().toLowerCase();
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},correo.eq.${email}`)
        .maybeSingle();

      if (error) {
        console.warn('Advertencia al consultar perfil en Supabase:', error.message);
        return null;
      }

      // Si existe pero no tenía vinculado auth_user_id, actualizarlo
      if (data && !data.auth_user_id) {
        await supabase
          .from('usuarios')
          .update({ auth_user_id: authUser.id })
          .eq('id', data.id);
        data.auth_user_id = authUser.id;
      }

      return data;
    } catch (err) {
      console.warn('Error cargando perfil:', err);
      return null;
    }
  }, []);

  // Inicialización y escucha de eventos de Supabase Auth
  useEffect(() => {
    let isMounted = true;

    // Caso 1: Supabase NO está configurado aún (modo offline / desarrollo rápido)
    if (!isSupabaseConfigured() || !supabase) {
      const saved = localStorage.getItem('summit_sesion_usuario');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // Caso 2: Supabase SI está configurado
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error al obtener sesión inicial de Supabase:', error);
        }

        if (initialSession?.user && isMounted) {
          setSession(initialSession);
          const userProfile = await fetchProfile(initialSession.user);
          if (isMounted) {
            setProfile(userProfile);
            const enriched = buildEnrichedUser(initialSession.user, userProfile);
            setUser(enriched);
            localStorage.setItem('summit_sesion_usuario', JSON.stringify(enriched));
          }
        } else if (isMounted) {
          // No hay sesión en Supabase; limpiar si había sesión guardada anterior
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem('summit_sesion_usuario');
        }
      } catch (err) {
        console.warn('Error inicializando Supabase Auth:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Suscribirse a cambios de estado de autenticación (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          setSession(currentSession);
          const userProfile = await fetchProfile(currentSession.user);
          if (isMounted) {
            setProfile(userProfile);
            const enriched = buildEnrichedUser(currentSession.user, userProfile);
            setUser(enriched);
            localStorage.setItem('summit_sesion_usuario', JSON.stringify(enriched));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        localStorage.removeItem('summit_sesion_usuario');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile, buildEnrichedUser]);

  // Sincronizar estado local en localStorage cuando el usuario cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('summit_sesion_usuario', JSON.stringify(user));
    } else if (!loading) {
      localStorage.removeItem('summit_sesion_usuario');
    }
  }, [user, loading]);

  // ----------------------------------------------------
  // INICIAR SESIÓN (SUPABASE AUTH)
  // ----------------------------------------------------
  const login = async (correo, password) => {
    setLoading(true);
    try {
      const result = await SummitAPI.login({ correo, password });
      if (result.success) {
        const enriched = result.usuario || (result.user ? buildEnrichedUser(result.user) : null);
        setUser(enriched);
        if (result.session) setSession(result.session);
        return { success: true, user: enriched };
      }
      return { success: false, error: result.error || 'Credenciales incorrectas.' };
    } catch (err) {
      return { success: false, error: translateSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // REGISTRO Y COMPRA DIRECTA
  // ----------------------------------------------------
  const registerAndBuy = async (data) => {
    setLoading(true);
    try {
      const result = await SummitAPI.registerAndBuy(data);
      if (result.success) {
        setUser(result.usuario);
        if (result.authSession) {
          setSession(result.authSession);
        }
        return result;
      }
      return result;
    } catch (err) {
      return { success: false, error: translateSupabaseError(err) };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // REGISTRO SIMPLE (SOLO CUENTA SUPABASE AUTH)
  // ----------------------------------------------------
  const register = async ({ correo, password, nombre, apellido_paterno, apellido_materno, telefono }) => {
    setLoading(true);
    const emailNorm = correo.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailNorm,
          password,
          options: {
            data: {
              nombre,
              apellido_paterno,
              apellido_materno: apellido_materno || '',
              telefono,
            }
          }
        });

        if (signUpError) {
          setLoading(false);
          return { success: false, error: translateSupabaseError(signUpError) };
        }

        const authUser = signUpData.user;
        const authSession = signUpData.session;

        // Crear registro en public.usuarios
        const { data: nuevoPerfil } = await supabase
          .from('usuarios')
          .insert([{
            auth_user_id: authUser.id,
            nombre,
            apellido_paterno,
            apellido_materno: apellido_materno || '',
            correo: emailNorm,
            telefono,
            rol: 'asistente'
          }])
          .select()
          .single();

        const enriched = buildEnrichedUser(authUser, nuevoPerfil);
        setUser(enriched);
        setSession(authSession);
        setProfile(nuevoPerfil);
        setLoading(false);

        return {
          success: true,
          user: enriched,
          requiresEmailConfirmation: !authSession && Boolean(authUser)
        };
      } catch (err) {
        setLoading(false);
        return { success: false, error: translateSupabaseError(err) };
      }
    }

    // Fallback offline
    setLoading(false);
    return registerAndBuy({ correo: emailNorm, password, nombre, apellido_paterno, apellido_materno, telefono });
  };

  // ----------------------------------------------------
  // RECUPERACIÓN DE CONTRASEÑA
  // ----------------------------------------------------
  const resetPassword = async (correo) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase no está configurado aún.' };
    }

    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(correo.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: translateSupabaseError(error) };
      }

      return { success: true, message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' };
    } catch (err) {
      return { success: false, error: translateSupabaseError(err) };
    }
  };

  // ----------------------------------------------------
  // CERRAR SESIÓN (SUPABASE AUTH + LOCAL)
  // ----------------------------------------------------
  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error durante el cierre de sesión en Supabase:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem('summit_sesion_usuario');
      localStorage.removeItem('summit_admin_logged');
    }
  };

  // Determinar si el usuario tiene rol administrativo
  const isAdmin = Boolean(
    user?.rol === 'admin' ||
    user?.rol === 'staff' ||
    profile?.rol === 'admin' ||
    profile?.rol === 'staff' ||
    user?.app_metadata?.rol === 'admin' ||
    user?.app_metadata?.rol === 'staff' ||
    localStorage.getItem('summit_admin_logged') === 'true'
  );

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isConfigured: isSupabaseConfigured(),
    login,
    register,
    registerAndBuy,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
