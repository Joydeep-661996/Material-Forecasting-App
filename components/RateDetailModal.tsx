
import React from 'react';
import { Language, TranslationSet, Material, RateComponents } from '../types';
import { XMarkIcon } from './icons';

interface RateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  rates: RateComponents;
  onRateChange: (materialId: string, component: keyof RateComponents, value: number) => void;
  lang: Language;
  translations: TranslationSet;
}

const InputField: React.FC<{ label: string; id: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; symbol?: string; isPercent?: boolean }> = ({ label, id, value, onChange, symbol, isPercent }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {symbol && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500 sm:text-sm">{symbol}</span></div>}
            <input
                type="number"
                id={id}
                value={value}
                onChange={onChange}
                className={`block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-2 text-right focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${symbol ? 'pl-7' : ''} ${isPercent ? 'pr-8' : ''}`}
                placeholder="0.00"
            />
            {isPercent && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-slate-500 sm:text-sm">%</span></div>}
        </div>
    </div>
);

export const RateDetailModal: React.FC<RateDetailModalProps> = ({ isOpen, onClose, material, rates, onRateChange, lang, translations }) => {
  if (!isOpen) return null;

  const handleInputChange = (component: keyof RateComponents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onRateChange(material.id, component, parseFloat(e.target.value) || 0);
  };
  
  const landedCost = rates.base + rates.freight + (rates.base * (rates.gst / 100)) + rates.other;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white">{translations.editRates as string}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{material.name[lang]} (per {material.baseUnit[lang]})</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
              aria-label="Close"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
             <InputField label={translations.baseRate as string} id="base" value={rates.base} onChange={handleInputChange('base')} symbol="₹" />
             <InputField label={translations.freight as string} id="freight" value={rates.freight} onChange={handleInputChange('freight')} symbol="₹" />
             <InputField label={translations.gst as string} id="gst" value={rates.gst} onChange={handleInputChange('gst')} isPercent />
             <InputField label={translations.otherCharges as string} id="other" value={rates.other} onChange={handleInputChange('other')} symbol="₹" />
          </div>
          
           <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{translations.landedCost as string}:</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    ₹{landedCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
           </div>
           
           {material.conversionFactors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{translations.convertedPrices as string}</h4>
              {material.conversionFactors.map((conv, index) => {
                const convertedPrice = landedCost * conv.factor;
                return (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">per {conv.toUnit[lang]}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      ₹{convertedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )
              })}
            </div>
           )}

        </div>
         <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 text-right rounded-b-lg">
            <button
              onClick={onClose}
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              {translations.save as string}
            </button>
          </div>
      </div>
    </div>
  );
};