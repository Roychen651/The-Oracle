// ─── Israeli Mortgage & Financial Simulation Engine ─────────────────────────
// Month-by-month state machine: up to 480 months (40 years)
// BOI-compliant: Spitzer + Keren Shava + CPI-linked + Prime
// Includes: BOI regulatory validation, smart tax routing, FIRE milestones

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface MortgageTrack {
  id: string;
  type: 'prime' | 'fixed' | 'cpi-linked' | 'equal-principal';
  principal: number;
  rate: number; // annual rate %
  months: number;
  margin?: number; // for prime track: spread above BOI
  label?: string;
}

export interface CarLoan {
  price: number;
  downPayment: number;
  rate: number; // annual %
  months: number;
  residualRate: number; // % of price as balloon payment (0-50)
}

export type LifeEventType =
  | 'home_purchase'
  | 'car_purchase'
  | 'child'
  | 'career_jump'
  | 'retirement'
  | 'custom';

export interface LifeEvent {
  id: string;
  year: number;
  type: LifeEventType;
  label: string;
  labelHe: string;
  impact: {
    incomeChange?: number; // monthly ₪ change
    expenseChange?: number; // monthly ₪ change
    oneTimeAsset?: number; // one-time asset addition/subtraction
    newDebt?: number; // one-time new debt
  };
}

// ─── Macro / Black Swan Events ────────────────────────────────────────────────

export type MacroEventType =
  | 'market_crash'       // -30% portfolio
  | 'inflation_spike'    // +8% CPI one year
  | 'rate_hike'          // BOI +2%
  | 'rate_cut'           // BOI -2%
  | 'income_shock'       // % income drop
  | 'tech_winter'        // -20% income (hi-tech)
  | 'war_shock'          // -15% assets, +20% expenses
  | 'custom';

export interface MacroEvent {
  id: string;
  year: number;
  type: MacroEventType;
  label: string;
  // Impacts applied for the duration specified (months)
  portfolioShockPct: number;   // e.g. -0.30 for -30%
  inflationDelta: number;      // e.g. +0.08 for +8% CPI
  boiRateDelta: number;        // e.g. +0.02 for BOI +2%
  incomeShockPct: number;      // e.g. -0.20 for -20% income
  expenseShockPct: number;     // e.g. +0.20 for +20% expenses
  durationMonths: number;      // how long the shock lasts
}

// ─── FIRE Milestones ─────────────────────────────────────────────────────────

export type FIREMilestone =
  | 'first_100k'       // first time assets ≥ ₪100,000
  | 'net_positive'     // first time net worth > 0
  | 'debt_free'        // first time total debt < ₪1,000
  | 'first_million'    // first time assets ≥ ₪1,000,000
  | 'fire_crossover';  // passive income (annual) ≥ annual expenses

export const FIRE_MILESTONE_LABELS: Record<FIREMilestone, { he: string; icon: string }> = {
  first_100k: { he: 'חיסכון ראשון ₪100K', icon: '💰' },
  net_positive: { he: 'שווי נטו חיובי', icon: '📈' },
  debt_free: { he: 'חופשי מחובות!', icon: '🔓' },
  first_million: { he: 'מיליונר!', icon: '🏆' },
  fire_crossover: { he: 'עצמאות פיננסית (FIRE)', icon: '🔥' },
};

// ─── BOI Regulatory Validation ───────────────────────────────────────────────

export interface BOIValidationResult {
  ltvViolation: boolean;
  ltvPercent: number;
  maxLtvPercent: number;
  ptiViolation: boolean;
  ptiPercent: number;
  totalMortgage: number;
  propertyValue: number;
  warnings: string[];
}

// ─── Simulation Params ───────────────────────────────────────────────────────

