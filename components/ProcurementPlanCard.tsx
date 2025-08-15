
import React from 'react';
import { ProcurementPlan, TranslationSet } from '../types';
import { SparkleIcon, ArrowDownTrayIcon } from './icons';
import { SecondaryButton } from './FormControls';

interface ProcurementPlanCardProps {
  plan: ProcurementPlan | null;
  loading: boolean;
  onExport: () => void;
  translations: TranslationSet;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-6"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
);

export const ProcurementPlanCard: React.FC<ProcurementPlanCardProps> = ({ plan, loading, onExport, translations }) => {

    const recommendationText = plan ? (translations[plan.recommendation.toLowerCase() as keyof TranslationSet] as string || plan.recommendation) : '';

    const renderContent = () => {
        if (loading) {
            return <SkeletonLoader />;
        }
        if (!plan) {
            return null;
        }

        return (
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 sm:border-r sm:pr-6 border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{translations.totalCost as string}</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.totalCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-sky-600 dark:text-sky-400">{recommendationText}</p>
                </div>
                <div>
                     <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{translations.reasoning as string}</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{plan.reasoning}</p>
                </div>
            </div>
        )
    }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
                <SparkleIcon className="w-6 h-6 text-violet-500"/>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{translations.procurementPlanTitle as string}</h3>
            </div>
            {!loading && plan && (
                <SecondaryButton onClick={onExport}>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2 -ml-1"/>
                    {translations.exportPlan as string}
                </SecondaryButton>
            )}
        </div>
        {renderContent()}
    </div>
  );
};