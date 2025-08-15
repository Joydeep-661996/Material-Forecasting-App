
import { GoogleGenAI, Type } from "@google/genai";
import { Material, Location, Language, ForecastHorizon, Supplier, ProcurementPlan, ProjectTask, CashFlowItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getForecastSchema = (horizon: ForecastHorizon) => {
    const isMonthly = horizon === 180;
    const periodDescription = isMonthly 
        ? "The forecasted month in 'Mon YYYY' format (e.g., 'Jan 2025')."
        : "The forecasted period, such as 'Day 1', 'Day 2', etc.";
    
    return {
        type: Type.OBJECT,
        properties: {
            forecast: {
                type: Type.ARRAY,
                description: `An array of objects, each representing a ${isMonthly ? 'monthly' : 'daily'} price forecast.`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        period: {
                            type: Type.STRING,
                            description: periodDescription
                        },
                        price: {
                            type: Type.NUMBER,
                            description: "The forecasted price for the material."
                        }
                    },
                    required: ["period", "price"]
                }
            },
            commentary: {
                type: Type.STRING,
                description: "A detailed analysis (3-4 sentences) in the requested language explaining the forecast. Mention key market drivers like monsoon season, government policies, and local demand in the specified city."
            }
        },
        required: ["forecast", "commentary"]
    };
};

const getSupplierSchema = () => ({
    type: Type.OBJECT,
    properties: {
        suppliers: {
            type: Type.ARRAY,
            description: "A list of 3 to 5 hypothetical but realistic-sounding local suppliers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The supplier's business name." },
                    address: { type: Type.STRING, description: "A plausible local address within the specified city." },
                    phone: { type: Type.STRING, description: "A fictional 10-digit Indian mobile number." },
                    rating: { type: Type.NUMBER, description: "A customer rating out of 5, e.g., 4.5." },
                    price: { type: Type.NUMBER, description: "Their current price for the specified material and unit." }
                },
                required: ["name", "address", "phone", "rating", "price"]
            }
        }
    },
    required: ["suppliers"]
});

const getProcurementPlanSchema = () => ({
    type: Type.OBJECT,
    properties: {
        totalCost: {
            type: Type.NUMBER,
            description: "The total estimated procurement cost based on the recommended strategy."
        },
        recommendation: {
            type: Type.STRING,
            enum: ['BUY_NOW', 'WAIT', 'SPLIT_BUY'],
            description: "The recommended procurement action."
        },
        reasoning: {
            type: Type.STRING,
            description: "A detailed explanation (3-4 sentences) in the requested language for the recommendation. It should analyze the price trend from the forecast and justify the timing of the purchase."
        }
    },
    required: ["totalCost", "recommendation", "reasoning"]
});

const getScheduleRiskSchema = () => ({
    type: Type.OBJECT,
    properties: {
        risks: {
            type: Type.ARRAY,
            description: "A list of 2-3 potential risks identified in the project schedule.",
            items: {
                type: Type.OBJECT,
                properties: {
                    risk: { type: Type.STRING, description: "A concise description of the potential risk (e.g., 'Monsoon Delay Risk')." },
                    impact: { type: Type.STRING, description: "A brief explanation of how this risk could impact the project timeline or costs." },
                    mitigation: { type: Type.STRING, description: "A practical suggestion to mitigate or prepare for this risk." }
                },
                required: ["risk", "impact", "mitigation"]
            }
        }
    },
    required: ["risks"]
});

const getPaymentDelaySchema = () => ({
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.ARRAY,
            description: "An analysis of each upcoming income invoice.",
            items: {
                type: Type.OBJECT,
                properties: {
                    invoice: { type: Type.STRING, description: "The description of the invoice being analyzed." },
                    riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The assessed risk level of a payment delay." },
                    reasoning: { type: Type.STRING, description: "A brief justification for the assessed risk level." }
                },
                required: ["invoice", "riskLevel", "reasoning"]
            }
        }
    },
    required: ["analysis"]
});

const getContingencySchema = () => ({
    type: Type.OBJECT,
    properties: {
        contingencyPercentage: {
            type: Type.NUMBER,
            description: "A suggested contingency percentage (e.g., 10 for 10%) based on the project details."
        },
        reasoning: {
            type: Type.STRING,
            description: "A brief explanation for the suggested percentage, considering project complexity and location."
        }
    },
    required: ["contingencyPercentage", "reasoning"]
});

