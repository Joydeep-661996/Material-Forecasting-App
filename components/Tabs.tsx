
import React from 'react';
import { Language, TranslationSet } from '../types';
import { SparkleIcon, CalendarDaysIcon, BanknotesIcon, CalculatorIcon } from './icons';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  translations: TranslationSet;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, lang, translations }) => {
  const tabs = [
    { id: 'forecaster', label: translations.forecasterTab as string, icon: <SparkleIcon className="w-5 h-5 mr-2" /> },
    { id: 'scheduler', label: translations.schedulerTab as string, icon: <CalendarDaysIcon className="w-5 h-5 mr-2" /> },
    { id: 'cashFlow', label: translations.cashFlowTab as string, icon: <BanknotesIcon className="w-5 h-5 mr-2" /> },
    { id: 'costEstimator', label: translations.costEstimatorTab as string, icon: <CalculatorIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
