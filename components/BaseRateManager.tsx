import React from 'react';
import { Language, TranslationSet, RateComponents } from '../types';
import { MATERIALS } from '../constants';
import { PencilIcon } from './icons';

interface BaseRateManagerProps {
  rates: Record<string, RateComponents>;
  onEditRate: (materialId: string) => void;
  lang: Language;
  translations: TranslationSet;
}

const calculateLandedCost = (components: RateComponents): number => {
    if (!components) return 0;
    const gstAmount = components.base * (components.gst / 100);
    return components.base + components.freight + gstAmount + components.other;
}

export const BaseRateManager: React.FC<BaseRateManagerProps> = ({ rates, onEditRate, lang, translations }) => {
  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{translations.yourRatesTitle as string}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {MATERIALS.map(material => {
          const landedCost = calculateLandedCost(rates[material.id]);
          const formattedCost = landedCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return (
            <div key={material.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={material.name[lang]}>
                  {material.name[lang]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">/ {material.baseUnit[lang]}</p>
              </div>
              <div className="flex items-center justify-between mt-2 gap-2">
                 <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate min-w-0" title={`₹${formattedCost}`}>
                    ₹{formattedCost}
                 </p>
                 <button 
                    onClick={() => onEditRate(material.id)} 
                    className="flex-shrink-0 p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                    aria-label={`${translations.editRates} for ${material.name[lang]}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};