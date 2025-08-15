
import { useState, useCallback } from 'react';
import { CashFlowItem, CashFlowRisk, Language } from '../types';
import { analyzePaymentDelays } from '../services/geminiService';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const useCashFlow = () => {
    const [items, setItems] = useState<CashFlowItem[]>([
        { id: 1, description: 'Client Advance Payment', amount: 500000, date: getTodayDateString(), type: 'income', isRecurring: false },
        { id: 2, description: 'Steel Purchase', amount: 150000, date: getTodayDateString(), type: 'expense', isRecurring: false },
    ]);
    const [initialBalance, setInitialBalance] = useState(100000);
    const [risks, setRisks] = useState<CashFlowRisk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addItem = () => {
        const newItem: CashFlowItem = {
            id: Date.now(),
            description: '',
            amount: 0,
            date: getTodayDateString(),
            type: 'expense',
            isRecurring: false,
        };
        setItems(prev => [...prev, newItem]);
    };
    
    const updateItem = (id: number, updatedItem: Partial<CashFlowItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    };

    const analyzeRisks = useCallback(async (lang: Language) => {
        setLoading(true);
        setError(null);
        setRisks([]);
        try {
            const results = await analyzePaymentDelays(items, lang);
            setRisks(results);
        } catch(e) {
            if (e instanceof Error) setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [items]);

    const getChartData = () => {
        const sortedItems = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const data: { date: string; balance: number }[] = [];
        let currentBalance = initialBalance;

        if (sortedItems.length > 0) {
            const firstDate = new Date(sortedItems[0].date);
            firstDate.setDate(firstDate.getDate() - 1);
            data.push({ date: firstDate.toLocaleDateString('en-CA'), balance: initialBalance });
        } else {
             data.push({ date: new Date().toLocaleDateString('en-CA'), balance: initialBalance });
        }

        sortedItems.forEach(item => {
            currentBalance += item.type === 'income' ? item.amount : -item.amount;
            data.push({ date: new Date(item.date).toLocaleDateString('en-CA'), balance: currentBalance });
        });

        return data;
    };


    return { items, setItems: updateItem, addItem, initialBalance, setInitialBalance, risks, loading, error, analyzeRisks, getChartData };
};
