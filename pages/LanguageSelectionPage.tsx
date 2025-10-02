import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { useGuest } from '../context/GuestContext';

const LanguageSelectionPage: React.FC = () => {
  const { languages, selectLanguage } = useLanguage();
  const { guest } = useGuest();
  const navigate = useNavigate();

  const handleLanguageSelect = (language: Language) => {
    selectLanguage(language);
    navigate('/guide');
  };

  return (
    <div className="container mx-auto max-w-2xl text-center py-10">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
        Hello, {guest?.name || 'Visitor'}!
      </h1>
      <p className="text-lg text-gray-600 mb-12">
        Choose your preferred language to begin your immersive cultural journey.
      </p>
      <div className="space-y-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang)}
            className="w-full text-left p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-500 w-12">{lang.code.toUpperCase()}</span>
              <div>
                <p className="text-xl font-semibold text-gray-900">{lang.name}</p>
                <p className="text-gray-500">{lang.nativeName}</p>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 transition-colors">&gt;</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelectionPage;