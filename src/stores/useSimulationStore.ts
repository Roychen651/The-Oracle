import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SimulationParams,
  SimulationResult,
  MortgageTrack,
  CarLoan,
  LifeEvent,
  MacroEvent,
  BOIValidationResult,
} from '../lib/finance-engine';
import { runSimulation, validateBOILimits } from '../lib/finance-engine';
import { saveSimulationState } from '../lib/supabase';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultParams: SimulationParams = {
  monthlyIncome: 15000,
  monthlyExpenses: 8000,
  currentAssets: 100000,
  mortgageTracks: [],
  carLoan: null,
  events: [],
  macroEvents: [],
  boiRate: 4.5,
  inflation: 3.5,
  investmentReturn: 7,
  years: 30,
  capitalGainsTax: 0.25,
  kerenHishtalmutMonthly: 0,
  propertyValue: 0,
  propertyOwner: 'none',
  equity: 0,
};

interface SimulationStore {
  params: SimulationParams;
  results: SimulationResult | null;
  isCalculating: boolean;
  selectedYear: number;
  boiWarnings: BOIValidationResult | null;

  setMonthlyIncome: (v: number) => void;
  setMonthlyExpenses: (v: number) => void;
  setCurrentAssets: (v: number) => void;
  addMortgageTrack: (type: MortgageTrack['type']) => void;
  updateMortgageTrack: (id: string, updates: Partial<MortgageTrack>) => void;
  removeMortgageTrack: (id: string) => void;
  setCarLoan: (loan: CarLoan | null) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  removeLifeEvent: (id: string) => void;
  addMacroEvent: (event: Omit<MacroEvent, 'id'>) => void;
  removeMacroEvent: (id: string) => void;
  updateEconomics: (updates: {
    boiRate?: number;
    inflation?: number;
    investmentReturn?: number;
  }) => void;
  updateCapitalGainsTax: (rate: number) => void;
  setSimulationYears: (years: number) => void;
  setKerenHishtalmutMonthly: (v: number) => void;
  setPropertyValue: (v: number) => void;
  setPropertyOwner: (owner: SimulationParams['propertyOwner']) => void;
  setEquity: (v: number) => void;
  recalculate: () => void;
  setSelectedYear: (year: number) => void;
  loadParams: (params: SimulationParams) => void;
}

function calculate(params: SimulationParams): SimulationResult {
  return runSimulation(params);
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

async function debouncedSyncToSupabase(params: SimulationParams) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const { useAuthStore } = await import('./useAuthStore');
      const { user } = useAuthStore.getState();
      if (user) {
        await saveSimulationState(user.id, params);
      }
    } catch {
      // Silently fail — Supabase may not be configured
    }
  }, 1500);
}