export interface SimulationParams {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentAssets: number;
  mortgageTracks: MortgageTrack[];
  carLoan: CarLoan | null;
  events: LifeEvent[];
  macroEvents: MacroEvent[];        // NEW: black swan events
  boiRate: number;                  // % e.g. 4.5
  inflation: number;                // annual % e.g. 3.5
  investmentReturn: number;         // annual % on savings e.g. 7
  years: number;                    // 10-40
  capitalGainsTax: number;          // 0-1, default 0.25
  // NEW: smart tax routing
  kerenHishtalmutMonthly: number;   // employee KH contribution/month, default 0
  // NEW: BOI LTV validation
  propertyValue: number;            // property value in ₪, for LTV calc, default 0
  propertyOwner: 'none' | 'first' | 'investor'; // first home = 75% LTV, investor = 50%
  equity: number;                   // down payment / הון עצמי in ₪, UI metadata only
}

// ─── Simulation Results ──────────────────────────────────────────────────────

export interface YearlyDataPoint {
  year: number;
  netWorth: number;
  totalDebt: number;
  assets: number;
  cashFlow: number;
  monthlyMortgagePayment: number;
  monthlyCarPayment: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  netAfterTaxNetWorth: number;
  // NEW:
  passiveIncome: number;            // annual passive income from investments
  kerenHishtalmutBalance: number;   // tax-advantaged KH balance
  milestones: FIREMilestone[];      // milestones hit this year
}

export interface SimulationResult {
  yearlyData: YearlyDataPoint[];
  totalInterestPaid: number;
  debtFreeYear: number | null;
  breakEvenYear: number | null;
  finalNetWorth: number;
  totalCapitalGainsTaxPaid: number;
  monthlyBreakdown: {
    mortgage: number;
    car: number;
    expenses: number;
    savings: number;
  };
  // NEW:
  fireYear: number | null;          // year passive income ≥ annual expenses
  totalTaxSavedFromKH: number;      // total CGT saved via Keren Hishtalmut
}

// ─── BOI Limit Validator ─────────────────────────────────────────────────────

/**
 * Validate mortgage parameters against Bank of Israel regulatory limits.
 * LTV: 75% for first home, 50% for investor.
 * PTI (Payment-to-Income): must be < 40%.
 */
export function validateBOILimits(params: SimulationParams): BOIValidationResult {
  const totalMortgage = params.mortgageTracks.reduce((sum, t) => sum + t.principal, 0);
  const maxLtvPercent = params.propertyOwner === 'investor' ? 50 : 75;
  const ltvPercent =
    params.propertyValue > 0 ? (totalMortgage / params.propertyValue) * 100 : 0;
  const ltvViolation =
    params.propertyValue > 0 && params.propertyOwner !== 'none' && ltvPercent > maxLtvPercent;

  // Approximate monthly payment (Spitzer) for PTI check
  const approxMonthly = params.mortgageTracks.reduce((sum, t) => {
    const rate = t.type === 'prime' ? params.boiRate + (t.margin ?? 1.5) : t.rate;
    return sum + spitzerMonthlyPayment(t.principal, rate, t.months);
  }, 0);
  const ptiPercent =
    params.monthlyIncome > 0 ? (approxMonthly / params.monthlyIncome) * 100 : 0;
  const ptiViolation = params.mortgageTracks.length > 0 && ptiPercent >= 40;

  const warnings: string[] = [];
  if (ltvViolation) {
    warnings.push(
      `יחס מימון ${ltvPercent.toFixed(0)}% חורג ממגבלת בנק ישראל (${maxLtvPercent}% ל${params.propertyOwner === 'investor' ? 'משקיע' : 'דירה ראשונה'})`
    );
  }
  if (ptiViolation) {
    warnings.push(
      `יחס החזר ${ptiPercent.toFixed(0)}% חורג ממגבלת 40% — הבנק עלול לסרב לאשר`
    );
  }

  return {
    ltvViolation,
    ltvPercent,
    maxLtvPercent,
    ptiViolation,
    ptiPercent,
    totalMortgage,
    propertyValue: params.propertyValue,
    warnings,
  };
}

