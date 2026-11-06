import { supabase, isSupabaseConfigured, translateSupabaseError } from './supabaseClient';
import { EVENT_DETAILS } from './stripeConfig';

export const SummitAPI = {
  generarCodigoBoleto() {
    const aleatorio = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `SUMMIT-${aleatorio}`;
  },

  // ----------------------------------------------------
  // REGISTRO Y COMPRA
  // ----------------------------------------------------
  async registerAndBuy({ nombre, apellido_paterno, apellido_materno, correo, telefono, password, stripePaymentId = null }) {
    const codigoBoleto = this.generarCodigoBoleto();
    const correoNormalizado = correo.trim().toLowerCase();

    // 1. Supabase si está configurado
    if (isSupabaseConfigured() && supabase) {
      try {
        let authUser = null;
        let authSession = null;

        // Verificar si ya hay una sesión activa con este correo
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user && sessionData.session.user.email?.toLowerCase() === correoNormalizado) {
          authUser = sessionData.session.user;
          authSession = sessionData.session;
        } else {
          // Registrar nuevo usuario en Supabase Auth
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: correoNormalizado,
            password: password,
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
            // Si el usuario ya existe en Supabase Auth, intentamos iniciar sesión con la contraseña proporcionada
            const isAlreadyRegistered =
              signUpError.message.includes('User already registered') ||
              signUpError.message.includes('already registered');

            if (isAlreadyRegistered) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: correoNormalizado,
                password: password
              });

              if (signInError) {
                return {
                  success: false,
                  error: 'Este correo ya tiene una cuenta registrada en el sistema. Por favor verifica tu contraseña o inicia sesión primero.'
                };
              }
              authUser = signInData.user;
              authSession = signInData.session;
            } else {
              return { success: false, error: translateSupabaseError(signUpError) };
            }
          } else {
            authUser = signUpData.user;
            authSession = signUpData.session;
          }
        }

        // Buscar o crear registro en la tabla public.usuarios
        let { data: usuarioExistente } = await supabase
          .from('usuarios')
          .select('*')
          .or(`auth_user_id.eq.${authUser?.id},correo.eq.${correoNormalizado}`)
          .maybeSingle();

        let usuarioId = null;

        if (!usuarioExistente) {
          const { data: nuevoUsuario, error: errUser } = await supabase
            .from('usuarios')
            .insert([{
              auth_user_id: authUser?.id || null,
              nombre,
              apellido_paterno,
              apellido_materno: apellido_materno || '',
              correo: correoNormalizado,
              telefono,
              rol: 'asistente'
            }])
            .select()
            .single();

          if (errUser) {
            console.warn('Nota: usuario creado en Auth pero error en public.usuarios:', errUser);
          } else {
            usuarioId = nuevoUsuario.id;
            usuarioExistente = nuevoUsuario;
          }
        } else {
          usuarioId = usuarioExistente.id;
          // Si existía sin auth_user_id, vincularlo
          if (authUser?.id && !usuarioExistente.auth_user_id) {
            await supabase
              .from('usuarios')
              .update({ auth_user_id: authUser.id })
              .eq('id', usuarioId);
          }
        }

        // Crear boleto asociado al usuario
        const nuevoBoleto = {
          codigo_boleto: codigoBoleto,
          usuario_id: usuarioId,
          auth_user_id: authUser?.id || null,
          nombre,
          apellido_paterno,
          apellido_materno: apellido_materno || '',
          correo: correoNormalizado,
          telefono,
          tipo_acceso: 'Acceso Completo',
          precio: EVENT_DETAILS.price,
          moneda: EVENT_DETAILS.currency,
          estado_pago: 'PAGADO',
          stripe_payment_id: stripePaymentId || ('ch_test_' + Math.random().toString(36).substring(2, 9)),
          usado: 0
        };

        const { data: boletoCreado, error: errBoleto } = await supabase
          .from('boletos')
          .insert([nuevoBoleto])
          .select()
          .single();

        if (errBoleto) throw errBoleto;

        const enrichedUser = {
          ...(authUser || {}),
          ...(usuarioExistente || {}),
          id: authUser?.id || usuarioId,
          usuario_id: usuarioId,
          nombre: usuarioExistente?.nombre || nombre,
          apellido_paterno: usuarioExistente?.apellido_paterno || apellido_paterno,
          apellido_materno: usuarioExistente?.apellido_materno || apellido_materno,
          correo: correoNormalizado,
          telefono: usuarioExistente?.telefono || telefono,
          rol: usuarioExistente?.rol || 'asistente'
        };

        return {
          success: true,
          boleto: boletoCreado,
          usuario: enrichedUser,
          authSession,
          requiresEmailConfirmation: !authSession && Boolean(authUser)
        };
      } catch (err) {
        console.warn('Fallo al conectar con Supabase, usando persistencia local:', err);
      }
    }

    // 2. LocalStorage Fallback (funciona 100% offline o antes de configurar llaves)
    const usuarios = JSON.parse(localStorage.getItem('summit_db_usuarios') || '[]');
    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');

    let usuario = usuarios.find(u => u.correo === correoNormalizado);
    if (!usuario) {
      usuario = {
        id: 'usr_' + Date.now(),
        nombre,
        apellido_paterno,
        apellido_materno: apellido_materno || '',
        correo: correoNormalizado,
        telefono,
        rol: 'asistente',
        created_at: new Date().toISOString()
      };
      usuarios.push(usuario);
      localStorage.setItem('summit_db_usuarios', JSON.stringify(usuarios));
    }

    const boleto = {
      id: 'bol_' + Date.now(),
      codigo_boleto: codigoBoleto,
      usuario_id: usuario.id,
      nombre,
      apellido_paterno,
      apellido_materno: apellido_materno || '',
      correo: correoNormalizado,
      telefono,
      tipo_acceso: 'Acceso Completo',
      precio: EVENT_DETAILS.price,
      moneda: EVENT_DETAILS.currency,
      estado_pago: 'PAGADO',
      stripe_payment_id: stripePaymentId || ('ch_sim_' + Math.random().toString(36).substring(2, 9)),
      usado: 0,
      created_at: new Date().toISOString()
    };

    boletos.push(boleto);
    localStorage.setItem('summit_db_boletos', JSON.stringify(boletos));

    return { success: true, boleto, usuario };
  },

  // ----------------------------------------------------
  // INICIAR SESIÓN CON SUPABASE AUTH
  // ----------------------------------------------------
  async login({ correo, password }) {
    const correoNormalizado = correo.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: correoNormalizado,
          password: password,
        });

        if (authError) {
          return { success: false, error: translateSupabaseError(authError) };
        }

        // Obtener perfil detallado
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('*')
          .or(`auth_user_id.eq.${authData.user.id},correo.eq.${correoNormalizado}`)
          .maybeSingle();

        const enrichedUser = {
          ...authData.user,
          ...(perfil || {}),
          id: authData.user.id,
          usuario_id: perfil?.id || null,
          nombre: perfil?.nombre || authData.user.user_metadata?.nombre || correoNormalizado.split('@')[0],
          apellido_paterno: perfil?.apellido_paterno || authData.user.user_metadata?.apellido_paterno || '',
          apellido_materno: perfil?.apellido_materno || authData.user.user_metadata?.apellido_materno || '',
          correo: correoNormalizado,
          telefono: perfil?.telefono || authData.user.user_metadata?.telefono || '',
          rol: perfil?.rol || authData.user.app_metadata?.rol || 'asistente',
        };

        return {
          success: true,
          user: authData.user,
          session: authData.session,
          usuario: enrichedUser
        };
      } catch (err) {
        console.warn('Supabase login error:', err);
        return { success: false, error: translateSupabaseError(err) };
      }
    }

    // Fallback Offline en localStorage
    const usuarios = JSON.parse(localStorage.getItem('summit_db_usuarios') || '[]');
    const usuario = usuarios.find(u => u.correo === correoNormalizado);

    if (!usuario) {
      return { success: false, error: 'No se encontró una cuenta con este correo electrónico.' };
    }

    return { success: true, usuario };
  },

  // ----------------------------------------------------
  // OBTENER BOLETOS DEL USUARIO
  // ----------------------------------------------------
  async getUserTickets(correo) {
    const correoNormalizado = (correo || '').trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase.from('boletos').select('*').order('created_at', { ascending: false });

        if (user?.id) {
          query = query.or(`auth_user_id.eq.${user.id},correo.eq.${correoNormalizado}`);
        } else if (correoNormalizado) {
          query = query.eq('correo', correoNormalizado);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Error fetching tickets from Supabase:', err);
      }
    }

    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    return boletos.filter(b => b.correo.toLowerCase() === correoNormalizado);
  },

  // ----------------------------------------------------
  // OBTENER BOLETO POR CÓDIGO
  // ----------------------------------------------------
  async getTicketByCode(codigo) {
    const codigoBuscado = (codigo || '').trim().toUpperCase();
    if (!codigoBuscado) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('boletos')
          .select('*')
          .eq('codigo_boleto', codigoBuscado)
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Error fetching ticket by code from Supabase:', err);
      }
    }

    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    return boletos.find(b => b.codigo_boleto.toUpperCase() === codigoBuscado) || null;
  },

  // ----------------------------------------------------
  // MARCAR BOLETO USADO (CHECK-IN)
  // ----------------------------------------------------
  async markTicketUsed(codigo) {
    const codigoBuscado = (codigo || '').trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('boletos')
          .update({ usado: 1, fecha_uso: new Date().toISOString() })
          .eq('codigo_boleto', codigoBuscado)
          .select()
          .single();

        if (!error && data) return { success: true, boleto: data };
      } catch (err) {
        console.warn('Error updating ticket in Supabase:', err);
      }
    }

    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    const idx = boletos.findIndex(b => b.codigo_boleto.toUpperCase() === codigoBuscado);
    if (idx !== -1) {
      boletos[idx].usado = 1;
      boletos[idx].fecha_uso = new Date().toISOString();
      localStorage.setItem('summit_db_boletos', JSON.stringify(boletos));
      return { success: true, boleto: boletos[idx] };
    }

    return { success: false, error: 'Boleto no encontrado' };
  },

  // ----------------------------------------------------
  // ADMIN: OBTENER TODOS LOS ASISTENTES Y BOLETOS
  // ----------------------------------------------------
  async getAllTickets() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('boletos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Error fetching all tickets from Supabase:', err);
      }
    }

    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    return boletos;
  },

  // ----------------------------------------------------
  // ADMIN: ACTUALIZAR ESTADO DE PAGO DE UN BOLETO
  // ----------------------------------------------------
  async updateTicketPaymentStatus(codigo, nuevoEstado) {
    const codigoBuscado = (codigo || '').trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('boletos')
          .update({ estado_pago: nuevoEstado })
          .eq('codigo_boleto', codigoBuscado)
          .select()
          .single();

        if (!error && data) return { success: true, boleto: data };
      } catch (err) {
        console.warn('Error updating payment status in Supabase:', err);
      }
    }

    const boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    const idx = boletos.findIndex(b => b.codigo_boleto.toUpperCase() === codigoBuscado);
    if (idx !== -1) {
      boletos[idx].estado_pago = nuevoEstado;
      localStorage.setItem('summit_db_boletos', JSON.stringify(boletos));
      return { success: true, boleto: boletos[idx] };
    }

    return { success: false, error: 'Boleto no encontrado' };
  },

  // ----------------------------------------------------
  // ADMIN: ELIMINAR BOLETO
  // ----------------------------------------------------
  async deleteTicket(codigo) {
    const codigoBuscado = (codigo || '').trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('boletos')
          .delete()
          .eq('codigo_boleto', codigoBuscado);

        if (!error) return { success: true };
      } catch (err) {
        console.warn('Error deleting ticket from Supabase:', err);
      }
    }

    let boletos = JSON.parse(localStorage.getItem('summit_db_boletos') || '[]');
    boletos = boletos.filter(b => b.codigo_boleto.toUpperCase() !== codigoBuscado);
    localStorage.setItem('summit_db_boletos', JSON.stringify(boletos));
    return { success: true };
  }
};
