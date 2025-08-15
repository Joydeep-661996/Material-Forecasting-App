
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastDataPoint, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PriceChartProps {
  data: ForecastDataPoint[];
  lang: Language;
  loading: boolean;
}

const ChartSkeletonLoader: React.FC = () => (
    <div className="animate-pulse bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="w-full h-80 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
    </div>
)

export const PriceChart: React.FC<PriceChartProps> = ({ data, lang, loading }) => {
  if (loading) return <ChartSkeletonLoader />;
  if (!data || data.length === 0) return null;

  const t = TRANSLATIONS[lang];

  const historicalData = data.filter(d => d.type === 'historical');
  const traditionalData = data.filter(d => d.type === 'traditional');
  const aiData = data.filter(d => d.type === 'ai');

  // We need to merge the data points for the same period to have all lines in one chart
  const periodMap = new Map<string, any>();
  
  const processData = (points: ForecastDataPoint[], key: string) => {
    points.forEach(p => {
      if (!periodMap.has(p.period)) {
        periodMap.set(p.period, { period: p.period });
      }
      if(p.price !== null) {
        periodMap.get(p.period)[key] = p.price;
      }
    });
  };

  processData(historicalData, 'historicalPrice');
  processData(traditionalData, 'traditionalPrice');
  processData(aiData, 'aiPrice');

  const chartData = Array.from(periodMap.values());
  
  // Ensure the historical and forecast data connect smoothly
  const lastHistorical = historicalData[historicalData.length - 1];
  if (lastHistorical) {
    const firstTraditional = periodMap.get(traditionalData[0]?.period);
    if(firstTraditional) firstTraditional.historicalPrice = lastHistorical.price;
     const firstAi = periodMap.get(aiData[0]?.period);
    if(firstAi) firstAi.historicalPrice = lastHistorical.price;
  }
  
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-4 sm:p-6 ring-1 ring-slate-900/5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 ml-4">{t.chartTitle as string}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="period" tick={{ fill: 'currentColor', fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) => `₹${value}`}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            domain={['dataMin - 10', 'dataMax + 10']}
            allowDataOverflow={true}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              color: '#334155',
            }}
            formatter={(value, name) => [`₹${(value as number).toFixed(2)}`, name]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="historicalPrice"
            name={t.historical as string}
            stroke="#475569"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="traditionalPrice"
            name={t.traditional as string}
            stroke="#0ea5e9"
            strokeWidth={2}
            strokeDasharray="5 5"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="aiPrice"
            name={t.ai_enhanced as string}
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8b5cf6' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