// ─── Spitzer Formula ─────────────────────────────────────────────────────────

/**
 * M = P × r × (1+r)^n / ((1+r)^n − 1)
 */
export function spitzerMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

// ─── Equal Principal Schedule ─────────────────────────────────────────────────

function calculateEqualPrincipalSchedule(track: MortgageTrack): number[] {
  const monthlyPrincipal = track.principal / track.months;
  const monthlyRate = track.rate / 100 / 12;
  const payments: number[] = [];
  let balance = track.principal;

  for (let m = 1; m <= track.months; m++) {
    const interest = balance * monthlyRate;
    payments.push(monthlyPrincipal + interest);
    balance -= monthlyPrincipal;
  }
  return payments;
}

// ─── Mortgage Schedule ───────────────────────────────────────────────────────

export function calculateMortgageSchedule(
  track: MortgageTrack,
  boiRate: number,
  inflation: number
): number[] {
  const payments: number[] = [];

  if (track.principal <= 0 || track.months <= 0) {
    return new Array(track.months).fill(0);
  }

  switch (track.type) {
    case 'prime': {
      const effectiveRate = boiRate + (track.margin ?? 1.5);
      const monthly = spitzerMonthlyPayment(track.principal, effectiveRate, track.months);
      return new Array(track.months).fill(monthly);
    }

    case 'fixed': {
      const monthly = spitzerMonthlyPayment(track.principal, track.rate, track.months);
      return new Array(track.months).fill(monthly);
    }

    case 'cpi-linked': {
      // Inflate balance FIRST, then recalculate payment on inflated balance
      let balance = track.principal;
      const monthlyInflation = inflation / 100 / 12;
      const monthlyRate = track.rate / 100 / 12;

      for (let m = 0; m < track.months; m++) {
        const remaining = track.months - m;
        balance *= 1 + monthlyInflation; // inflate before payment

        let payment: number;
        if (monthlyRate === 0) {
          payment = balance / remaining;
        } else {
          const factor = Math.pow(1 + monthlyRate, remaining);
          payment = (balance * monthlyRate * factor) / (factor - 1);
        }
        payments.push(payment);

        const interestPortion = balance * monthlyRate;
        const principalPortion = payment - interestPortion;
        balance = Math.max(0, balance - principalPortion);
      }
      return payments;
    }

    case 'equal-principal': {
      return calculateEqualPrincipalSchedule(track);
    }

    default:
      return new Array(track.months).fill(0);
  }
}

// ─── Car Loan Schedule ───────────────────────────────────────────────────────

export function calculateCarSchedule(carLoan: CarLoan): number[] {
  const residualValue = carLoan.price * (carLoan.residualRate / 100);
  const financedAmount = carLoan.price - carLoan.downPayment - residualValue;

  if (financedAmount <= 0 || carLoan.months <= 0) {
    const payments = new Array(carLoan.months).fill(0);
    if (residualValue > 0 && carLoan.months > 0) {
      payments[payments.length - 1] += residualValue;
    }
    return payments;
  }

  const monthlyPayment = spitzerMonthlyPayment(financedAmount, carLoan.rate, carLoan.months);
  const payments = new Array(carLoan.months).fill(monthlyPayment);
  if (residualValue > 0) {
    payments[payments.length - 1] += residualValue;
  }
  return payments;
}

// ─── Main Simulation Engine ──────────────────────────────────────────────────
//
// Order of operations per month tick:
// 1. Apply annual inflation to expenses (start of year)
// 2. Apply life events (start of year)
// 3. Apply macro/black swan shocks (start of shock year, for durationMonths)
// 4. Calculate mortgage + car payments
// 5. Calculate cash flow = income − expenses − debt_payments
// 6. Smart Tax Router: route surplus → KH (tax-exempt) → taxable
// 7. Compound KH balance (no CGT) and taxable assets (with CGT)
// 8. Record yearly snapshot + detect FIRE milestones

