// Israeli Mortgage & Financial Simulation Engine

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

export interface SimulationParams {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentAssets: number;
  mortgageTracks: MortgageTrack[];
  carLoan: CarLoan | null;
  events: LifeEvent[];
  boiRate: number; // % e.g. 4.5
  inflation: number; // annual % e.g. 3.5
  investmentReturn: number; // annual % on savings e.g. 7
  years: number; // 10-40
  capitalGainsTax: number; // 0-1, default 0.25
}

export interface YearlyDataPoint {
  year: number;
  netWorth: number;
  totalDebt: number;
  assets: number;
  cashFlow: number; // monthly surplus/deficit
  monthlyMortgagePayment: number;
  monthlyCarPayment: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  netAfterTaxNetWorth: number;
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
}

/**
 * Spitzer (annuity) monthly payment calculation.
 * M = P * r * (1+r)^n / ((1+r)^n - 1)
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

/**
 * Equal Principal (קרן שווה) schedule:
 * Monthly principal payment is FIXED = principal / months
 * Monthly interest = remainingBalance * monthlyRate
 * Total monthly payment DECREASES over time (higher at start, lower at end)
 */
function calculateEqualPrincipalSchedule(track: MortgageTrack): number[] {
  const monthlyPrincipal = track.principal / track.months;
  const monthlyRate = track.rate / 100 / 12;
  const payments: number[] = [];
  let balance = track.principal;

  for (let m = 1; m <= track.months; m++) {
    const interest = balance * monthlyRate;
    const totalPayment = monthlyPrincipal + interest;
    payments.push(totalPayment);
    balance -= monthlyPrincipal;
  }
  return payments;
}

/**
 * Calculate monthly mortgage schedule for a single track.
 * Returns array of monthly payment amounts.
 */
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
      // CPI-linked: balance increases monthly by inflation/12
      // We recalculate the Spitzer payment each month based on remaining balance
      let balance = track.principal;
      const monthlyInflation = inflation / 100 / 12;
      const monthlyRate = track.rate / 100 / 12;

      for (let m = 0; m < track.months; m++) {
        const remaining = track.months - m;
        // Apply inflation to balance first
        balance *= 1 + monthlyInflation;

        // Recalculate payment on inflated balance
        let payment: number;
        if (monthlyRate === 0) {
          payment = balance / remaining;
        } else {
          const factor = Math.pow(1 + monthlyRate, remaining);
          payment = (balance * monthlyRate * factor) / (factor - 1);
        }

        payments.push(payment);

        // Calculate principal portion paid this month
        const interestPortion = balance * monthlyRate;
        const principalPortion = payment - interestPortion;
        balance -= principalPortion;

        if (balance < 0) balance = 0;
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

/**
 * Calculate monthly car loan schedule.
 * Uses balloon payment (residual value) at the end.
 */
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

  // Add residual (balloon) payment to last month
  if (residualValue > 0) {
    payments[payments.length - 1] += residualValue;
  }

  return payments;
}

/**
 * Main simulation function.
 * Runs month-by-month simulation for the specified number of years.
 */
