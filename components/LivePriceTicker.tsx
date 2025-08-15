
import React from 'react';
import { LivePrice, Language, TranslationSet } from '../types';
import { MATERIALS } from '../constants';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons';

interface LivePriceTickerProps {
  prices: LivePrice[];
  lang: Language;
  translations: TranslationSet;
}

export const LivePriceTicker: React.FC<LivePriceTickerProps> = ({ prices, lang, translations }) => {
  if (!prices.length) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{translations.livePricesTitle as string}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{translations.livePricesSubtitle as string}</p>
        <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
                {prices.map((priceData) => {
                    const material = MATERIALS.find(m => m.id === priceData.materialId);
                    if (!material) return null;

                    const isPositive = priceData.percentageChange >= 0;
                    const colorClass = isPositive ? 'text-red-500' : 'text-green-500';

                    return (
                        <div key={material.id} className="flex-shrink-0 w-64 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 ring-1 ring-slate-900/5">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{material.name[lang]}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">per {material.baseUnit[lang]}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{priceData.price.toLocaleString('en-IN')}</p>
                            <div className={`flex items-center text-sm font-semibold ${colorClass}`}>
                                {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
                                <span>{Math.abs(priceData.percentageChange).toFixed(2)}%</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-2"> (₹{Math.abs(priceData.change).toFixed(2)})</span>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent pointer-events-none"></div>
             <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent pointer-events-none"></div>
        </div>
    </div>
  );
};
