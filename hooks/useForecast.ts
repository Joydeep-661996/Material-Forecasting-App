
import { useState, useCallback } from 'react';
import { ForecastDataPoint, ForecastResult, Material, Location, Language, ForecastHorizon, RateComponents, Boq, ProcurementPlan } from '../types';
import { fetchAiForecast, generateProcurementPlan } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

const initialForecast: ForecastResult = { data: [], commentary: '' };

export const useForecast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<ForecastDataPoint[]>([]);
  const [traditionalForecast, setTraditionalForecast] = useState<ForecastResult>(initialForecast);
  const [aiForecast, setAiForecast] = useState<ForecastResult>(initialForecast);
  const [procurementPlan, setProcurementPlan] = useState<ProcurementPlan | null>(null);
  const [procurementLoading, setProcurementLoading] = useState(false);


  const generateForecasts = useCallback(async (material: Material, location: Location, lang: Language, horizon: ForecastHorizon, baseRates: Record<string, RateComponents>, boq: Boq) => {
    setLoading(true);
    setError(null);
    setHistoricalData([]);
    setTraditionalForecast(initialForecast);
    setAiForecast(initialForecast);
    setProcurementPlan(null);

    try {
      const rateComponents = baseRates[material.id];
      if (!rateComponents || rateComponents.base === 0) {
        throw new Error(`Base rate for ${material.name[lang]} is not set.`);
      }
      
      // Calculate the total landed cost
      const landedCost = rateComponents.base + rateComponents.freight + (rateComponents.base * (rateComponents.gst / 100)) + rateComponents.other;

      // 1. Generate mock historical data based on user's current landed cost
      const now = new Date();
      const volatility = 0.05;
      
      const newHistoricalData: ForecastDataPoint[] = Array.from({ length: 6 }).map((_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        // Work backwards from the user's price
        const price = landedCost / (1 + (Math.random() - 0.5) * volatility * (6 - i));
        return {
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          price: parseFloat(price.toFixed(2)),
          type: 'historical'
        };
      });
      // Ensure the last historical point is the user's exact price
      newHistoricalData[newHistoricalData.length - 1].price = landedCost;
      setHistoricalData(newHistoricalData);

      // 2. Generate traditional forecast based on horizon
      const firstPrice = newHistoricalData[0].price || 0;
      const lastPrice = newHistoricalData[newHistoricalData.length - 1].price || 0;
      
      const newTraditionalForecast: ForecastDataPoint[] = [];
      const t = TRANSLATIONS[lang];
      
      if (horizon === 180) { // Monthly for 6 months
          const trend = (lastPrice - firstPrice) / 5;
          for (let i = 0; i < 6; i++) {
              const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
              const price = lastPrice + trend * (i + 1) * (1 + (Math.random() - 0.5) * 0.02);
              newTraditionalForecast.push({
                  period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  price: parseFloat(price.toFixed(2)),
                  type: 'traditional'
              });
          }
      } else { // Daily for shorter horizons
          const trend = (lastPrice - firstPrice) / 180; // Daily trend over 6 months
           for (let i = 1; i <= horizon; i++) {
               const price = lastPrice + trend * i * (1 + (Math.random() - 0.5) * 0.02);
               newTraditionalForecast.push({
                   period: `Day ${i}`,
                   price: parseFloat(price.toFixed(2)),
                   type: 'traditional'
               });
           }
      }

      setTraditionalForecast({
        data: newTraditionalForecast,
        commentary: `${t.traditionalTitle as string}. A simple trend projection based on historical data.`,
      });

      // 3. Fetch AI forecast from Gemini
      const historicalPrices = newHistoricalData.map(d => d.price || 0);
      const newAiForecast = await fetchAiForecast(material, location, historicalPrices, lang, horizon);
      setAiForecast(newAiForecast);
      
      // 4. Generate procurement plan if quantity is provided
      const quantity = boq[material.id];
      if (quantity > 0 && newAiForecast.data.length > 0) {
        setProcurementLoading(true);
        try {
            const plan = await generateProcurementPlan(material, location, newAiForecast.data, quantity, lang);
            setProcurementPlan(plan);
        } catch (planError) {
             if (planError instanceof Error) {
                // Set a specific error for the plan, but don't overwrite the main forecast error
                console.error("Procurement plan error:", planError.message);
                setProcurementPlan({
                    totalCost: 0,
                    recommendation: 'WAIT', // a safe default
                    reasoning: `Could not generate a procurement plan: ${planError.message}`
                })
            }
        } finally {
            setProcurementLoading(false);
        }
      }


    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    historicalData,
    traditionalForecast,
    aiForecast,
    procurementPlan,
    procurementLoading,
    generateForecasts,
  };
};