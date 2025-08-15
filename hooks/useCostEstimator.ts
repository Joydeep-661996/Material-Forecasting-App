
import { useState, useMemo, useCallback } from 'react';
import { Boq, RateComponents, CostCategory, Language, Location } from '../types';
import { suggestContingency } from '../services/geminiService';

const calculateLandedCost = (components: RateComponents): number => {
    if (!components) return 0;
    const gstAmount = components.base * (components.gst / 100);
    return components.base + components.freight + gstAmount + components.other;
};

export const useCostEstimator = (boq: Boq, rates: Record<string, RateComponents>) => {
    
    const materialCost = useMemo(() => {
        return Object.keys(boq).reduce((total, materialId) => {
            const quantity = boq[materialId] || 0;
            const rateComponents = rates[materialId];
            if (quantity > 0 && rateComponents) {
                const landedCostPerUnit = calculateLandedCost(rateComponents);
                return total + (quantity * landedCostPerUnit);
            }
            return total;
        }, 0);
    }, [boq, rates]);
    
    const [costs, setCosts] = useState<CostCategory[]>([
        { id: 'materials', name: 'Materials (from BOQ)', amount: 0, isEditable: false },
        { id: 'labor', name: 'Labor', amount: 0, isEditable: true },
        { id: 'overheads', name: 'Overheads & Equipment', amount: 0, isEditable: true },
        { id: 'contingency', name: 'Contingency', amount: 0, isEditable: true },
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiContingency, setAiContingency] = useState<{ percentage: number; reasoning: string} | null>(null);


    useMemo(() => {
        setCosts(prev => prev.map(c => c.id === 'materials' ? { ...c, amount: materialCost } : c));
    }, [materialCost]);

    const updateCost = (id: string, amount: number) => {
        setCosts(prev => prev.map(c => c.id === id ? { ...c, amount } : c));
    };

    const totalCost = useMemo(() => {
        return costs.reduce((total, cost) => total + cost.amount, 0);
    }, [costs]);

    const getAIContingency = useCallback(async (location: Location, lang: Language) => {
        setLoading(true);
        setError(null);
        setAiContingency(null);
        const subtotal = costs.filter(c => c.id !== 'contingency').reduce((sum, c) => sum + c.amount, 0);
        try {
            const result = await suggestContingency(subtotal, location, lang);
            if (result) {
                const percentage = result.contingencyPercentage;
                const reasoning = result.reasoning;
                setAiContingency({ percentage, reasoning });
                const contingencyAmount = subtotal * (percentage / 100);
                updateCost('contingency', contingencyAmount);
            }
        } catch(e) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [costs]);

    return { costs, updateCost, totalCost, loading, error, aiContingency, getAIContingency };
};
