import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-brandNavyDark text-white py-8 px-6 border-t border-brandGold/30 mt-auto no-print">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-gray-400">
          © 2026{' '}
          <span className="text-brandGold font-semibold">
            SUMMIT EMPRESARIAL MÉXICO
          </span>{' '}
          · Todos los derechos reservados.
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Formación, innovación y liderazgo para la nueva generación empresarial de México.
        </p>

        {/* Redes Sociales */}
        <div className="flex justify-center items-center gap-5 mt-5">
          <a href="mailto:summitempresarialmexico@gmail.com" aria-label="Gmail" className="text-gray-400 hover:text-brandGold transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </a>
          <a href="https://instagram.com/summitempresarialmexico" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-brandGold transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-5 h-5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@summitempresarialmexico" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-brandGold transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M14 3c.3 1.9 1.6 3.3 3.5 3.6v2.4c-1.3 0-2.5-.4-3.5-1.1v6.3a4.9 4.9 0 1 1-4.2-4.9v2.5a2.4 2.4 0 1 0 1.7 2.3V3h2.5Z" />
            </svg>
          </a>
        </div>

        {/* Firma */}
        <p className="text-[10px] text-gray-500 uppercase mt-4">
          Summit Empresarial México
        </p>
      </div>
    </footer>
  );
}

