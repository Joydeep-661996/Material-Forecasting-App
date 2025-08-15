
import { useState, useCallback } from 'react';
import { ProjectTask, ScheduleRisk, Location, Language } from '../types';
import { analyzeScheduleRisks } from '../services/geminiService';

export const useScheduler = () => {
    const [tasks, setTasks] = useState<ProjectTask[]>([
        { id: 1, name: 'Site Clearing', duration: 3, dependencies: '', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
        { id: 2, name: 'Foundation', duration: 7, dependencies: '1', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
        { id: 3, name: 'Framing', duration: 10, dependencies: '2', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
        { id: 4, name: 'Roofing', duration: 5, dependencies: '3', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
        { id: 5, name: 'Plumbing & Electrical', duration: 8, dependencies: '3', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
        { id: 6, name: 'Finishing', duration: 6, dependencies: '4,5', earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, float: 0, isCritical: false },
    ]);
    const [isCalculated, setIsCalculated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [risks, setRisks] = useState<ScheduleRisk[]>([]);
    const [riskLoading, setRiskLoading] = useState(false);

    const calculateSchedule = useCallback(() => {
        setLoading(true);
        setError(null);
        try {
            const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));

            // Forward Pass (Calculate Early Start & Early Finish)
            const sortedTasks = [...tasks].sort((a, b) => a.id - b.id);
            for (const task of sortedTasks) {
                const deps = task.dependencies.split(',').filter(d => d).map(d => parseInt(d));
                const maxEF = deps.reduce((max, depId) => Math.max(max, taskMap.get(depId)?.earlyFinish || 0), 0);
                task.earlyStart = maxEF;
                task.earlyFinish = maxEF + task.duration;
                taskMap.set(task.id, task);
            }

            // Project duration
            const projectDuration = Math.max(...Array.from(taskMap.values()).map(t => t.earlyFinish));

            // Backward Pass (Calculate Late Start & Late Finish)
            const reversedTasks = sortedTasks.reverse();
            for (const task of reversedTasks) {
                const successors = Array.from(taskMap.values()).filter(t => t.dependencies.split(',').map(d => parseInt(d)).includes(task.id));
                const minLS = successors.reduce((min, s) => Math.min(min, s.lateStart), projectDuration);
                task.lateFinish = successors.length === 0 ? projectDuration : minLS;
                task.lateStart = task.lateFinish - task.duration;
                taskMap.set(task.id, task);
            }
            
            // Calculate Float and Critical Path
            const finalTasks = Array.from(taskMap.values()).map(task => {
                task.float = task.lateStart - task.earlyStart;
                task.isCritical = task.float === 0;
                return task;
            });
            
            setTasks(finalTasks);
            setIsCalculated(true);

        } catch (e) {
            setError('Failed to calculate schedule. Check dependencies.');
        } finally {
            setLoading(false);
        }
    }, [tasks]);
    
    const analyzeRisks = useCallback(async (location: Location, lang: Language) => {
        if (!isCalculated) return;
        setRiskLoading(true);
        setError(null);
        setRisks([]);
        try {
            const results = await analyzeScheduleRisks(tasks, location, lang);
            setRisks(results);
        } catch(e) {
             if (e instanceof Error) setError(e.message);
        } finally {
            setRiskLoading(false);
        }
    }, [tasks, isCalculated]);

    return { tasks, setTasks, isCalculated, loading, error, risks, riskLoading, calculateSchedule, analyzeRisks };
};
