
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, TranslationSet } from '../types';
import { useCashFlow } from '../hooks/useCashFlow';
import { Button, SecondaryButton } from './FormControls';
import { SparkleIcon } from './icons';

interface CashFlowPredictorProps {
  lang: Language;
  translations: TranslationSet;
}

export const CashFlowPredictor: React.FC<CashFlowPredictorProps> = ({ lang, translations: t }) => {
    const { items, setItems, addItem, initialBalance, setInitialBalance, risks, loading, error, analyzeRisks, getChartData } = useCashFlow();

    const chartData = getChartData();

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t.cashFlowTitle as string}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{t.cashFlowSubtitle as string}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="initialBalance" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.initialBalance as string}</label>
                        <input type="number" id="initialBalance" value={initialBalance} onChange={e => setInitialBalance(parseFloat(e.target.value) || 0)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"/>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5"><input type="text" placeholder={t.description as string} value={item.description} onChange={e => setItems(item.id, { description: e.target.value })} className="w-full bg-transparent p-2 border-b dark:border-slate-600"/></div>
                            <div className="col-span-3"><input type="number" placeholder={t.amount as string} value={item.amount} onChange={e => setItems(item.id, { amount: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent p-2 border-b dark:border-slate-600"/></div>
                            <div className="col-span-2"><input type="date" value={item.date} onChange={e => setItems(item.id, { date: e.target.value })} className="w-full bg-transparent p-2 border-b dark:border-slate-600"/></div>
                            <div className="col-span-2">
                                <select value={item.type} onChange={e => setItems(item.id, { type: e.target.value as 'income' | 'expense' })} className="w-full bg-transparent p-2 border-b dark:border-slate-600 dark:bg-slate-800">
                                    <option value="income">{t.income as string}</option>
                                    <option value="expense">{t.expense as string}</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <SecondaryButton onClick={addItem}>{t.addItem as string}</SecondaryButton>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.cashFlowChartTitle as string}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `₹${(value/1000)}k`} />
                        <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString('en-IN')}`, 'Balance']} />
                        <Line type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.aiPaymentRiskTitle as string}</h3>
                <Button onClick={() => analyzeRisks(lang)} disabled={loading}><SparkleIcon className="w-5 h-5 mr-2 -ml-1"/>{loading ? t.analyzing as string : t.analyzePayments as string}</Button>
                {error && <p className="mt-4 text-red-500">{error}</p>}
                {risks.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {risks.map((risk, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{risk.invoice}</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.riskLevel === 'High' ? 'bg-red-100 text-red-800' : risk.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                        {risk.riskLevel}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{risk.reasoning}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
