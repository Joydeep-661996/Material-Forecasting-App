
import React from 'react';
import { Language, TranslationSet, Boq, RateComponents, Location } from '../types';
import { useCostEstimator } from '../hooks/useCostEstimator';
import { Button } from './FormControls';
import { SparkleIcon } from './icons';

interface CostEstimatorProps {
  lang: Language;
  boq: Boq;
  rates: Record<string, RateComponents>;
  location: Location;
  translations: TranslationSet;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ lang, boq, rates, location, translations: t }) => {
    const { costs, updateCost, totalCost, loading, error, aiContingency, getAIContingency } = useCostEstimator(boq, rates);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t.costEstimatorTitle as string}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{t.costEstimatorSubtitle as string}</p>

                <div className="space-y-4">
                    {costs.map(cost => (
                        <div key={cost.id} className="grid grid-cols-3 items-center gap-4">
                            <label htmlFor={cost.id} className="col-span-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t[cost.id] as string || cost.name}
                            </label>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    id={cost.id}
                                    value={cost.amount}
                                    onChange={(e) => updateCost(cost.id, parseFloat(e.target.value) || 0)}
                                    disabled={!cost.isEditable}
                                    className="block w-full text-right px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md disabled:bg-slate-100 disabled:dark:bg-slate-800"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Button onClick={() => getAIContingency(location, lang)} disabled={loading}>
                        <SparkleIcon className="w-4 h-4 mr-2" />
                        {t.getAiContingency as string}
                    </Button>
                </div>
                {error && <p className="mt-2 text-red-500 text-right">{error}</p>}
                {aiContingency && (
                    <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sm text-sky-800 dark:text-sky-200 text-right">
                        <strong>AI Suggestion:</strong> {aiContingency.reasoning}
                    </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{t.totalProjectCost as string}</span>
                    <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                        {totalCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
            </div>
        </div>
    );
};
