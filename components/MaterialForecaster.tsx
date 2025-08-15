
import React, { useState, useCallback, useEffect } from 'react';
import { ForecastCard } from './ForecastCard';
import { PriceChart } from './PriceChart';
import { LivePriceTicker } from './LivePriceTicker';
import { BaseRateManager } from './BaseRateManager';
import { RateDetailModal } from './RateDetailModal';
import { SupplierList } from './SupplierList';
import { BoqManager } from './BoqManager';
import { ProcurementPlanCard } from './ProcurementPlanCard';
import { useForecast } from '../hooks/useForecast';
import { Language, Material, Location, LivePrice, ForecastHorizon, Supplier, RateComponents, Boq, TranslationSet } from '../types';
import { TRANSLATIONS, MATERIALS, LOCATIONS, FORECAST_HORIZONS, RATE_PRESETS } from '../constants';
import { Select, Button, SecondaryButton } from './FormControls';
import { SparkleIcon, InfoIcon } from './icons';
import { fetchNearbySuppliers } from '../services/geminiService';

interface MaterialForecasterProps {
    lang: Language;
    baseRates: Record<string, RateComponents>;
    boq: Boq;
    selectedLocation: Location;
    onRateChange: (materialId: string, component: keyof RateComponents, value: number) => void;
    onBoqChange: (materialId: string, quantity: number) => void;
    onLoadPresets: () => void;
    onLocationChange: (location: Location) => void;
    translations: TranslationSet;
}