function applyAndRecalculate(
  set: (partial: Partial<SimulationStore>) => void,
  params: SimulationParams
) {
  const results = calculate(params);
  const boiWarnings = params.mortgageTracks.length > 0 ? validateBOILimits(params) : null;
  set({ params, results, boiWarnings });
  debouncedSyncToSupabase(params);
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      params: defaultParams,
      results: calculate(defaultParams),
      isCalculating: false,
      selectedYear: 1,
      boiWarnings: null,

      setMonthlyIncome: (v) => {
        applyAndRecalculate(set, { ...get().params, monthlyIncome: v });
      },

      setMonthlyExpenses: (v) => {
        applyAndRecalculate(set, { ...get().params, monthlyExpenses: v });
      },

      setCurrentAssets: (v) => {
        applyAndRecalculate(set, { ...get().params, currentAssets: v });
      },

      addMortgageTrack: (type) => {
        const defaults: Record<MortgageTrack['type'], Partial<MortgageTrack>> = {
          prime: { rate: 4.5, margin: 1.5, months: 240, principal: 500000 },
          fixed: { rate: 5.5, months: 240, principal: 500000 },
          'cpi-linked': { rate: 3.0, months: 240, principal: 500000 },
          'equal-principal': { rate: 4.0, months: 240, principal: 500000 },
        };
        const labelMap: Record<MortgageTrack['type'], string> = {
          prime: 'פריים',
          fixed: 'קבועה לא צמודה',
          'cpi-linked': 'צמודת מדד',
          'equal-principal': 'קרן שווה',
        };
        const newTrack: MortgageTrack = {
          id: generateId(),
          type,
          principal: 500000,
          rate: 4.5,
          months: 240,
          ...defaults[type],
          label: labelMap[type],
        };
        applyAndRecalculate(set, {
          ...get().params,
          mortgageTracks: [...get().params.mortgageTracks, newTrack],
        });
      },

      updateMortgageTrack: (id, updates) => {
        const tracks = get().params.mortgageTracks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );
        applyAndRecalculate(set, { ...get().params, mortgageTracks: tracks });
      },

      removeMortgageTrack: (id) => {
        const tracks = get().params.mortgageTracks.filter((t) => t.id !== id);
        applyAndRecalculate(set, { ...get().params, mortgageTracks: tracks });
      },

      setCarLoan: (loan) => {
        applyAndRecalculate(set, { ...get().params, carLoan: loan });
      },

      addLifeEvent: (event) => {
        const newEvent: LifeEvent = { ...event, id: generateId() };
        applyAndRecalculate(set, {
          ...get().params,
          events: [...get().params.events, newEvent],
        });
      },

      removeLifeEvent: (id) => {
        applyAndRecalculate(set, {
          ...get().params,
          events: get().params.events.filter((e) => e.id !== id),
        });
      },

      addMacroEvent: (event) => {
        const newEvent: MacroEvent = { ...event, id: generateId() };
        applyAndRecalculate(set, {
          ...get().params,
          macroEvents: [...(get().params.macroEvents ?? []), newEvent],
        });
      },

      removeMacroEvent: (id) => {
        applyAndRecalculate(set, {
          ...get().params,
          macroEvents: (get().params.macroEvents ?? []).filter((e) => e.id !== id),
        });
      },

      updateEconomics: (updates) => {
        applyAndRecalculate(set, { ...get().params, ...updates });
      },

      updateCapitalGainsTax: (rate) => {
        applyAndRecalculate(set, { ...get().params, capitalGainsTax: rate });
      },

      setSimulationYears: (years) => {
        const params = { ...get().params, years };
        applyAndRecalculate(set, params);
        set({ selectedYear: 1 });
      },

      setKerenHishtalmutMonthly: (v) => {
        applyAndRecalculate(set, { ...get().params, kerenHishtalmutMonthly: v });
      },

      setPropertyValue: (v) => {
        applyAndRecalculate(set, { ...get().params, propertyValue: v });
      },

      setPropertyOwner: (owner) => {
        applyAndRecalculate(set, { ...get().params, propertyOwner: owner });
      },

      setEquity: (v) => {
        applyAndRecalculate(set, { ...get().params, equity: v });
      },

      recalculate: () => {
        set({ isCalculating: true });
        const p = get().params;
        const results = calculate(p);
        const boiWarnings = p.mortgageTracks.length > 0 ? validateBOILimits(p) : null;
        set({ results, boiWarnings, isCalculating: false });
        debouncedSyncToSupabase(p);
      },

      setSelectedYear: (year) => {
        set({ selectedYear: year });
      },

      loadParams: (incoming) => {
        const merged: SimulationParams = {
          ...defaultParams,
          ...incoming,
          capitalGainsTax: incoming.capitalGainsTax ?? 0.25,
          macroEvents: incoming.macroEvents ?? [],
          kerenHishtalmutMonthly: incoming.kerenHishtalmutMonthly ?? 0,
          propertyValue: incoming.propertyValue ?? 0,
          propertyOwner: incoming.propertyOwner ?? 'none',
          equity: incoming.equity ?? 0,
        };
        const results = calculate(merged);
        const boiWarnings = merged.mortgageTracks.length > 0 ? validateBOILimits(merged) : null;
        set({ params: merged, results, boiWarnings });
      },
    }),
    {
      name: 'oracle-simulation',
      partialize: (state) => ({ params: state.params }),
    }
  )
);

export const useSimulationResults = () => useSimulationStore((s) => s.results);
