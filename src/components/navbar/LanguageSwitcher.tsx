import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng); // Cambia el idioma en i18next
    setIsOpen(false);          // Cierra el menú
  };

  // Detecta si es el idioma actual para marcarlo en negrita/color
  const currentLang = i18n.language; 

  return (
    <div className="relative">
      {/* BOTÓN PRINCIPAL (Icono) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Cambiar idioma"
      >
        <Languages size={24} />
      </button>

      {/* MENÚ DESPLEGABLE */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          
          {/* Opción: Español */}
          <button
            onClick={() => changeLanguage('es')}
            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50
              ${currentLang === 'es' ? 'text-blue-600 font-medium' : 'text-gray-700'}
            `}
          >
            <span>Español</span>
            {currentLang === 'es' && <Check size={16} />}
          </button>

          {/* Opción: Inglés */}
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50
              ${currentLang === 'en' ? 'text-blue-600 font-medium' : 'text-gray-700'}
            `}
          >
            <span>English</span>
            {currentLang === 'en' && <Check size={16} />}
          </button>

          <button
            onClick={() => changeLanguage('fr')}
            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50
              ${currentLang === 'fr' ? 'text-blue-600 font-medium' : 'text-gray-700'}
            `}
          >
            <span>Francés</span>
            {currentLang === 'fr' && <Check size={16} />}
          </button>

        </div>
      )}
      
      {/* (Opcional) Fondo transparente para cerrar al hacer clic fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};