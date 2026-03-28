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
  setSimulationYears: (years: number) => void;
  recalculate: () => void;
  setSelectedYear: (year: number) => void;
  loadParams: (params: SimulationParams) => void;
}

function calculate(params: SimulationParams): SimulationResult {
  return runSimulation(params);
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
      },

      setMonthlyExpenses: (v) => {
        const params = { ...get().params, monthlyExpenses: v };
        set({ params, results: calculate(params) });
      },

      setCurrentAssets: (v) => {
        const params = { ...get().params, currentAssets: v };
        set({ params, results: calculate(params) });
      },

      addMortgageTrack: (type) => {
        const defaults: Record<MortgageTrack['type'], Partial<MortgageTrack>> = {
          prime: { rate: 4.5, margin: 1.5, months: 240, principal: 500000 },
          fixed: { rate: 5.5, months: 240, principal: 500000 },
          'cpi-linked': { rate: 3.0, months: 240, principal: 500000 },
        };

        const newTrack: MortgageTrack = {
          id: generateId(),
          type,
          principal: 500000,
          rate: 4.5,
          months: 240,
          ...defaults[type],
          label:
            type === 'prime'
              ? 'פריים'
              : type === 'fixed'
                ? 'קבועה לא צמודה'
                : 'צמודת מדד',
        };

        const params = {
          ...get().params,
          mortgageTracks: [...get().params.mortgageTracks, newTrack],
        };
        set({ params, results: calculate(params) });
      },

      updateMortgageTrack: (id, updates) => {
        const tracks = get().params.mortgageTracks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );
        const params = { ...get().params, mortgageTracks: tracks };
        set({ params, results: calculate(params) });
      },

      removeMortgageTrack: (id) => {
        const tracks = get().params.mortgageTracks.filter((t) => t.id !== id);
        const params = { ...get().params, mortgageTracks: tracks };
        set({ params, results: calculate(params) });
      },

      setCarLoan: (loan) => {
        const params = { ...get().params, carLoan: loan };
        set({ params, results: calculate(params) });
      },

      addLifeEvent: (event) => {
        const newEvent: LifeEvent = { ...event, id: generateId() };
        const params = {
          ...get().params,
          events: [...get().params.events, newEvent],
        };
        set({ params, results: calculate(params) });
      },

      removeLifeEvent: (id) => {
        const events = get().params.events.filter((e) => e.id !== id);
        const params = { ...get().params, events };
        set({ params, results: calculate(params) });
      },

      updateEconomics: (updates) => {
        const params = { ...get().params, ...updates };
        set({ params, results: calculate(params) });
      },

      setSimulationYears: (years) => {
        const params = { ...get().params, years };
        set({ params, results: calculate(params), selectedYear: 1 });
      },

      recalculate: () => {
        set({ isCalculating: true });
        const results = calculate(get().params);
        set({ results, isCalculating: false });
      },

      setSelectedYear: (year) => {
        set({ selectedYear: year });
      },

      loadParams: (params) => {
        set({ params, results: calculate(params) });
      },
    }),
    {
      name: 'oracle-simulation',
      partialize: (state) => ({ params: state.params }),
    }
  )
);
