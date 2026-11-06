import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EVENT_DETAILS } from '../services/stripeConfig';

export default function Register() {
  const { user, registerAndBuy, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido_paterno: user?.apellido_paterno || '',
    apellido_materno: user?.apellido_materno || '',
    correo: user?.correo || user?.email || '',
    telefono: user?.telefono || '',
    password: '',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '•••'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user && formData.password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const res = await registerAndBuy({
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        correo: formData.correo,
        telefono: formData.telefono,
        password: formData.password || 'TemporaryPass2026!'
      });

      if (res.success) {
        setSuccess(true);
        if (res.requiresEmailConfirmation) {
          setRequiresConfirmation(true);
        } else {
          setTimeout(() => {
            navigate('/mi-cuenta');
          }, 1500);
        }
      } else {
        setErrorMsg(res.error || 'Ocurrió un error al procesar el registro.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión al procesar la solicitud.');
    }
  };

  return (
    <div className="flex-grow">
      {/* Encabezado */}
      <section className="bg-brandNavy text-white py-12 px-6 border-b border-brandGold/20 text-center">
        <p className="text-xs font-medium tracking-wide text-brandGold/80">
          <Link to="/" className="hover:text-brandGold transition">Inicio</Link> · Registro y Compra de Boletos
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold mt-3 font-serif">
          Asegura tu lugar en el Summit
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto mt-4 leading-relaxed">
          Completa tus datos para crear tu cuenta de asistente y obtener tu pase oficial con código QR al Summit Empresarial México.
        </p>
      </section>

      {/* Contenido principal */}
      <section className="py-12 md:py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Resumen del Boleto */}
          <div className="md:col-span-2 md:sticky md:top-28">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <span className="inline-block bg-brandGold/15 text-brandGold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Boleto Oficial
              </span>
              <h2 className="text-2xl font-bold text-brandNavy mt-4 font-serif">Acceso Completo</h2>

              <div className="flex items-baseline gap-2 mt-6 pb-6 border-b border-gray-100">
                <span className="text-4xl font-bold text-brandNavy">${EVENT_DETAILS.price.toFixed(2)}</span>
                <span className="text-gray-500 font-medium">MXN</span>
              </div>

              <ul className="text-xs md:text-sm text-gray-600 mt-6 space-y-3 font-semibold">
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> KITS DE BIENVENIDA</li>
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CONFERENCIAS MAGISTRALES Y PANELES</li>
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> TALLERES PRÁCTICOS DE FORMACIÓN EMPRESARIAL</li>
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CONSULTORÍA JURÍDICA Y EMPRESARIAL Y MENTORÍA 1 A 1</li>
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> COFFEE BREAK DE BIENVENIDA</li>
                <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CERTIFICADO DE PARTICIPACIÓN ENVIADO A TU CORREO</li>
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                <span className="text-brandGold text-base">🛡️</span>
                <span>Boleto digital intransferible con código QR de acceso único.</span>
              </div>
            </div>
          </div>

          {/* Formulario de Registro y Pago */}
          <div className="md:col-span-3">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-brandNavy font-serif">¡Registro y Pago Exitosos!</h3>
                  {requiresConfirmation ? (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        Tu boleto ha sido generado exitosamente. Hemos enviado un correo de confirmación de <strong>Supabase Auth</strong> a <strong>{formData.correo}</strong>.
                      </p>
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg mt-4 max-w-md mx-auto">
                        Por favor revisa tu bandeja de entrada (o carpeta de spam) y haz clic en el enlace para activar tu cuenta e ingresar a ver tus boletos.
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/login"
                          className="inline-block bg-brandNavy text-white font-bold px-6 py-2.5 rounded-lg shadow hover:bg-brandNavyDark transition text-sm"
                        >
                          Ir al Inicio de Sesión →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                        Tu boleto con código QR ha sido generado y vinculado a tu cuenta de Supabase. Te estamos redirigiendo a tu panel de boletos...
                      </p>
                      <div className="mt-6">
                        <Link
                          to="/mi-cuenta"
                          className="inline-block bg-brandGold text-brandNavy font-bold px-6 py-2.5 rounded-lg shadow hover:bg-brandGoldHover transition text-sm"
                        >
                          Ver Mi Boleto Ahora →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-brandNavy">
                      1. Datos del Asistente
                    </h3>
                    <Link to="/login" className="text-xs text-brandGold hover:underline font-semibold">
                      ¿Ya compraste? Inicia Sesión
                    </Link>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Nombre(s) *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Juan Arnol"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Apellido Paterno *
                      </label>
                      <input
                        type="text"
                        name="apellido_paterno"
                        required
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        placeholder="Ej. González"
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                        Apellido Materno
                      </label>
                      <input
                        type="text"
                        name="apellido_materno"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        placeholder="Ej. Pérez"
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="correo"
                      required
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="tu@empresa.com"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Número de teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="55 1234 5678"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                      Crea una Contraseña para tu Cuenta *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brandGold outline-none text-sm transition"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      💡 Con esta contraseña y tu correo podrás iniciar sesión para ver o imprimir tu boleto en cualquier dispositivo.
                    </p>
                  </div>

                  {/* Sección Stripe */}
                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-brandNavy flex items-center gap-1.5">
                        <span>2. Método de Pago</span>
                      </h3>
                      <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                        Stripe Secure
                      </span>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/80 mb-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                          </svg>
                          Pasarela Cifrada Stripe
                        </span>
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">VISA</span>
                          <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">MC</span>
                          <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">AMEX</span>
                        </div>
                      </div>

                      {/* Simulación / Contenedor listo para Stripe Elements */}
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-inner space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-700">
                          <span className="font-mono">{formData.cardNumber}</span>
                          <span className="text-emerald-600 font-semibold text-[11px]">Listo para cobro</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                        Tus datos se procesan con cifrado de grado bancario a través de Stripe.
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-6 px-1">
                      <span className="font-bold text-gray-700">
                        Total a pagar:
                      </span>
                      <span className="text-2xl font-bold text-brandNavy">
                        ${EVENT_DETAILS.price.toFixed(2)} MXN
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brandNavy text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-brandNavyDark transition flex justify-center items-center gap-2 text-base disabled:opacity-75"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin text-lg">⚪</span>
                          <span>Procesando pago con Stripe...</span>
                        </>
                      ) : (
                        <span>Confirmar Registro y Pagar ${EVENT_DETAILS.price.toFixed(2)} MXN</span>
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-3">
                      Al confirmar, tu boleto quedará registrado en tu nueva cuenta y podrás acceder de inmediato.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

