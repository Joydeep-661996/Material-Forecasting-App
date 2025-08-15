
import React from 'react';
import { Language, TranslationSet } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  translations: TranslationSet;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onLangChange }) => {
  const languages: { key: Language; label: string }[] = [
    { key: 'en', label: 'EN' },
    { key: 'hi', label: 'हिंदी' },
    { key: 'bn', label: 'বাংলা' },
  ];

  return (
    <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <LogoIcon className="h-8 w-8 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
              Nirman<span className="text-sky-500">AI</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {languages.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onLangChange(key)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                  currentLang === key
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};