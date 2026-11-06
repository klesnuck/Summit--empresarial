import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultContent = {
  hero: {
    title: 'Summit Empresarial',
    subtitle: 'SUMMIT EMPRESARIAL MÉXICO es uno de los programas de formación de la RED MUNDIAL DE JÓVENES POLÍTICOS MÉXICO, enfocado en el ámbito empresarial. A través de un sistema integral de innovación, desarrolla actividades concentradas en ponencias, talleres, dinámicas, mentoría profesional, consultoría empresarial, incubación y desarrollo de proyectos, acercando a las juventudes a una primera experiencia empresarial y profesional.',
    bannerImage: '/cambio.jpeg',
    ctaText: 'Asegurar Mi Entrada Ahora →',
  },
  speakers: [
    { id: 'sp-1', name: 'Conferencista Invitado 1', title: 'Líder Empresarial', photo: '/invitado.png' },
    { id: 'sp-2', name: 'Conferencista Invitado 2', title: 'Estratega de Negocios', photo: '/invitado.png' },
    { id: 'sp-3', name: 'Conferencista Invitado 3', title: 'Emprendedor & Inversor', photo: '/invitado.png' },
    { id: 'sp-4', name: 'Conferencista Invitado 4', title: 'Especialista en IA', photo: '/invitado.png' },
    { id: 'sp-5', name: 'Conferencista Invitado 5', title: 'Consultor Corporativo', photo: '/invitado.png' },
    { id: 'sp-6', name: 'Conferencista Invitado 6', title: 'Conferencista Magistral', photo: '/invitado.png' },
  ],
  agendaDia1: [
    { id: 'ag1-1', time: '08:00 - 09:00', title: 'REGISTRO Y COFFEE BREAK', description: 'Entrega de Kits de bienvenida · Asignación de lugares · Cierre de puertas 9:00 AM' },
    { id: 'ag1-2', time: '09:00 - 10:00', title: 'SALUDO A LA BANDERA & PROTOCOLO INAUGURAL', description: 'Banda de guerra · Mensaje de Antonio Rincón (Fundador) · Mensaje Rector Tec de Monterrey · Mensaje Presidente COPARMEX Jóvenes' },
    { id: 'ag1-3', time: '10:00 - 11:00', title: 'Bloque 1 | Visión Estratégica', description: 'Conferencia Magistral: El futuro de la competitividad empresarial.' },
    { id: 'ag1-4', time: '11:00 - 11:30', title: 'Coffee Break & Networking', description: 'Conexión con empresarios y aliados estratégicos.' },
    { id: 'ag1-5', time: '11:30 - 12:20', title: 'Bloque II | Diferenciación', description: 'Marca Personal Como Ventaja Competitiva.' },
    { id: 'ag1-6', time: '12:30 - 13:20', title: 'Panel Empresarial', description: 'Cómo Destacar En Un Mundo De Oportunidades.' },
    { id: 'ag1-7', time: '13:30 - 14:30', title: 'Receso de Almuerzo', description: 'Receso libre para comer y visitar stands de patrocinadores.' },
    { id: 'ag1-8', time: '14:30 - 15:30', title: 'Innovación Como Ventaja Competitiva', description: 'Herramientas y metodologías ágiles de crecimiento.' },
    { id: 'ag1-9', time: '15:30 - 17:00', title: 'Conferencia Magistral de Cierre Día 1', description: 'Dinámica Startup México y presentación de proyectos destacados.' },
    { id: 'ag1-10', time: '17:00 - 17:30', title: 'Cierre del Día 1', description: 'Show de saxofón en vivo y mensaje final de Antonio Rincón.' },
  ],
  agendaDia2: [
    { id: 'ag2-1', time: '09:00 - 10:00', title: 'Recepción e Ingreso de Asistentes', description: 'Check-in con código QR y ubicación en auditorio.' },
    { id: 'ag2-2', time: '10:00 - 11:00', title: 'Conferencia Magistral: Lidera Como Atleta', description: 'Disciplina, mentalidad de alto rendimiento y resiliencia empresarial.' },
    { id: 'ag2-3', time: '11:00 - 11:30', title: 'Coffee Break & Networking', description: 'Encuentro con ponentes y delegados nacionales.' },
    { id: 'ag2-4', time: '11:30 - 12:30', title: 'Inteligencia Artificial Aplicada a los Negocios', description: 'Casos de uso reales, automatización y herramientas productivas.' },
    { id: 'ag2-5', time: '12:30 - 13:30', title: 'Receso & Recorrido EXPO SUMMIT', description: 'Área gastronómica y vinculación comercial.' },
    { id: 'ag2-6', time: '13:30 - 14:20', title: 'Taller Práctico: Ventas de Alto Valor', description: 'Estrategias B2B y cierre de clientes estratégicos.' },
    { id: 'ag2-7', time: '14:30 - 15:20', title: 'Nearshoring y Oportunidades para PYMES en el Extranjero', description: 'Oportunidades binacionales y encadenamiento productivo.' },
    { id: 'ag2-8', time: '15:30 - 17:00', title: 'Conferencia Magistral de Cierre', description: 'Visión de futuro para los jóvenes líderes de México.' },
    { id: 'ag2-9', time: '17:00 - 17:30', title: 'Ceremonia de Clausura Oficial', description: 'Entrega de reconocimientos y mensaje del comité organizador.' },
  ],
  sponsors: [
    { id: 'spn-1', name: 'Patrocinador Oficial 1', logo: '/proximamente.png' },
    { id: 'spn-2', name: 'Patrocinador Oficial 2', logo: '/proximamente.png' },
    { id: 'spn-3', name: 'Patrocinador Oficial 3', logo: '/proximamente.png' },
    { id: 'spn-4', name: 'Patrocinador Oficial 4', logo: '/proximamente.png' },
    { id: 'spn-5', name: 'Patrocinador Oficial 5', logo: '/proximamente.png' },
    { id: 'spn-6', name: 'Patrocinador Oficial 6', logo: '/proximamente.png' },
  ],
  about: {
    title: 'Acerca de Summit Empresarial México',
    organizerLogo: '/SUMMITBLANCO.jpeg',
    paragraph1: 'LA PRIMERA EDICION de Summit Empresarial México se llevó a cabo EN SALTILLO COAHUILA EN EL CENTRO CULTURAL VITO ALESSIO ROBLES, en donde más de 150 jóvenes participaron a lo largo de dos días, con 15 ponentes en total, se llevaron a cabo dinámicas de empresas aliadas, y la EXPO SUMMIT dando la oportunidad a emprendedores de dar a conocer su negocio.',
    paragraph2: 'La edición online de Summit Empresarial significó el lanzamiento nacional del programa donde más de 300 jóvenes participaron en sesiones de 60 minutos con ponentes altamente calificados e involucrados en el sector empresarial.',
  },
  ticket: {
    price: 350.00,
    currency: 'MXN',
    title: 'Acceso Completo',
    features: [
      'KITS DE BIENVENIDA',
      'CONFERENCIAS MAGISTRALES Y PANELES',
      'TALLERES PRÁCTICOS DE FORMACIÓN EMPRESARIAL',
      'CONSULTORÍA JURÍDICA Y EMPRESARIAL Y MENTORÍA 1 A 1',
      'COFFEE BREAK DE BIENVENIDA',
      'CERTIFICADO DE PARTICIPACIÓN ENVIADO A TU CORREO'
    ]
  }
};

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('summit_site_content');
      return saved ? JSON.parse(saved) : defaultContent;
    } catch (e) {
      return defaultContent;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('summit_site_content', JSON.stringify(content));
    } catch (e) {
      console.warn('Error saving content:', e);
    }
  }, [content]);

  // Actualizar Hero
  const updateHero = (newHero) => {
    setContent(prev => ({ ...prev, hero: { ...prev.hero, ...newHero } }));
  };

  // Agenda
  const addAgendaItem = (day, item) => {
    const key = day === 1 ? 'agendaDia1' : 'agendaDia2';
    const newItem = { ...item, id: `ag${day}-${Date.now()}` };
    setContent(prev => ({
      ...prev,
      [key]: [...prev[key], newItem]
    }));
  };

  const updateAgendaItem = (day, id, updatedItem) => {
    const key = day === 1 ? 'agendaDia1' : 'agendaDia2';
    setContent(prev => ({
      ...prev,
      [key]: prev[key].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
  };

  const deleteAgendaItem = (day, id) => {
    const key = day === 1 ? 'agendaDia1' : 'agendaDia2';
    setContent(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
  };

  // Conferencistas
  const addSpeaker = (speaker) => {
    const newSp = { ...speaker, id: `sp-${Date.now()}` };
    setContent(prev => ({
      ...prev,
      speakers: [...prev.speakers, newSp]
    }));
  };

  const updateSpeaker = (id, updatedSpeaker) => {
    setContent(prev => ({
      ...prev,
      speakers: prev.speakers.map(s => s.id === id ? { ...s, ...updatedSpeaker } : s)
    }));
  };

  const deleteSpeaker = (id) => {
    setContent(prev => ({
      ...prev,
      speakers: prev.speakers.filter(s => s.id !== id)
    }));
  };

  // Patrocinadores
  const addSponsor = (sponsor) => {
    const newSpn = { ...sponsor, id: `spn-${Date.now()}` };
    setContent(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, newSpn]
    }));
  };

  const updateSponsor = (id, updatedSponsor) => {
    setContent(prev => ({
      ...prev,
      sponsors: prev.sponsors.map(s => s.id === id ? { ...s, ...updatedSponsor } : s)
    }));
  };

  const deleteSponsor = (id) => {
    setContent(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.id !== id)
    }));
  };

  // Acerca de
  const updateAbout = (newAbout) => {
    setContent(prev => ({ ...prev, about: { ...prev.about, ...newAbout } }));
  };

  // Boletos Config
  const updateTicketConfig = (newTicket) => {
    setContent(prev => ({ ...prev, ticket: { ...prev.ticket, ...newTicket } }));
  };

  // Restaurar todo a valores por defecto
  const resetToDefaults = () => {
    setContent(defaultContent);
    localStorage.removeItem('summit_site_content');
  };

  return (
    <ContentContext.Provider value={{
      content,
      updateHero,
      addAgendaItem,
      updateAgendaItem,
      deleteAgendaItem,
      addSpeaker,
      updateSpeaker,
      deleteSpeaker,
      addSponsor,
      updateSponsor,
      deleteSponsor,
      updateAbout,
      updateTicketConfig,
      resetToDefaults
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);

