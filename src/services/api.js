import { supabase, isSupabaseConfigured } from './supabaseClient';
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
        let { data: usuarioExistente } = await supabase
          .from('usuarios')
          .select('*')
          .eq('correo', correoNormalizado)
          .maybeSingle();

        let usuarioId = null;

        if (!usuarioExistente) {
          const { data: nuevoUsuario, error: errUser } = await supabase
            .from('usuarios')
            .insert([{
              nombre,
              apellido_paterno,
              apellido_materno: apellido_materno || '',
              correo: correoNormalizado,
              telefono,
              password_hash: password
            }])
            .select()
            .single();

          if (errUser) throw errUser;
          usuarioId = nuevoUsuario.id;
          usuarioExistente = nuevoUsuario;
        } else {
          usuarioId = usuarioExistente.id;
        }

        const nuevoBoleto = {
          codigo_boleto: codigoBoleto,
          usuario_id: usuarioId,
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

        return { success: true, boleto: boletoCreado, usuario: usuarioExistente };
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
        password_hash: password,
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
  // INICIAR SESIÓN
  // ----------------------------------------------------
  async login({ correo, password }) {
    const correoNormalizado = correo.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('correo', correoNormalizado)
          .maybeSingle();

        if (error) throw error;
        if (usuario && usuario.password_hash === password) {
          return { success: true, usuario };
        } else if (usuario && usuario.password_hash !== password) {
          return { success: false, error: 'Contraseña incorrecta.' };
        }
      } catch (err) {
        console.warn('Supabase login error:', err);
      }
    }

    const usuarios = JSON.parse(localStorage.getItem('summit_db_usuarios') || '[]');
    const usuario = usuarios.find(u => u.correo === correoNormalizado);

    if (!usuario) {
      return { success: false, error: 'No se encontró una cuenta con este correo.' };
    }

    if (usuario.password_hash && usuario.password_hash !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    return { success: true, usuario };
  },

  // ----------------------------------------------------
  // OBTENER BOLETOS DEL USUARIO
  // ----------------------------------------------------
  async getUserTickets(correo) {
    const correoNormalizado = correo.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('boletos')
          .select('*')
          .eq('correo', correoNormalizado)
          .order('created_at', { ascending: false });

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
    const codigoBuscado = codigo.trim().toUpperCase();

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
    const codigoBuscado = codigo.trim().toUpperCase();

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
  }
};

