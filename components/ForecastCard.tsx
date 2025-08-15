import React from 'react';
import { ForecastResult, TranslationSet, ForecastHorizon } from '../types';
import { FORECAST_HORIZONS } from '../constants';

interface ForecastCardProps {
  title: string;
  icon: React.ReactNode;
  forecast: ForecastResult;
  horizon: ForecastHorizon;
  loading: boolean;
  currency: string;
  translations: TranslationSet;
}

const SkeletonLoader: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
);

export const ForecastCard: React.FC<ForecastCardProps> = ({ title, icon, forecast, horizon, loading, currency, translations }) => {
    const { data, commentary } = forecast;

    const renderContent = () => {
        if (loading) {
            return <SkeletonLoader />;
        }
        if (data.length === 0) {
            return <p className="text-slate-500 dark:text-slate-400">{translations.noData as string}</p>;
        }

        const firstPrice = data[0]?.price;
        const lastPrice = data[data.length - 1]?.price;
        const change = lastPrice !== null && firstPrice !== null ? lastPrice - firstPrice : null;
        const percentageChange = change !== null && firstPrice !== 0 && firstPrice !== null ? (change / firstPrice) * 100 : null;

        const horizonLabel = FORECAST_HORIZONS.find(h => h.value === horizon)?.labelKey || '';
        const horizonText = (translations[horizonLabel] as string) || `${horizon} days`;

        return (
            <div>
                {firstPrice !== null && lastPrice !== null && (
                     <div className="mb-4">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {currency}{lastPrice.toFixed(2)}
                        </p>
                        {percentageChange !== null && (
                            <span className={`text-sm font-semibold ${percentageChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {percentageChange >= 0 ? '▲' : '▼'} {Math.abs(percentageChange).toFixed(1)}% ({currency}{Math.abs(change || 0).toFixed(2)})
                            </span>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           {translations.pricePerUnit as string} {horizonText}
                        </p>
                    </div>
                )}
               
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{translations.commentary as string}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{commentary}</p>
            </div>
        )
    }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 h-full ring-1 ring-slate-900/5">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {renderContent()}
    </div>
  );
};