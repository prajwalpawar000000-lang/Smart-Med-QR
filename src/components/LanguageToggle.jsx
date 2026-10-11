import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const languages = [
    { code: 'en', label: 'English', ariaLabel: 'Switch to English' },
    { code: 'mr', label: 'मराठी', ariaLabel: 'Switch to Marathi' },
    { code: 'hi', label: 'हिंदी', ariaLabel: 'Switch to Hindi' },
  ];

  return (
    <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          aria-label={lang.ariaLabel}
          aria-pressed={language === lang.code}
          className={`
            px-2.5 py-1 text-sm font-medium transition-colors duration-200 rounded-md
            ${
              language === lang.code
                ? 'bg-[#1E9E8F] text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
