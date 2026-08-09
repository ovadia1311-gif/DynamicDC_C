
import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation, Language } from '../../i18n/useTranslations';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      title={language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
    >
      <Languages className="w-4 h-4" />
      <span className="font-semibold">
        {language === 'en' ? 'עב' : 'EN'}
      </span>
    </button>
  );
}