export const fetchAiForecast = async (
  material: Material,
  location: Location,
  historicalPrices: number[],
  lang: Language,
  horizon: ForecastHorizon
): Promise<{ data: any[]; commentary: string }> => {
  const prompt = `Analyze the historical price trend for ${material.name[lang]} in ${location.name}, India, and provide a ${horizon === 180 ? '6-month' : `${horizon}-day`} price forecast. The current price is ₹${historicalPrices[historicalPrices.length - 1]} per ${material.baseUnit[lang]}. Historical prices for the last 6 months were: ${historicalPrices.join(', ')}. Consider factors like monsoon season, local demand in ${location.name}, and general Indian economic trends. Provide the output in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}. The response must be a JSON object matching the provided schema.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getForecastSchema(horizon), temperature: 0.5 }
    });
    const parsed = JSON.parse(response.text.trim());
    return { data: parsed.forecast.map((item: any) => ({ ...item, type: 'ai' })), commentary: parsed.commentary };
  } catch (error) {
    console.error("Error fetching AI forecast:", error);
    throw new Error(`Gemini API Error: ${(error as Error).message}`);
  }
};

export const fetchNearbySuppliers = async (material: Material, location: Location): Promise<Supplier[]> => {
  const prompt = `Act as a procurement assistant for the Indian construction industry. Find a list of 3-5 hypothetical, but realistic, local suppliers for **${material.name.en}** in **${location.name}, West Bengal, India**. For each, provide a name, plausible local address, fictional 10-digit Indian mobile number, a rating between 3.5-5.0, and a competitive market price per ${material.baseUnit.en}. The response must be a JSON object matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getSupplierSchema(), temperature: 0.8 }
    });
    const parsed = JSON.parse(response.text.trim());
    return parsed.suppliers || [];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw new Error(`Gemini API Error: ${(error as Error).message}`);
  }
};

export const generateProcurementPlan = async (material: Material, location: Location, aiForecast: any[], quantity: number, lang: Language): Promise<ProcurementPlan> => {
  const forecastString = aiForecast.map(p => `${p.period}: ₹${p.price}`).join(', ');
  const prompt = `Act as a senior procurement manager in ${location.name}, India. Create a procurement plan for **${quantity} ${material.baseUnit[lang]}(s) of ${material.name[lang]}**. The AI's price forecast is: ${forecastString}. Recommend a strategy (BUY_NOW, WAIT, or SPLIT_BUY), calculate the total estimated cost, and provide a concise reasoning in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}. The response must be a JSON object matching the provided schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getProcurementPlanSchema(), temperature: 0.3 }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error generating procurement plan:", error);
    throw new Error(`Gemini API Error: ${(error as Error).message}`);
  }
};

export const analyzeScheduleRisks = async (tasks: ProjectTask[], location: Location, lang: Language) => {
    const criticalPath = tasks.filter(t => t.isCritical).map(t => t.name).join(' -> ');
    const duration = Math.max(...tasks.map(t => t.earlyFinish));
    const prompt = `Act as a senior project manager in ${location.name}, India. Analyze this project schedule for potential risks. The project duration is ${duration} days, and the critical path is: ${criticalPath}. Consider local factors for ${location.name} like weather (monsoon), labor availability, and potential supply chain disruptions. Identify 2-3 key risks, their potential impact, and practical mitigation strategies. Provide the output in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}. The response must be a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getScheduleRiskSchema(), temperature: 0.6 }
        });
        const parsed = JSON.parse(response.text.trim());
        return parsed.risks || [];
    } catch (error) {
        console.error("Error analyzing schedule risks:", error);
        throw new Error(`Gemini API Error: ${(error as Error).message}`);
    }
};

export const analyzePaymentDelays = async (items: CashFlowItem[], lang: Language) => {
    const upcomingInvoices = items.filter(i => i.type === 'income' && new Date(i.date) >= new Date()).map(i => i.description).join(', ');
    if (!upcomingInvoices) return [];
    
    const prompt = `Act as a finance manager for a construction project in India. Analyze the following upcoming invoices for potential payment delay risks: ${upcomingInvoices}. Consider common payment cycles and client behaviors in the Indian construction sector. For each invoice, assess a risk level (Low, Medium, High) and provide a brief reasoning. Provide the output in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}. The response must be a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getPaymentDelaySchema(), temperature: 0.5 }
        });
        const parsed = JSON.parse(response.text.trim());
        return parsed.analysis || [];
    } catch (error) {
        console.error("Error analyzing payment delays:", error);
        throw new Error(`Gemini API Error: ${(error as Error).message}`);
    }
};


export const suggestContingency = async (totalCost: number, location: Location, lang: Language) => {
    const prompt = `Act as a quantity surveyor for a construction project in ${location.name}, India. The current estimated direct cost is ₹${totalCost.toLocaleString('en-IN')}. Based on this cost and the project being in ${location.name} (considering its specific market conditions and risks), suggest a suitable contingency percentage. Provide a brief justification for your suggestion. Provide the output in ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}. The response must be a JSON object matching the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: getContingencySchema(), temperature: 0.4 }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error suggesting contingency:", error);
        throw new Error(`Gemini API Error: ${(error as Error).message}`);
    }
};
