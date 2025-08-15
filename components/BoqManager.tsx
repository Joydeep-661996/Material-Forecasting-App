
import React from 'react';
import { Language, TranslationSet, Boq, RateComponents } from '../types';
import { MATERIALS } from '../constants';
import { ClipboardDocumentListIcon } from './icons';
import { SecondaryButton } from './FormControls';

interface BoqManagerProps {
  boq: Boq;
  rates: Record<string, RateComponents>;
  onBoqChange: (materialId: string, quantity: number) => void;
  lang: Language;
  translations: TranslationSet;
}

const calculateLandedCost = (components: RateComponents): number => {
    if (!components) return 0;
    const gstAmount = components.base * (components.gst / 100);
    return components.base + components.freight + gstAmount + components.other;
}

export const BoqManager: React.FC<BoqManagerProps> = ({ boq, rates, onBoqChange, lang, translations }) => {

  const totalLandedCost = MATERIALS.reduce((total, material) => {
    const quantity = boq[material.id] || 0;
    const rateComponents = rates[material.id];
    if (quantity > 0 && rateComponents) {
      const landedCostPerUnit = calculateLandedCost(rateComponents);
      return total + (quantity * landedCostPerUnit);
    }
    return total;
  }, 0);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <ClipboardDocumentListIcon className="w-6 h-6 text-sky-500"/>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{translations.boqTitle as string}</h3>
      </div>
      <div className="flex-grow space-y-3 max-h-[450px] overflow-y-auto pr-2 -mr-2">
        {MATERIALS.map(material => (
          <div key={material.id} className="grid grid-cols-5 items-center gap-2">
            <label 
                htmlFor={`boq-${material.id}`} 
                className="col-span-3 text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
                title={material.name[lang]}
            >
              {material.name[lang]}
            </label>
            <div className="col-span-2 relative">
                <input
                    type="number"
                    id={`boq-${material.id}`}
                    value={boq[material.id] || ''}
                    onChange={(e) => onBoqChange(material.id, parseFloat(e.target.value) || 0)}
                    className="block w-full text-right px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="0"
                />
                 <span className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none text-xs text-slate-400 dark:text-slate-500 truncate">
                    {material.baseUnit[lang]}
                </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{translations.totalLandedCost as string}</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {totalLandedCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
          </span>
        </div>
        <SecondaryButton onClick={() => alert('Details Saved!')} >
          {translations.saveDetailsButton as string}
        </SecondaryButton>
      </div>
    </div>
  );
};
