import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SimulationParams,
  SimulationResult,
  MortgageTrack,
  CarLoan,
  LifeEvent,
} from '../lib/finance-engine';
import { runSimulation } from '../lib/finance-engine';
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
  boiRate: 4.5,
  inflation: 3.5,
  investmentReturn: 7,
  years: 30,
  capitalGainsTax: 0.25,
};

interface SimulationStore {
  params: SimulationParams;
  results: SimulationResult | null;
  isCalculating: boolean;
  selectedYear: number;

  setMonthlyIncome: (v: number) => void;
  setMonthlyExpenses: (v: number) => void;
  setCurrentAssets: (v: number) => void;
  addMortgageTrack: (type: MortgageTrack['type']) => void;
  updateMortgageTrack: (id: string, updates: Partial<MortgageTrack>) => void;
  removeMortgageTrack: (id: string) => void;
  setCarLoan: (loan: CarLoan | null) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  removeLifeEvent: (id: string) => void;
  updateEconomics: (updates: {
    boiRate?: number;
    inflation?: number;
    investmentReturn?: number;
  }) => void;
  updateCapitalGainsTax: (rate: number) => void;
  setSimulationYears: (years: number) => void;
  recalculate: () => void;
  setSelectedYear: (year: number) => void;
  loadParams: (params: SimulationParams) => void;
}

function calculate(params: SimulationParams): SimulationResult {
  return runSimulation(params);
}

// Debounce timer for Supabase sync
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

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      params: defaultParams,
      results: calculate(defaultParams),
      isCalculating: false,
      selectedYear: 1,

      setMonthlyIncome: (v) => {
        const params = { ...get().params, monthlyIncome: v };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      setMonthlyExpenses: (v) => {
        const params = { ...get().params, monthlyExpenses: v };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      setCurrentAssets: (v) => {
        const params = { ...get().params, currentAssets: v };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
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

        const params = {
          ...get().params,
          mortgageTracks: [...get().params.mortgageTracks, newTrack],
        };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      updateMortgageTrack: (id, updates) => {
        const tracks = get().params.mortgageTracks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );
        const params = { ...get().params, mortgageTracks: tracks };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      removeMortgageTrack: (id) => {
        const tracks = get().params.mortgageTracks.filter((t) => t.id !== id);
        const params = { ...get().params, mortgageTracks: tracks };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      setCarLoan: (loan) => {
        const params = { ...get().params, carLoan: loan };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      addLifeEvent: (event) => {
        const newEvent: LifeEvent = { ...event, id: generateId() };
        const params = {
          ...get().params,
          events: [...get().params.events, newEvent],
        };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      removeLifeEvent: (id) => {
        const events = get().params.events.filter((e) => e.id !== id);
        const params = { ...get().params, events };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      updateEconomics: (updates) => {
        const params = { ...get().params, ...updates };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      updateCapitalGainsTax: (rate) => {
        const params = { ...get().params, capitalGainsTax: rate };
        set({ params, results: calculate(params) });
        debouncedSyncToSupabase(params);
      },

      setSimulationYears: (years) => {
        const params = { ...get().params, years };
        set({ params, results: calculate(params), selectedYear: 1 });
        debouncedSyncToSupabase(params);
      },

      recalculate: () => {
        set({ isCalculating: true });
        const currentParams = get().params;
        const results = calculate(currentParams);
        set({ results, isCalculating: false });
        debouncedSyncToSupabase(currentParams);
      },

      setSelectedYear: (year) => {
        set({ selectedYear: year });
      },

      loadParams: (incoming) => {
        // Ensure capitalGainsTax exists in loaded params
        const merged: SimulationParams = {
          ...defaultParams,
          ...incoming,
          capitalGainsTax: incoming.capitalGainsTax ?? 0.25,
        };
        set({ params: merged, results: calculate(merged) });
      },
    }),
    {
      name: 'oracle-simulation',
      partialize: (state) => ({ params: state.params }),
    }
  )
);

export const useSimulationResults = () => useSimulationStore((s) => s.results);
