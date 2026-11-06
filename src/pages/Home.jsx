import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

export default function Home() {
  const { content } = useContent();

  const { hero, speakers, agendaDia1, agendaDia2, sponsors, about, ticket } = content;

  return (
    <div>
      {/* Hero / Encabezado Principal */}
      <section id="inicio" className="bg-brandNavy text-white relative overflow-hidden py-20 px-6 border-b border-brandGold/20">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Banner / Imagen del lema integrado */}
          <div className="mt-0 mb-4 max-w-3xl mx-auto bg-white/5 p-6 rounded-2xl border border-brandGold/30 backdrop-blur-sm shadow-xl">
            <img
              src={hero.bannerImage || '/cambio.jpeg'}
              alt={hero.title}
              className="w-full h-auto rounded-lg mx-auto"
            />
          </div>

          <div className="text-center mt-12 mb-8">
            <h2 className="text-4xl md:text-6xl font-semibold text-white font-serif">
              {hero.title || 'Summit Empresarial'}
            </h2>
          </div>

          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto mt-3 leading-relaxed whitespace-pre-line">
            {hero.subtitle}
          </p>

          <div className="mt-8">
            <Link
              to="/registro"
              className="inline-block bg-brandGold hover:bg-brandGoldHover text-brandNavy font-bold px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-1 text-sm md:text-base"
            >
              {hero.ctaText || 'Asegurar Mi Entrada Ahora →'}
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

        {/* Galería de Aliados / Conferencistas Dinámica */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {speakers.map((sp, idx) => (
            <div
              key={sp.id || idx}
              className={`bg-white h-52 p-3 rounded-2xl shadow-md border-t-4 ${
                idx % 2 === 0 ? 'border-brandGold' : 'border-brandNavy'
              } flex flex-col items-center justify-center hover:-translate-y-1 transition text-center`}
            >
              <div className="w-full h-32 flex items-center justify-center mb-2">
                <img src={sp.photo || '/invitado.png'} alt={sp.name} className="max-h-full max-w-full object-contain" />
              </div>
              <h4 className="font-bold text-xs md:text-sm text-brandNavy line-clamp-1">{sp.name}</h4>
              <p className="text-[11px] text-gray-500 line-clamp-1">{sp.title}</p>
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
                  src={about.organizerLogo || '/SUMMITBLANCO.jpeg'}
                  alt="Red Mundial de Jóvenes Políticos"
                  className="h-24 md:h-36 w-auto max-w-full object-contain"
                />
              </div>

              {/* Información */}
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-brandNavy font-serif mb-5">
                  {about.title || 'Acerca de Summit Empresarial México'}
                </h2>

                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {about.paragraph1}
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-sm md:text-base">
                  {about.paragraph2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Día 1 */}
      <section id="agenda" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brandNavy font-serif">AGENDA DEL EVENTO</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Programa Preliminar de las actividades</p>
        </div>

        <div className="bg-brandNavy rounded-[2rem] p-3 md:p-5 shadow-2xl">
          <div className="bg-white rounded-[1.5rem] p-4 md:p-8">
            <div className="bg-brandNavy text-white rounded-full px-6 md:px-8 py-4 flex justify-between items-center mb-4">
              <span className="text-lg md:text-xl font-bold tracking-wide">AM - PM DIA 1</span>
              <span className="text-sm md:text-base text-gray-200">08:00 - 17:30 hrs.</span>
            </div>

            <div className="divide-y divide-gray-200">
              {agendaDia1.map((item) => (
                <div key={item.id} className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                  <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700 font-mono">
                    {item.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
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
              {agendaDia2.map((item) => (
                <div key={item.id} className="py-5 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                  <span className="w-40 shrink-0 text-xl md:text-2xl font-bold text-blue-700 font-mono">
                    {item.time}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Patrocinadores - Cinta Premium Dinámica */}
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
            {/* Duplicamos la lista para crear el efecto de scroll continuo infinito */}
            {[...sponsors, ...sponsors].map((spn, idx) => (
              <div key={idx} className="premium-logo" title={spn.name}>
                <img src={spn.logo} alt={spn.name} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Registro y Pago CTA Dinámica */}
      <section id="registro" className="py-20 px-6 max-w-3xl mx-auto text-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-brandNavy font-serif">
            {ticket.title || 'Acceso Completo'}
          </h2>

          <div className="flex justify-center items-baseline gap-2 mt-6">
            <span className="text-4xl md:text-5xl font-bold text-brandNavy">
              ${(ticket.price || 350).toFixed(2)}
            </span>
            <span className="text-gray-500 font-medium">MXN · Boleto Oficial</span>
          </div>

          <ul className="text-sm text-gray-600 mt-6 space-y-2 text-left max-w-sm mx-auto font-medium">
            {ticket.features?.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brandGold mt-0.5">•</span>
                <span>{feat}</span>
              </li>
            ))}
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