export function runSimulation(params: SimulationParams): SimulationResult {
  const totalMonths = params.years * 12;
  const capitalGainsTax = params.capitalGainsTax ?? 0.25;

  // Pre-calculate all mortgage schedules
  const mortgageSchedules = params.mortgageTracks.map((track) =>
    calculateMortgageSchedule(track, params.boiRate, params.inflation)
  );

  // Pre-calculate car loan schedule
  const carSchedule = params.carLoan ? calculateCarSchedule(params.carLoan) : [];

  // Calculate initial total debt
  const initialCarDebt = params.carLoan
    ? params.carLoan.price - params.carLoan.downPayment
    : 0;

  // Track state
  let assets = params.currentAssets;
  let monthlyIncome = params.monthlyIncome;
  let monthlyExpenses = params.monthlyExpenses;

  // Track remaining debt for each mortgage
  const mortgageBalances = params.mortgageTracks.map((t) => t.principal);
  let carBalance = initialCarDebt;

  const yearlyData: YearlyDataPoint[] = [];
  let totalInterestPaid = 0;
  let totalCapitalGainsTaxPaid = 0;
  let debtFreeYear: number | null = null;
  let breakEvenYear: number | null = null;

  // Monthly investment return rate
  const monthlyInvestmentReturn = params.investmentReturn / 100 / 12;
  // Monthly inflation factor
  const annualInflationFactor = 1 + params.inflation / 100;

  // Sort events by year
  const sortedEvents = [...params.events].sort((a, b) => a.year - b.year);
  const appliedEvents = new Set<string>();

  for (let month = 1; month <= totalMonths; month++) {
    const currentYear = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;

    // Apply annual inflation to expenses at the start of each year (after year 1)
    if (monthInYear === 1 && currentYear > 1) {
      monthlyExpenses *= annualInflationFactor;
    }

    // Apply life events at start of their year
    for (const event of sortedEvents) {
      if (event.year === currentYear && monthInYear === 1 && !appliedEvents.has(event.id)) {
        appliedEvents.add(event.id);

        if (event.impact.incomeChange) {
          monthlyIncome += event.impact.incomeChange;
        }
        if (event.impact.expenseChange) {
          monthlyExpenses += event.impact.expenseChange;
        }
        if (event.impact.oneTimeAsset) {
          assets += event.impact.oneTimeAsset;
        }
        if (event.impact.newDebt) {
          carBalance += event.impact.newDebt;
        }
      }
    }

    // Calculate mortgage payments for this month
    let totalMortgagePayment = 0;
    for (let t = 0; t < params.mortgageTracks.length; t++) {
      const schedule = mortgageSchedules[t];
      const monthIdx = month - 1;

      if (monthIdx < schedule.length) {
        const payment = schedule[monthIdx];
        totalMortgagePayment += payment;

        // Update mortgage balance
        const track = params.mortgageTracks[t];
        let effectiveRate: number;
        if (track.type === 'prime') {
          effectiveRate = (params.boiRate + (track.margin ?? 1.5)) / 100 / 12;
        } else if (track.type === 'equal-principal') {
          effectiveRate = track.rate / 100 / 12;
          const principalPortion = track.principal / track.months;
          const interestPortion = mortgageBalances[t] * effectiveRate;
          totalInterestPaid += interestPortion;
          mortgageBalances[t] = Math.max(0, mortgageBalances[t] - principalPortion);
          continue;
        } else {
          effectiveRate = track.rate / 100 / 12;
        }
        const interestPortion = mortgageBalances[t] * effectiveRate;
        const principalPortion = Math.max(0, payment - interestPortion);
        totalInterestPaid += interestPortion;
        mortgageBalances[t] = Math.max(0, mortgageBalances[t] - principalPortion);
      }
    }

    // Calculate car payment for this month
    let monthlyCarPayment = 0;
    const carMonthIdx = month - 1;
    if (carSchedule.length > 0 && carMonthIdx < carSchedule.length) {
      monthlyCarPayment = carSchedule[carMonthIdx];
      const carRate = params.carLoan ? params.carLoan.rate / 100 / 12 : 0;
      const carInterest = carBalance * carRate;
      const carPrincipal = Math.max(0, monthlyCarPayment - carInterest);
      totalInterestPaid += carInterest;
      carBalance = Math.max(0, carBalance - carPrincipal);
    }

    // Monthly cash flow
    const totalPayments = totalMortgagePayment + monthlyCarPayment + monthlyExpenses;
    const cashFlow = monthlyIncome - totalPayments;

    // Invest surplus or draw from assets if deficit
    assets += cashFlow;

    // Apply investment return to positive assets, net of capital gains tax
    if (assets > 0) {
      const grossReturn = assets * monthlyInvestmentReturn;
      const taxableGain = grossReturn * capitalGainsTax;
      const netReturn = grossReturn - taxableGain;
      totalCapitalGainsTaxPaid += taxableGain;
      assets += netReturn;
    }

    // Record yearly snapshot at end of each year
    if (month % 12 === 0) {
      const totalMortgageDebt = mortgageBalances.reduce((sum, b) => sum + b, 0);
      const totalDebt = totalMortgageDebt + Math.max(0, carBalance);
      const netWorth = assets - totalDebt;
      const netAfterTaxNetWorth = netWorth; // already net of taxes applied monthly

      // Check debt-free year
      if (debtFreeYear === null && totalDebt < 1000) {
        debtFreeYear = currentYear;
      }

      // Check break-even year (net worth turns positive)
      if (breakEvenYear === null && netWorth > 0) {
        breakEvenYear = currentYear;
      }

      // Calculate average mortgage payment for this year
      let avgMortgagePayment = 0;
      for (let t = 0; t < params.mortgageTracks.length; t++) {
        const schedule = mortgageSchedules[t];
        const yearStartIdx = (currentYear - 1) * 12;
        const yearEndIdx = Math.min(yearStartIdx + 12, schedule.length);
        if (yearStartIdx < schedule.length) {
          const yearPayments = schedule.slice(yearStartIdx, yearEndIdx);
          avgMortgagePayment +=
            yearPayments.reduce((sum, p) => sum + p, 0) / yearPayments.length;
        }
      }

      const avgCarPayment =
        carSchedule.length > 0
          ? (() => {
              const yearStartIdx = (currentYear - 1) * 12;
              const yearEndIdx = Math.min(yearStartIdx + 12, carSchedule.length);
              if (yearStartIdx < carSchedule.length) {
                const yearPayments = carSchedule.slice(yearStartIdx, yearEndIdx);
                return yearPayments.reduce((sum, p) => sum + p, 0) / yearPayments.length;
              }
              return 0;
            })()
          : 0;

      yearlyData.push({
        year: currentYear,
        netWorth,
        totalDebt,
        assets: Math.max(0, assets),
        cashFlow: monthlyIncome - monthlyExpenses - avgMortgagePayment - avgCarPayment,
        monthlyMortgagePayment: avgMortgagePayment,
        monthlyCarPayment: avgCarPayment,
        totalMonthlyIncome: monthlyIncome,
        totalMonthlyExpenses: monthlyExpenses,
        netAfterTaxNetWorth,
      });
    }
  }

  const finalData = yearlyData[yearlyData.length - 1];
  const finalNetWorth = finalData?.netWorth ?? 0;

  // Calculate monthly breakdown for year 1
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
    finalNetWorth,
    totalCapitalGainsTaxPaid,
    monthlyBreakdown: {
      mortgage: firstYearData?.monthlyMortgagePayment ?? 0,
      car: firstYearData?.monthlyCarPayment ?? 0,
      expenses: firstYearData?.totalMonthlyExpenses ?? params.monthlyExpenses,
      savings: monthlySavings,
    },
  };
}
