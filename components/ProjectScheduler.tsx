
import React from 'react';
import { Language, TranslationSet, Location } from '../types';
import { useScheduler } from '../hooks/useScheduler';
import { Button, SecondaryButton } from './FormControls';
import { SparkleIcon } from './icons';

interface ProjectSchedulerProps {
  lang: Language;
  location: Location;
  translations: TranslationSet;
}

export const ProjectScheduler: React.FC<ProjectSchedulerProps> = ({ lang, location, translations: t }) => {
    const { tasks, setTasks, isCalculated, loading, error, risks, riskLoading, calculateSchedule, analyzeRisks } = useScheduler();

    const handleTaskChange = (id: number, field: 'name' | 'duration' | 'dependencies', value: string | number) => {
        setTasks(currentTasks => currentTasks.map(task =>
            task.id === id ? { ...task, [field]: value } : task
        ));
    };

    const addTask = () => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        setTasks(prev => [...prev, { id: newId, name: `New Task ${newId}`, duration: 1, dependencies: '', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false }]);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t.schedulerTitle as string}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{t.schedulerSubtitle as string}</p>
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t.taskTableTitle as string}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">{t.taskName as string}</th>
                                <th scope="col" className="px-6 py-3">{t.duration as string}</th>
                                <th scope="col" className="px-6 py-3">{t.dependencies as string}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                    <td className="px-6 py-4">{task.id}</td>
                                    <td className="px-6 py-4"><input type="text" value={task.name} onChange={e => handleTaskChange(task.id, 'name', e.target.value)} className="w-full bg-transparent focus:outline-none"/></td>
                                    <td className="px-6 py-4"><input type="number" value={task.duration} onChange={e => handleTaskChange(task.id, 'duration', parseInt(e.target.value) || 0)} className="w-20 bg-transparent focus:outline-none"/></td>
                                    <td className="px-6 py-4"><input type="text" value={task.dependencies} onChange={e => handleTaskChange(task.id, 'dependencies', e.target.value)} className="w-24 bg-transparent focus:outline-none"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex space-x-4">
                    <SecondaryButton onClick={addTask}>{t.addTask as string}</SecondaryButton>
                    <Button onClick={calculateSchedule} disabled={loading}>{loading ? t.calculating as string : t.calculateSchedule as string}</Button>
                </div>
                 {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>

            {isCalculated && (
                <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t.resultsTableTitle as string}</h3>
                    <p className="mb-4">{t.projectDuration as string}: <span className="font-bold">{Math.max(...tasks.map(t=>t.lateFinish))} {t.days as string}</span></p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">{t.taskName as string}</th>
                                    <th className="px-4 py-3 text-center">{t.ES as string}</th>
                                    <th className="px-4 py-3 text-center">{t.EF as string}</th>
                                    <th className="px-4 py-3 text-center">{t.LS as string}</th>
                                    <th className="px-4 py-3 text-center">{t.LF as string}</th>
                                    <th className="px-4 py-3 text-center">{t.float as string}</th>
                                    <th className="px-4 py-3 text-center">{t.critical as string}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id} className={`border-b dark:border-slate-700 ${task.isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{task.name}</td>
                                        <td className="px-4 py-4 text-center">{task.earlyStart}</td>
                                        <td className="px-4 py-4 text-center">{task.earlyFinish}</td>
                                        <td className="px-4 py-4 text-center">{task.lateStart}</td>
                                        <td className="px-4 py-4 text-center">{task.lateFinish}</td>
                                        <td className="px-4 py-4 text-center">{task.float}</td>
                                        <td className="px-4 py-4 text-center">{task.isCritical ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="mt-6">
                        <Button onClick={() => analyzeRisks(location, lang)} disabled={riskLoading}><SparkleIcon className="w-5 h-5 mr-2 -ml-1"/>{riskLoading ? t.analyzing as string : t.analyzeRisk as string}</Button>
                     </div>
                </div>
            )}
            
            {risks.length > 0 && (
                 <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg p-6 ring-1 ring-slate-900/5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t.aiScheduleRiskTitle as string}</h3>
                    <div className="space-y-4">
                        {risks.map((r, i) => (
                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.risk}</h4>
                                <p className="text-sm mt-1"><strong className="text-slate-600 dark:text-slate-300">{t.impact as string}:</strong> {r.impact}</p>
                                <p className="text-sm mt-1"><strong className="text-slate-600 dark:text-slate-300">{t.mitigation as string}:</strong> {r.mitigation}</p>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

        </div>
    );
};
