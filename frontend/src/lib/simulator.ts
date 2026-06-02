export type SimulatorInputs = {
  investmentAmount: number;
  monthlyRevenue: number;
  monthlyGrowthRate: number;
  repaymentCapMultiple: number;
  revenueSharePercent: number;
  months: number;
  postMoneyValuation: number;
  exitValue: number;
};

export type AmortizationPoint = {
  month: number;
  revenue: number;
  payment: number;
  cumulative_paid: number;
  remaining_cap: number;
};

export type ScenarioResponse = {
  source: "calculated";
  total_repayment_cap: number;
  months_to_repay: number | null;
  total_paid: number;
  effective_apr_percent: number | null;
  amortization: AmortizationPoint[];
  equity_comparison: {
    ownership_lost_percent: number;
    founder_exit_cost: number;
    rbf_total_cost: number;
    rbf_premium_over_principal: number;
  };
};

export type MacroContext = {
  risk_free_rate: {
    name: string;
    value: number;
    unit: string;
    date: string;
    source: "fred" | "world_bank" | "mock";
    note?: string | null;
  };
  gdp_growth: {
    name: string;
    value: number;
    unit: string;
    date: string;
    source: "fred" | "world_bank" | "mock";
    note?: string | null;
  };
};

export const defaultInputs: SimulatorInputs = {
  investmentAmount: 750_000,
  monthlyRevenue: 180_000,
  monthlyGrowthRate: 0.048,
  repaymentCapMultiple: 1.8,
  revenueSharePercent: 0.08,
  months: 48,
  postMoneyValuation: 3_500_000,
  exitValue: 24_000_000,
};

export function toRequestBody(inputs: SimulatorInputs) {
  return {
    monthly_revenue: inputs.monthlyRevenue,
    monthly_growth_rate: inputs.monthlyGrowthRate,
    investment_amount: inputs.investmentAmount,
    repayment_cap_multiple: inputs.repaymentCapMultiple,
    revenue_share_percent: inputs.revenueSharePercent,
    months: inputs.months,
    post_money_valuation: inputs.postMoneyValuation,
    exit_value: inputs.exitValue,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
