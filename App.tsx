
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { MaterialForecaster } from './components/MaterialForecaster';
import { ProjectScheduler } from './components/ProjectScheduler';
import { CashFlowPredictor } from './components/CashFlowPredictor';
import { CostEstimator } from './components/CostEstimator';
import { Language, RateComponents, Boq } from './types';
import { TRANSLATIONS, MATERIALS, LOCATIONS, RATE_PRESETS, MATERIAL_GST } from './constants';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('forecaster');
  
  // Lifted state to be shared across modules
  const [baseRates, setBaseRates] = useState<Record<string, RateComponents>>({});
  const [boq, setBoq] = useState<Boq>({});
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);

  // Initialize shared state
  useEffect(() => {
    const initialRates: Record<string, RateComponents> = {};
    const initialBoq: Boq = {};
    MATERIALS.forEach(material => {
      const basePrice = RATE_PRESETS.kolkata[material.id] || 100;
      initialRates[material.id] = {
        base: basePrice, freight: 0, gst: MATERIAL_GST[material.id] || 0, other: 0,
      };
      initialBoq[material.id] = 0;
    });
    setBaseRates(initialRates);
    setBoq(initialBoq);
  }, []);

  const handleRateChange = (materialId: string, component: keyof RateComponents, value: number) => {
    setBaseRates(prev => ({ ...prev, [materialId]: { ...prev[materialId], [component]: value } }));
  };

  const handleBoqChange = (materialId: string, quantity: number) => {
    setBoq(prev => ({ ...prev, [materialId]: quantity }));
  };
  
  const handleLoadPresets = () => {
    const presets = RATE_PRESETS[selectedLocation.id];
    if (presets) {
      const newRates: Record<string, RateComponents> = {};
      MATERIALS.forEach(material => {
        if (presets[material.id]) {
          newRates[material.id] = { base: presets[material.id], freight: 0, gst: MATERIAL_GST[material.id] || 0, other: 0 };
        }
      });
      setBaseRates(newRates);
    }
  };

  const t = TRANSLATIONS[lang];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'scheduler':
        return <ProjectScheduler lang={lang} location={selectedLocation} translations={t} />;
      case 'cashFlow':
        return <CashFlowPredictor lang={lang} translations={t} />;
      case 'costEstimator':
        return <CostEstimator lang={lang} boq={boq} rates={baseRates} location={selectedLocation} translations={t} />;
      case 'forecaster':
      default:
        return (
          <MaterialForecaster
            lang={lang}
            baseRates={baseRates}
            boq={boq}
            selectedLocation={selectedLocation}
            onRateChange={handleRateChange}
            onBoqChange={handleBoqChange}
            onLoadPresets={handleLoadPresets}
            onLocationChange={setSelectedLocation}
            translations={t}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header currentLang={lang} onLangChange={setLang} translations={t} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} translations={t} />
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>{(t.footer as Record<string, string>).builtFor}</p>
        <p>{(t.footer as Record<string, string>).disclaimer}</p>
      </footer>
    </div>
  );
};

export default App;
