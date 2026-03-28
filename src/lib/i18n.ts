import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  he: {
    translation: {
      appName: 'האורקל',
      tagline: 'ראה את עתידך הכלכלי',
      subtitle: 'סימולטור פיננסי מתקדם לישראלים',
      marketing: 'האם העתיד שלך בטוח? האורקל מחשב את המציאות הכלכלית שלך.',

      nav: {
        dashboard: 'לוח בקרה',
        settings: 'הגדרות',
        login: 'התחברות',
        logout: 'התנתקות',
        saveScenario: 'שמור תרחיש',
      },

      stats: {
        netWorth: 'שווי נטו',
        totalDebt: 'סך החוב',
        assets: 'נכסים',
        cashFlow: 'תזרים חודשי',
        debtFreeIn: 'חופשי מחוב בשנת',
        yearsToDebtFree: 'שנים עד חופשי מחוב',
        finalNetWorth: 'שווי נטו סופי',
        totalInterestPaid: 'סך ריבית ששולמה',
      },

      inputs: {
        monthlyIncome: 'הכנסה חודשית',
        monthlyExpenses: 'הוצאות חודשיות',
        currentAssets: 'חסכונות קיימים',
        simulationYears: 'שנות סימולציה',
        years: 'שנים',
      },

      mortgage: {
        title: 'משכנתא',
        addTrack: 'הוסף מסלול',
        prime: 'פריים',
        fixed: 'קבועה',
        cpiLinked: 'צמוד מדד',
        rate: 'ריבית',
        margin: 'מרווח',
        months: 'חודשים',
        principal: 'סכום',
        removeTrack: 'הסר מסלול',
        noTracks: 'לא הוגדרו מסלולי משכנתא',
        totalMortgage: 'סך המשכנתא',
        monthlyPayment: 'תשלום חודשי',
        budgetHealth: 'עומס המשכנתא',
      },

      car: {
        title: 'רכב',
        price: 'מחיר הרכב',
        downPayment: 'מקדמה',
        residualRate: 'שיורי (%)',
        rate: 'ריבית',
        months: 'חודשי מימון',
        enable: 'הוסף מימון רכב',
        disable: 'הסר מימון רכב',
      },

      economy: {
        title: 'משתנים כלכליים',
        boiRate: 'ריבית בנק ישראל',
        inflation: 'אינפלציה שנתית',
        investmentReturn: 'תשואת השקעות',
      },

      events: {
        title: 'אירועי חיים',
        addEvent: 'הוסף אירוע',
        buyHome: 'קניית דירה',
        havChild: 'לידת ילד',
        careerJump: 'קפיצת קריירה',
        retirement: 'פרישה לגמלאות',
        atYear: 'בשנה',
        incomeChange: 'שינוי הכנסה',
        expenseChange: 'שינוי הוצאות',
        noEvents: 'לא הוגדרו אירועי חיים',
        custom: 'מותאם אישית',
      },

      chart: {
        title: 'תחזית פיננסית',
        netWorth: 'שווי נטו',
        totalDebt: 'סך חוב',
        assets: 'נכסים',
        year: 'שנה',
        selectYear: 'בחר שנה',
      },

      accessibility: {
        title: 'נגישות',
        increaseFont: 'הגדל טקסט',
        decreaseFont: 'הקטן טקסט',
        highContrast: 'ניגודיות גבוהה',
        stopAnimations: 'עצור אנימציות',
        readableFont: 'גופן קריא',
        reset: 'איפוס',
        fontSize: 'גודל גופן',
      },

      legal: {
        disclaimer:
          'הסימולטור נועד למטרות המחשה בלבד ואינו מהווה ייעוץ פיננסי, המלצה להשקעה, ייעוץ מס או ייעוץ משפטי. לפי חוק הסדרת העיסוק בייעוץ השקעות, שיווק השקעות וניהול תיקי השקעות, התשנ״ה-1995, אין לראות בתוכן זה ייעוץ מוסמך. יש להתייעץ עם יועץ פיננסי מוסמך לפני קבלת החלטות השקעה.',
      },

      tooltips: {
        spitzer:
          'שיטת שפיצר: תשלום חודשי קבוע לאורך כל תקופת ההלוואה. חלק הריבית גדל בהתחלה ופוחת עם הזמן.',
        prime:
          'ריבית פריים: ריבית הבנקים המסחריים, הנגזרת מריבית בנק ישראל. כיום: BOI + 1.5%',
        cpiLinked:
          'צמוד מדד: קרן ההלוואה עולה עם האינפלציה (מדד המחירים לצרכן), לכן התשלום החודשי גדל עם השנים.',
        boiRate:
          'ריבית בנק ישראל: הריבית שקובעת הוועדה המוניטרית 8 פעמים בשנה. משפיעה על ריבית הפריים ועל הכלכלה כולה.',
      },

      hero: {
        title: 'האם העתיד שלך בטוח?',
        subtitle: 'האורקל מחשב את המציאות הכלכלית שלך',
        cta: 'התחל להגדיר את הפרמטרים שלך ←',
        feature1: 'חישוב משכנתא ישראלי מדויק',
        feature2: 'סימולציה לטווח ארוך',
        feature3: 'אירועי חיים ותרחישים',
      },

      yearInfo: {
        title: 'נתוני שנה',
        income: 'הכנסה',
        expenses: 'הוצאות',
        mortgagePayment: 'משכנתא',
        carPayment: 'רכב',
        savings: 'חיסכון',
      },

      breakdown: {
        title: 'פירוט תקציב חודשי',
        mortgage: 'משכנתא',
        car: 'רכב',
        expenses: 'הוצאות',
        savings: 'חיסכון',
      },

      common: {
        save: 'שמור',
        cancel: 'ביטול',
        close: 'סגור',
        add: 'הוסף',
        remove: 'הסר',
        edit: 'ערוך',
        currency: '₪',
        percent: '%',
        perMonth: '/ חודש',
        perYear: '/ שנה',
        on: 'פועל',
        off: 'כבוי',
      },
    },
  },
  en: {
    translation: {
      appName: 'The Oracle',
      tagline: 'See Your Financial Future',
      subtitle: 'Advanced Financial Simulator for Israelis',
      marketing: 'Is your future secure? The Oracle calculates your financial reality.',

      nav: {
        dashboard: 'Dashboard',
        settings: 'Settings',
        login: 'Login',
        logout: 'Logout',
        saveScenario: 'Save Scenario',
      },

      stats: {
        netWorth: 'Net Worth',
        totalDebt: 'Total Debt',
        assets: 'Assets',
        cashFlow: 'Monthly Cash Flow',
        debtFreeIn: 'Debt-Free in Year',
        yearsToDebtFree: 'Years Until Debt-Free',
        finalNetWorth: 'Final Net Worth',
        totalInterestPaid: 'Total Interest Paid',
      },

      inputs: {
        monthlyIncome: 'Monthly Income',
        monthlyExpenses: 'Monthly Expenses',
        currentAssets: 'Current Savings',
        simulationYears: 'Simulation Years',
        years: 'Years',
      },

      mortgage: {
        title: 'Mortgage',
        addTrack: 'Add Track',
        prime: 'Prime',
        fixed: 'Fixed',
        cpiLinked: 'CPI-Linked',
        rate: 'Rate',
        margin: 'Margin',
        months: 'Months',
        principal: 'Amount',
        removeTrack: 'Remove Track',
        noTracks: 'No mortgage tracks configured',
        totalMortgage: 'Total Mortgage',
        monthlyPayment: 'Monthly Payment',
        budgetHealth: 'Mortgage Load',
      },

      car: {
        title: 'Car',
        price: 'Car Price',
        downPayment: 'Down Payment',
        residualRate: 'Residual (%)',
        rate: 'Rate',
        months: 'Financing Months',
        enable: 'Add Car Financing',
        disable: 'Remove Car Financing',
      },

      economy: {
        title: 'Economic Variables',
        boiRate: 'Bank of Israel Rate',
        inflation: 'Annual Inflation',
        investmentReturn: 'Investment Return',
      },

      events: {
        title: 'Life Events',
        addEvent: 'Add Event',
        buyHome: 'Buy Home',
        havChild: 'Have a Child',
        careerJump: 'Career Jump',
        retirement: 'Retirement',
        atYear: 'At Year',
        incomeChange: 'Income Change',
        expenseChange: 'Expense Change',
        noEvents: 'No life events configured',
        custom: 'Custom',
      },

      chart: {
        title: 'Financial Forecast',
        netWorth: 'Net Worth',
        totalDebt: 'Total Debt',
        assets: 'Assets',
        year: 'Year',
        selectYear: 'Select Year',
      },

      accessibility: {
        title: 'Accessibility',
        increaseFont: 'Increase Text',
        decreaseFont: 'Decrease Text',
        highContrast: 'High Contrast',
        stopAnimations: 'Stop Animations',
        readableFont: 'Readable Font',
        reset: 'Reset',
        fontSize: 'Font Size',
      },

      legal: {
        disclaimer:
          'This simulator is for illustrative purposes only and does not constitute financial advice, investment recommendation, tax advice, or legal advice. This content should not be considered professional advice. Consult a qualified financial advisor before making investment decisions.',
      },

      tooltips: {
        spitzer:
          'Spitzer method: Fixed monthly payment throughout the loan period. The interest portion is higher at first and decreases over time.',
        prime: 'Prime rate: Commercial bank rate derived from the Bank of Israel rate. Currently: BOI + 1.5%',
        cpiLinked:
          'CPI-Linked: The loan principal increases with inflation (Consumer Price Index), so monthly payments grow over time.',
        boiRate:
          'Bank of Israel Rate: Set by the Monetary Committee 8 times a year. Affects prime rate and the entire economy.',
      },

      hero: {
        title: 'Is Your Future Secure?',
        subtitle: 'The Oracle calculates your financial reality',
        cta: 'Start configuring your parameters →',
        feature1: 'Accurate Israeli Mortgage Calculation',
        feature2: 'Long-Term Simulation',
        feature3: 'Life Events & Scenarios',
      },

      yearInfo: {
        title: 'Year Data',
        income: 'Income',
        expenses: 'Expenses',
        mortgagePayment: 'Mortgage',
        carPayment: 'Car',
        savings: 'Savings',
      },

      breakdown: {
        title: 'Monthly Budget Breakdown',
        mortgage: 'Mortgage',
        car: 'Car',
        expenses: 'Expenses',
        savings: 'Savings',
      },

      common: {
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        add: 'Add',
        remove: 'Remove',
        edit: 'Edit',
        currency: '₪',
        percent: '%',
        perMonth: '/ month',
        perYear: '/ year',
        on: 'On',
        off: 'Off',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'he',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
