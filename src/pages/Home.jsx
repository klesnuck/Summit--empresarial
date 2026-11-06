import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      {/* Hero / Encabezado Principal */}
      <section id="inicio" className="bg-brandNavy text-white relative overflow-hidden py-20 px-6 border-b border-brandGold/20">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Banner / Imagen del lema integrado */}
          <div className="mt-0 mb-4 max-w-3xl mx-auto bg-white/5 p-6 rounded-2xl border border-brandGold/30 backdrop-blur-sm shadow-xl">
            <img
              src="/cambio.jpeg"
              alt="El encuentro de la nueva generación empresarial más importante de México"
              className="w-full h-auto rounded-lg mx-auto"
            />
          </div>

          <div className="text-center mt-12 mb-8">
            <h2 className="text-4xl md:text-6xl font-semibold text-white font-serif">
              Summit Empresarial
            </h2>
          </div>

          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto mt-3 leading-relaxed">
            SUMMIT EMPRESARIAL MÉXICO es uno de los programas de formación de la RED MUNDIAL DE
            JÓVENES POLÍTICOS MÉXICO, enfocado en el ámbito empresarial. A través de un sistema
            integral de innovación, desarrolla actividades concentradas en ponencias, talleres,
            dinámicas, mentoría profesional, consultoría empresarial, incubación y desarrollo de
            proyectos, acercando a las juventudes a una primera experiencia empresarial y profesional.
          </p>

          <div className="mt-8">
            <Link
              to="/registro"
              className="inline-block bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-sm md:text-base"
            >
              Asegurar Mi Entrada Ahora →
            </Link>
          </div>
        </div>
      </section>

      {/* Sección Aliados / Conferencistas */}
      <section id="que-hacemos" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brandNavy font-serif">
            Conferencistas Oficiales De Summit Empresarial
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Conoce a nuestros conferencistas que formarán parte del programa de la edición de SUMMIT EMPRESARIAL NACIONAL!
          </p>
        </div>

        {/* Galería de Aliados */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`bg-white h-48 p-2 rounded-xl shadow-md border-t-4 ${
                num % 2 === 1 ? 'border-brandGold' : 'border-brandNavy'
              } flex items-center justify-center hover:-translate-y-1 transition`}
            >
              <img src="/invitado.png" alt={`Conferencista ${num}`} className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </section>

      {/* Respaldos y Alianzas */}
      <section id="aliados" className="bg-gray-100 py-16 px-6 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-10 text-center">
            Organizado Por:
          </h3>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
              {/* Imagen */}
              <div className="flex items-center justify-center">
                <img
                  src="/SUMMITBLANCO.jpeg"
                  alt="Red Mundial de Jóvenes Políticos"
                  className="h-24 md:h-36 w-auto max-w-full object-contain"
                />
              </div>

              {/* Información */}
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-brandNavy font-serif mb-5">
                  Acerca de Summit Empresarial México
                </h2>

                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  <strong className="text-brandNavy">LA PRIMERA EDICION</strong> de Summit Empresarial
                  México se llevó a cabo <strong className="text-brandNavy">EN SALTILLO COAHUILA EN EL CENTRO
                  CULTURAL VITO ALESSIO ROBLES,</strong> en donde más de 150 jóvenes participaron a lo largo
                  de dos días, con 15 ponentes en total, se llevaron a cabo dinámicas de empresas aliadas,
                  y la EXPO SUMMIT dando la oportunidad a emprendedores de dar a conocer su negocio.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-sm md:text-base">
                  La edición online de Summit Empresarial significó el
                  lanzamiento nacional del programa donde más de 300
                  jóvenes participaron en sesiones de 60 minutos con ponentes
                  altamente calificados e involucrados en el sector empresarial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Día 1 */}
      <section id="agenda" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brandNavy font-serif">                                                                     EVENTO</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Programa Preliminar de las actividades</p>
        </div>

        <div className="bg-brandNavy rounded-[2rem] p-3 md:p-5 shadow-2xl">
          <div className="bg-white rounded-[1.5rem] p-4 md:p-8">
            <div className="bg-brandNavy text-white rounded-full px-6 md:px-8 py-4 flex justify-between items-center mb-4">
              <span className="text-lg md:text-xl font-bold tracking-wide">AM - PM DIA 1</span>
              <span className="text-sm md:text-base text-gray-200">08:00 - 17:30 hrs.</span>
            </div>

            <div className="divide-y divide-gray-200">
              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">08:00 - 09:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">REGISTRO Y COFFEE BREAK</p>
                  <p className="text-sm text-gray-500 mt-1">Entrega de Kits de bienvenida · Asignación de lugares · Cierre de puertas 9:00 AM</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">09:00 - 10:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">SALUDO A LA BANDERA & PROTOCOLO INAUGURAL</p>
                  <p className="text-sm text-gray-500 mt-1">Banda de guerra · Mensaje de Antonio Rincón (Fundador) · Mensaje Rector Tec de Monterrey · Mensaje Presidente COPARMEX Jóvenes</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">10:00 - 11:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Bloque 1 | Visión Estratégica</p>
                  <p className="text-sm text-gray-500 mt-1">Conferencia Magistral: El futuro de la competitividad empresarial.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">11:00 - 11:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Coffee Break & Networking</p>
                  <p className="text-sm text-gray-500 mt-1">Conexión con empresarios y aliados estratégicos.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">11:30 - 12:20</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Bloque II | Diferenciación</p>
                  <p className="text-sm text-gray-500 mt-1">Marca Personal Como Ventaja Competitiva.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">12:30 - 13:20</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Panel Empresarial</p>
                  <p className="text-sm text-gray-500 mt-1">Cómo Destacar En Un Mundo De Oportunidades.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">13:30 - 14:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Receso de Almuerzo</p>
                  <p className="text-sm text-gray-500 mt-1">Receso libre para comer y visitar stands de patrocinadores.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">14:30 - 15:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Innovación Como Ventaja Competitiva</p>
                  <p className="text-sm text-gray-500 mt-1">Herramientas y metodologías ágiles de crecimiento.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">15:30 - 17:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Conferencia Magistral de Cierre Día 1</p>
                  <p className="text-sm text-gray-500 mt-1">Dinámica Startup México y presentación de proyectos destacados.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">17:00 - 17:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Cierre del Día 1</p>
                  <p className="text-sm text-gray-500 mt-1">Show de saxofón en vivo y mensaje final de Antonio Rincón.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Día 2 */}
      <section id="agenda-dia-2" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brandNavy font-serif">AGENDA DEL DÍA 2</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Programa de actividades del segundo día</p>
        </div>

        <div className="bg-brandNavy rounded-[2rem] p-3 md:p-5 shadow-2xl">
          <div className="bg-white rounded-[1.5rem] p-4 md:p-8">
            <div className="bg-brandNavy text-white rounded-full px-6 md:px-8 py-4 flex justify-between items-center mb-4">
              <span className="text-lg md:text-xl font-bold tracking-wide">AM - PM DÍA 2</span>
              <span className="text-sm md:text-base text-gray-200">09:00 - 17:30 hrs.</span>
            </div>

            <div className="divide-y divide-gray-200">
              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">09:00 - 10:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Recepción e Ingreso de Asistentes</p>
                  <p className="text-sm text-gray-500 mt-1">Check-in con código QR y ubicación en auditorio.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">10:00 - 11:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Conferencia Magistral: Lidera Como Atleta</p>
                  <p className="text-sm text-gray-500 mt-1">Disciplina, mentalidad de alto rendimiento y resiliencia empresarial.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">11:00 - 11:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Coffee Break & Networking</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">11:30 - 12:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Inteligencia Artificial Aplicada a los Negocios</p>
                  <p className="text-sm text-gray-500 mt-1">Casos de uso reales, automatización y herramientas productivas.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">12:30 - 13:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Receso & Recorrido EXPO SUMMIT</p>
                  <p className="text-sm text-gray-500 mt-1">Área gastronómica y vinculación comercial.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">13:30 - 14:20</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Taller Práctico: Ventas de Alto Valor</p>
                  <p className="text-sm text-gray-500 mt-1">Estrategias B2B y cierre de clientes estratégicos.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">14:30 - 15:20</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Nearshoring y Oportunidades para PYMES en el Extranjero</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">15:30 - 17:00</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Conferencia Magistral de Cierre</p>
                  <p className="text-sm text-gray-500 mt-1">Visión de futuro para los jóvenes líderes de México.</p>
                </div>
              </div>

              <div className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700">17:00 - 17:30</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Ceremonia de Clausura Oficial</p>
                  <p className="text-sm text-gray-500 mt-1">Entrega de reconocimientos y mensaje del comité organizador.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patrocinadores - Cinta Premium */}
      <section id="patrocinadores" className="premium-sponsors">
        <div className="premium-sponsors-header">
          <h2>
            PATROCINADORES <span>OFICIALES</span>
          </h2>
          <div className="premium-divider"></div>
          <p>
            EMPRESAS Y ORGANIZACIONES QUE COMPARTEN NUESTRA VISIÓN DE IMPULSAR EL DESARROLLO EMPRESARIAL DE MÉXICO.
          </p>
        </div>

        <div className="premium-marquee">
          <div className="premium-track">
            {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((item, idx) => (
              <div key={idx} className="premium-logo">
                <img src="/proximamente.png" alt={`Patrocinador ${item}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Registro y Pago CTA */}
      <section id="registro" className="py-20 px-6 max-w-3xl mx-auto text-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-brandNavy font-serif">Acceso Completo</h2>

          <div className="flex justify-center items-baseline gap-2 mt-6">
            <span className="text-4xl md:text-5xl font-bold text-brandNavy">$350.00</span>
            <span className="text-gray-500 font-medium">MXN · Boleto Oficial</span>
          </div>

          <ul className="text-sm text-gray-600 mt-6 space-y-2 text-left max-w-sm mx-auto font-medium">
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> KITS DE BIENVENIDA</li>
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CONFERENCIAS MAGISTRALES Y PANELES</li>
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> TALLERES PRÁCTICOS DE FORMACIÓN EMPRESARIAL</li>
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CONSULTORÍA EMPRESARIAL Y MENTORÍA 1 A 1</li>
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> COFFEE BREAK DE BIENVENIDA</li>
            <li className="flex items-start gap-2"><span className="text-brandGold mt-0.5">•</span> CERTIFICADO DE PARTICIPACIÓN ENVIADO A TU CORREO</li>
          </ul>

          <Link
            to="/registro"
            className="inline-block mt-8 bg-brandNavy text-white hover:bg-brandNavyDark font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 text-base"
          >
            Comprar Boletos Ahora →
          </Link>
        </div>
      </section>
    </div>
  );
}