export const MaterialForecaster: React.FC<MaterialForecasterProps> = (props) => {
    const { lang, baseRates, boq, selectedLocation, onRateChange, onBoqChange, onLoadPresets, onLocationChange, translations: t } = props;

    const [selectedMaterial, setSelectedMaterial] = useState<Material>(MATERIALS[0]);
    const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>(180);
    const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
    const [supplierSearchError, setSupplierSearchError] = useState<string | null>(null);

    const {
        historicalData, traditionalForecast, aiForecast, procurementPlan, procurementLoading, loading, error, generateForecasts,
    } = useForecast();

    useEffect(() => {
        const prices = MATERIALS.map(material => {
            const basePrice = RATE_PRESETS.kolkata[material.id] || 100;
            const yesterdayPrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
            const todayPrice = yesterdayPrice * (1 + (Math.random() - 0.5) * 0.03);
            const change = todayPrice - yesterdayPrice;
            const percentageChange = (change / yesterdayPrice) * 100;
            return {
                materialId: material.id, price: parseFloat(todayPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)), percentageChange: parseFloat(percentageChange.toFixed(2))
            };
        });
        setLivePrices(prices);
    }, []);

    const handleEditRate = (materialId: string) => setEditingMaterialId(materialId);
    const handleCloseModal = () => setEditingMaterialId(null);

    const handleGenerateClick = useCallback(() => {
        setSuppliers([]);
        setSupplierSearchError(null);
        generateForecasts(selectedMaterial, selectedLocation, lang, forecastHorizon, baseRates, boq);
    }, [selectedMaterial, selectedLocation, lang, forecastHorizon, baseRates, boq, generateForecasts]);

    const handleFindSuppliers = useCallback(async () => {
        setSupplierSearchLoading(true);
        setSupplierSearchError(null);
        setSuppliers([]);
        try {
            const results = await fetchNearbySuppliers(selectedMaterial, selectedLocation);
            setSuppliers(results);
        } catch (e) {
            setSupplierSearchError((e as Error).message);
        } finally {
            setSupplierSearchLoading(false);
        }
    }, [selectedMaterial, selectedLocation]);

    const handleExportPlan = useCallback(() => {
        if (!procurementPlan || !selectedMaterial) return;
        const headers = [t.materialLabel, t.quantity, t.recommendation, t.totalCost, t.reasoning];
        const recommendationText = t[procurementPlan.recommendation.toLowerCase() as keyof TranslationSet] as string || procurementPlan.recommendation;
        const row = [
            selectedMaterial.name[lang], boq[selectedMaterial.id], recommendationText,
            `"${procurementPlan.totalCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}"`,
            `"${procurementPlan.reasoning.replace(/"/g, '""')}"`
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + row.join(",");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `procurement_plan_${selectedMaterial.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [procurementPlan, selectedMaterial, boq, lang, t]);

    const editingMaterial = editingMaterialId ? MATERIALS.find(m => m.id === editingMaterialId) : null;

    return (
        <>
            <LivePriceTicker prices={livePrices} lang={lang} translations={t} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t.title as string}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{t.subtitle as string}</p>
                        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-6 items-end">
                            <div className="md:col-span-2">
                                <Select label={t.materialLabel as string} value={selectedMaterial.id}
                                    onChange={(e) => setSelectedMaterial(MATERIALS.find(m => m.id === e.target.value) || MATERIALS[0])}
                                    options={MATERIALS.map(m => ({ value: m.id, label: m.name[lang] }))} />
                            </div>
                            <div className="md:col-span-3">
                                <div className="flex items-end space-x-2">
                                    <div className="flex-grow">
                                        <Select label={t.locationLabel as string} value={selectedLocation.id}
                                            onChange={(e) => onLocationChange(LOCATIONS.find(l => l.id === e.target.value) || LOCATIONS[0])}
                                            options={LOCATIONS.map(l => ({ value: l.id, label: l.name }))} />
                                    </div>
                                    <div className="flex-shrink-0">
                                        <SecondaryButton onClick={onLoadPresets}>{t.loadPresetsButton as string}</SecondaryButton>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Select label={t.horizonLabel as string} value={forecastHorizon}
                                    onChange={(e) => setForecastHorizon(Number(e.target.value) as ForecastHorizon)}
                                    options={FORECAST_HORIZONS.map(h => ({ value: h.value.toString(), label: t[h.labelKey] as string }))} />
                            </div>
                            <div className="md:col-span-1">
                                <Button onClick={handleGenerateClick} disabled={loading}>{loading ? t.loadingButton as string : t.generateButton as string}</Button>
                            </div>
                        </div>
                        <BaseRateManager rates={baseRates} onEditRate={handleEditRate} lang={lang} translations={t} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <BoqManager boq={boq} rates={baseRates} onBoqChange={onBoqChange} lang={lang} translations={t} />
                </div>
            </div>

            {editingMaterial && (
                <RateDetailModal isOpen={!!editingMaterialId} onClose={handleCloseModal} material={editingMaterial}
                    rates={baseRates[editingMaterialId]} onRateChange={onRateChange} lang={lang} translations={t} />
            )}

            {error && <div className="mt-8 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <strong>{t.errorTitle as string}:</strong> {error}
            </div>}

            {(loading || historicalData.length > 0) && (
                <div className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-5"><PriceChart data={[...historicalData, ...traditionalForecast.data, ...aiForecast.data]} lang={lang} loading={loading} /></div>
                        <div className="lg:col-span-2"><ForecastCard title={t.traditionalTitle as string} icon={<InfoIcon className="w-6 h-6 text-sky-500" />} forecast={traditionalForecast} horizon={forecastHorizon} loading={loading} currency="₹" translations={t} /></div>
                        <div className="lg:col-span-3"><ForecastCard title={t.aiTitle as string} icon={<SparkleIcon className="w-6 h-6 text-violet-500" />} forecast={aiForecast} horizon={forecastHorizon} loading={loading} currency="₹" translations={t} /></div>
                    </div>
                    {!loading && historicalData.length > 0 && (
                        <>
                            {(procurementPlan || procurementLoading) && (
                                <div className="mt-8"><ProcurementPlanCard plan={procurementPlan} loading={procurementLoading} onExport={handleExportPlan} translations={t} /></div>
                            )}
                            <div className="mt-8 bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.procurementTitle as string}</h2>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{(t.procurementSubtitle as string).replace('{material}', selectedMaterial.name[lang])}</p>
                                    <Button onClick={handleFindSuppliers} disabled={supplierSearchLoading}><SparkleIcon className="w-5 h-5 mr-2 -ml-1"/>{supplierSearchLoading ? t.findingSuppliersButton as string : t.findSuppliersButton as string}</Button>
                                </div>
                                <SupplierList suppliers={suppliers} loading={supplierSearchLoading} error={supplierSearchError} lang={lang} translations={t} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