export function runSimulation(params: SimulationParams): SimulationResult {
  const totalMonths = params.years * 12;
  const capitalGainsTax = params.capitalGainsTax ?? 0.25;

  // Pre-calculate mortgage schedules
  const mortgageSchedules = params.mortgageTracks.map((track) =>
    calculateMortgageSchedule(track, params.boiRate, params.inflation)
  );
  const carSchedule = params.carLoan ? calculateCarSchedule(params.carLoan) : [];

  const initialCarDebt = params.carLoan ? params.carLoan.price - params.carLoan.downPayment : 0;

  // Monthly contribution ceiling: KH tax-exempt cap is ₪19,920/year = ₪1,660/month
  const KH_MONTHLY_CAP = 1660;
  const khMonthly = Math.min(params.kerenHishtalmutMonthly ?? 0, KH_MONTHLY_CAP);

  // State
  let assets = params.currentAssets;
  let khBalance = 0;
  let monthlyIncome = params.monthlyIncome;
  let monthlyExpenses = params.monthlyExpenses;
  let currentBoiRate = params.boiRate;
  let currentInflation = params.inflation;

  const mortgageBalances = params.mortgageTracks.map((t) => t.principal);
  let carBalance = initialCarDebt;

  const yearlyData: YearlyDataPoint[] = [];
  let totalInterestPaid = 0;
  let totalCapitalGainsTaxPaid = 0;
  let totalTaxSavedFromKH = 0;
  let debtFreeYear: number | null = null;
  let breakEvenYear: number | null = null;
  let fireYear: number | null = null;

  const monthlyInvestmentReturn = params.investmentReturn / 100 / 12;

  const sortedEvents = [...params.events].sort((a, b) => a.year - b.year);
  const appliedEvents = new Set<string>();

  // Build macro event lookup: month → MacroEvent
  const macroEventsByMonth = new Map<number, MacroEvent>();
  for (const me of (params.macroEvents ?? [])) {
    const startMonth = (me.year - 1) * 12 + 1;
    macroEventsByMonth.set(startMonth, me);
  }
  const activeMacroEvents: Array<{ event: MacroEvent; remaining: number }> = [];

  // FIRE milestone tracking
  const reachedMilestones = new Set<FIREMilestone>();
  const yearMilestones = new Map<number, FIREMilestone[]>();

  function markMilestone(milestone: FIREMilestone, year: number) {
    if (!reachedMilestones.has(milestone)) {
      reachedMilestones.add(milestone);
      if (!yearMilestones.has(year)) yearMilestones.set(year, []);
      yearMilestones.get(year)!.push(milestone);
    }
  }

  for (let month = 1; month <= totalMonths; month++) {
    const currentYear = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;

    // 1. Annual inflation on expenses
    if (monthInYear === 1 && currentYear > 1) {
      monthlyExpenses *= 1 + currentInflation / 100;
    }

    // 2. Life events
    for (const event of sortedEvents) {
      if (event.year === currentYear && monthInYear === 1 && !appliedEvents.has(event.id)) {
        appliedEvents.add(event.id);
        if (event.impact.incomeChange) monthlyIncome += event.impact.incomeChange;
        if (event.impact.expenseChange) monthlyExpenses += event.impact.expenseChange;
        if (event.impact.oneTimeAsset) assets += event.impact.oneTimeAsset;
        if (event.impact.newDebt) carBalance += event.impact.newDebt;
      }
    }

    // 3. Macro / black swan shocks
    const incomingMacro = macroEventsByMonth.get(month);
    if (incomingMacro) {
      // Apply one-time portfolio shock
      if (incomingMacro.portfolioShockPct !== 0) {
        assets *= 1 + incomingMacro.portfolioShockPct;
        khBalance *= 1 + incomingMacro.portfolioShockPct;
      }
      activeMacroEvents.push({ event: incomingMacro, remaining: incomingMacro.durationMonths });
    }

    // Apply ongoing macro effects and decay
    let macroIncomeMult = 1;
    let macroExpenseMult = 1;
    let macroBOIDelta = 0;
    for (let i = activeMacroEvents.length - 1; i >= 0; i--) {
      const ae = activeMacroEvents[i];
      macroIncomeMult *= 1 + ae.event.incomeShockPct;
      macroExpenseMult *= 1 + ae.event.expenseShockPct;
      macroBOIDelta += ae.event.boiRateDelta;
      ae.remaining--;
      if (ae.remaining <= 0) activeMacroEvents.splice(i, 1);
    }

    currentBoiRate = params.boiRate + macroBOIDelta;
    currentInflation = params.inflation;

    const effectiveIncome = monthlyIncome * macroIncomeMult;
    const effectiveExpenses = monthlyExpenses * macroExpenseMult;

    // 4. Mortgage payments
    let totalMortgagePayment = 0;
    for (let t = 0; t < params.mortgageTracks.length; t++) {
      const schedule = mortgageSchedules[t];
      const monthIdx = month - 1;
      if (monthIdx >= schedule.length) continue;

      const payment = schedule[monthIdx];
      totalMortgagePayment += payment;

      const track = params.mortgageTracks[t];
      if (track.type === 'equal-principal') {
        const principalPortion = track.principal / track.months;
        const interestPortion = mortgageBalances[t] * (track.rate / 100 / 12);
        totalInterestPaid += interestPortion;
        mortgageBalances[t] = Math.max(0, mortgageBalances[t] - principalPortion);
      } else {
        const effectiveRate =
          track.type === 'prime'
            ? (currentBoiRate + (track.margin ?? 1.5)) / 100 / 12
            : track.rate / 100 / 12;
        const interestPortion = mortgageBalances[t] * effectiveRate;
        const principalPortion = Math.max(0, payment - interestPortion);
        totalInterestPaid += interestPortion;
        mortgageBalances[t] = Math.max(0, mortgageBalances[t] - principalPortion);
      }
    }

    // Car payment
    let monthlyCarPayment = 0;
    if (carSchedule.length > 0 && month - 1 < carSchedule.length) {
      monthlyCarPayment = carSchedule[month - 1];
      const carRate = params.carLoan ? params.carLoan.rate / 100 / 12 : 0;
      const carInterest = carBalance * carRate;
      const carPrincipal = Math.max(0, monthlyCarPayment - carInterest);
      totalInterestPaid += carInterest;
      carBalance = Math.max(0, carBalance - carPrincipal);
    }

    // 5. Cash flow
    const totalPayments = totalMortgagePayment + monthlyCarPayment + effectiveExpenses;
    const cashFlow = effectiveIncome - totalPayments;

    // 6. Smart Tax Router
    // Route: cashFlow surplus → KH (tax-exempt, up to cap) → taxable assets
    if (cashFlow > 0) {
      const toKH = Math.min(cashFlow, khMonthly);
      const toTaxable = cashFlow - toKH;
      khBalance += toKH;
      assets += toTaxable;
    } else {
      // Deficit: draw from taxable first, then KH
      assets += cashFlow; // cashFlow is negative here
    }

    // 7. Compound returns
    // KH: no capital gains tax
    if (khBalance > 0) {
      khBalance *= 1 + monthlyInvestmentReturn;
      const khReturn = khBalance - (khBalance / (1 + monthlyInvestmentReturn));
      // Tax saved = what we WOULD have paid on this return
      totalTaxSavedFromKH += khReturn * capitalGainsTax;
    }

    // Taxable assets: with CGT
    if (assets > 0) {
      const grossReturn = assets * monthlyInvestmentReturn;
      const taxableGain = grossReturn * capitalGainsTax;
      totalCapitalGainsTaxPaid += taxableGain;
      assets += grossReturn - taxableGain;
    }

    // 8. Yearly snapshot
    if (month % 12 === 0) {
      const totalMortgageDebt = mortgageBalances.reduce((sum, b) => sum + b, 0);
      const totalDebt = totalMortgageDebt + Math.max(0, carBalance);
      const totalAssetsInclKH = Math.max(0, assets) + khBalance;
      const netWorth = totalAssetsInclKH - totalDebt;
      const passiveIncome = (totalAssetsInclKH) * (params.investmentReturn / 100);

      // FIRE milestone checks
      if (totalAssetsInclKH >= 100_000) markMilestone('first_100k', currentYear);
      if (netWorth > 0) markMilestone('net_positive', currentYear);
      if (totalDebt < 1_000 && params.mortgageTracks.length > 0) markMilestone('debt_free', currentYear);
      if (totalAssetsInclKH >= 1_000_000) markMilestone('first_million', currentYear);
      if (passiveIncome >= effectiveExpenses * 12) markMilestone('fire_crossover', currentYear);

      if (debtFreeYear === null && totalDebt < 1000) debtFreeYear = currentYear;
      if (breakEvenYear === null && netWorth > 0) breakEvenYear = currentYear;
      if (fireYear === null && passiveIncome >= effectiveExpenses * 12) fireYear = currentYear;

      // Average payments this year
      let avgMortgagePayment = 0;
      for (let t = 0; t < params.mortgageTracks.length; t++) {
        const schedule = mortgageSchedules[t];
        const s = (currentYear - 1) * 12;
        const e = Math.min(s + 12, schedule.length);
        if (s < schedule.length) {
          const slice = schedule.slice(s, e);
          avgMortgagePayment += slice.reduce((a, b) => a + b, 0) / slice.length;
        }
      }
      const avgCarPayment =
        carSchedule.length > 0
          ? (() => {
              const s = (currentYear - 1) * 12;
              const e = Math.min(s + 12, carSchedule.length);
              if (s < carSchedule.length) {
                const slice = carSchedule.slice(s, e);
                return slice.reduce((a, b) => a + b, 0) / slice.length;
              }
              return 0;
            })()
          : 0;

      yearlyData.push({
        year: currentYear,
        netWorth,
        totalDebt,
        assets: Math.max(0, assets),
        cashFlow: effectiveIncome - effectiveExpenses - avgMortgagePayment - avgCarPayment,
        monthlyMortgagePayment: avgMortgagePayment,
        monthlyCarPayment: avgCarPayment,
        totalMonthlyIncome: effectiveIncome,
        totalMonthlyExpenses: effectiveExpenses,
        netAfterTaxNetWorth: netWorth,
        passiveIncome,
        kerenHishtalmutBalance: khBalance,
        milestones: yearMilestones.get(currentYear) ?? [],
      });
    }
  }

  const finalData = yearlyData[yearlyData.length - 1];
  const firstYearData = yearlyData[0];
  const totalMonthlyOut = firstYearData
    ? firstYearData.monthlyMortgagePayment +
      firstYearData.monthlyCarPayment +
      firstYearData.totalMonthlyExpenses
    : 0;
  const monthlySavings = firstYearData
    ? Math.max(0, firstYearData.totalMonthlyIncome - totalMonthlyOut)
    : 0;

  return {
    yearlyData,
    totalInterestPaid,
    debtFreeYear,
    breakEvenYear,
    finalNetWorth: finalData?.netWorth ?? 0,
    totalCapitalGainsTaxPaid,
    monthlyBreakdown: {
      mortgage: firstYearData?.monthlyMortgagePayment ?? 0,
      car: firstYearData?.monthlyCarPayment ?? 0,
      expenses: firstYearData?.totalMonthlyExpenses ?? params.monthlyExpenses,
      savings: monthlySavings,
    },
    fireYear,
    totalTaxSavedFromKH,
  };
}
