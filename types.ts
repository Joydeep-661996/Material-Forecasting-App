
export type Language = 'en' | 'hi' | 'bn';

export type ForecastHorizon = 7 | 15 | 30 | 45 | 180;

export interface TranslationSet {
  [key: string]: string | Record<string, string>;
}

export interface Material {
  id: string;
  name: Record<Language, string>;
  baseUnit: Record<Language, string>;
  conversionFactors: {
    toUnit: Record<Language, string>;
    factor: number;
  }[];
}

export interface Location {
  id: string;
  name: string;
}

export interface ForecastDataPoint {
  period: string;
  price: number | null;
  type: 'historical' | 'traditional' | 'ai';
}

export interface ForecastResult {
  data: ForecastDataPoint[];
  commentary: string;
}

export interface LivePrice {
  materialId: string;
  price: number;
  change: number;
  percentageChange: number;
}

export interface RateComponents {
    base: number;
    freight: number;
    gst: number;
    other: number;
}

export interface Supplier {
  name: string;
  address: string;
  phone: string;
  rating: number;
  price: number;
}

export type Boq = Record<string, number>;

export interface ProcurementPlan {
    totalCost: number;
    recommendation: 'BUY_NOW' | 'WAIT' | 'SPLIT_BUY';
    reasoning: string;
}

// Project Scheduler Types
export interface ProjectTask {
  id: number;
  name: string;
  duration: number;
  dependencies: string; // Comma-separated IDs, e.g., "1,2"
  // Calculated values
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  float: number;
  isCritical: boolean;
}

export interface ScheduleRisk {
  risk: string;
  impact: string;
  mitigation: string;
}

// Cash Flow Predictor Types
export type CashFlowItemType = 'income' | 'expense';

export interface CashFlowItem {
  id: number;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: CashFlowItemType;
  isRecurring: boolean;
}

export interface CashFlowRisk {
    invoice: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    reasoning: string;
}

// Cost Estimator Types
export interface CostCategory {
  id: string;
  name: string;
  amount: number;
  isEditable: boolean;
}
