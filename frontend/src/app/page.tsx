"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Building2,
  Download,
  FileSpreadsheet,
  Gauge,
  Info,
  LayoutDashboard,
  Percent,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  SimulatorInputs,
} from "@/lib/simulator";
import { useRbfSimulator } from "@/hooks/use-rbf-simulator";

type SliderSpec = {
  key: keyof SimulatorInputs;
  testId: string;
  label: string;
  icon: typeof BadgeDollarSign;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  note?: string;
};

type ChartRow = {
  month: number;
  revenue: number;
  payment: number;
  cumulativePaid: number;
  remainingCap: number;
};

const sliderSpecs: SliderSpec[] = [
  {
    key: "investmentAmount",
    testId: "investment-amount",
    label: "Investment Amount",
    icon: BadgeDollarSign,
    min: 250_000,
    max: 2_000_000,
    step: 25_000,
    format: formatCompactCurrency,
  },
  {
    key: "monthlyRevenue",
    testId: "monthly-revenue",
    label: "Monthly Revenue",
    icon: Banknote,
    min: 50_000,
    max: 500_000,
    step: 10_000,
    format: formatCompactCurrency,
  },
  {
    key: "monthlyGrowthRate",
    testId: "monthly-growth-rate",
    label: "Growth Rate",
    icon: TrendingUp,
    min: -0.05,
    max: 0.2,
    step: 0.005,
    format: formatPercent,
    note: "Benchmarked against World Bank GDP growth.",
  },
  {
    key: "repaymentCapMultiple",
    testId: "repayment-cap",
    label: "Repayment Cap",
    icon: Percent,
    min: 1.2,
    max: 3,
    step: 0.05,
    format: (value) => `${value.toFixed(2)}x`,
  },
  {
    key: "revenueSharePercent",
    testId: "revenue-share",
    label: "Revenue Share",
    icon: BarChart3,
    min: 0.03,
    max: 0.15,
    step: 0.005,
    format: formatPercent,
    note: "Defines the monthly take from topline revenue.",
  },
  {
    key: "postMoneyValuation",
    testId: "post-money-valuation",
    label: "Post-Money Valuation",
    icon: Building2,
    min: 1_000_000,
    max: 20_000_000,
    step: 250_000,
    format: formatCompactCurrency,
  },
  {
    key: "exitValue",
    testId: "exit-value",
    label: "Exit Value",
    icon: ArrowUpRight,
    min: 5_000_000,
    max: 100_000_000,
    step: 1_000_000,
    format: formatCompactCurrency,
  },
];

const shellVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.18, ease: "easeOut" },
  },
} as const;

const microVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

function toChartRows(
  scenario: ReturnType<typeof useRbfSimulator>["scenario"],
): ChartRow[] {
  return (
    scenario?.amortization.map((point) => ({
      month: point.month,
      revenue: point.revenue,
      payment: point.payment,
      cumulativePaid: point.cumulative_paid,
      remainingCap: point.remaining_cap,
    })) ?? []
  );
}

function compactTick(value: number) {
  return formatCompactCurrency(value).replace(".0", "");
}

function MotionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className={className}>{children}</Card>
    </motion.div>
  );
}

function InputSlider({
  spec,
  value,
  onChange,
  macroHint,
}: {
  spec: SliderSpec;
  value: number;
  onChange: (next: number) => void;
  macroHint?: ReactNode;
}) {
  const Icon = spec.icon;

  return (
    <motion.div
      variants={microVariants}
      className="space-y-3"
      data-testid={`control-${spec.testId}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Icon className="h-4 w-4 text-cyan-300" />
            <span>{spec.label}</span>
            {macroHint ? <span className="text-cyan-200">{macroHint}</span> : null}
          </div>
          {spec.note ? <p className="text-xs text-slate-500">{spec.note}</p> : null}
        </div>
        <span
          className="font-mono text-sm text-white"
          data-testid={`${spec.testId}-value`}
        >
          {spec.format(value)}
        </span>
      </div>
      <Slider
        data-testid={`${spec.testId}-slider`}
        value={[value]}
        max={spec.max}
        min={spec.min}
        step={spec.step}
        onValueChange={(next) => onChange(next[0] ?? value)}
      />
    </motion.div>
  );
}

function ChartPanel({
  title,
  icon: Icon,
  children,
  status,
}: {
  title: string;
  icon: typeof BarChart3;
  children: ReactNode;
  status?: string;
}) {
  return (
    <Card className="min-h-[360px] border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20 backdrop-blur transition-shadow hover:shadow-cyan-500/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base text-white">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-emerald-300" />
            {title}
          </span>
          {status ? <span className="text-xs text-slate-400">{status}</span> : null}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const content = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportAmortization(scenario: ReturnType<typeof useRbfSimulator>["scenario"]) {
  if (!scenario) return;
  const headers = ["Month", "Revenue", "Payment", "Remaining Cap"];
  const rows = scenario.amortization.map((p) => [
    p.month,
    p.revenue.toFixed(2),
    p.payment.toFixed(2),
    p.remaining_cap.toFixed(2),
  ]);
  downloadCsv("rbf_repayment_plan.csv", [headers, ...rows]);
}

function downloadSampleData() {
  const headers = ["Dataset", "Sector", "Typical Growth (%)", "RBF Cap", "Revenue Share (%)"];
  const rows = [
    ["Synthetic sample data", "SaaS", "15", "1.5x", "8"],
    ["Synthetic sample data", "E-commerce", "25", "2.0x", "12"],
    ["Synthetic sample data", "DTC", "10", "1.8x", "10"],
    ["Synthetic sample data", "Fintech", "20", "2.5x", "6"],
  ];
  downloadCsv("rbf_sample_benchmarks.csv", [headers, ...rows]);
}

function getInsights(
  scenario: ReturnType<typeof useRbfSimulator>["scenario"],
  macro: ReturnType<typeof useRbfSimulator>["macroContext"]
) {
  if (!scenario) return [];
  const list = [];

  const apr = scenario.effective_apr_percent ?? 0;
  if (apr > (macro?.risk_free_rate.value ?? 4) + 15) {
    list.push("High capital cost relative to market benchmarks.");
  } else {
    list.push("Competitive APR for non-dilutive capital.");
  }

  if ((scenario.months_to_repay ?? 0) < 24) {
    list.push("Rapid repayment velocity detected.");
  } else {
    list.push("Extended repayment horizon provides cash-flow buffer.");
  }

  if (scenario.equity_comparison.founder_exit_cost > scenario.equity_comparison.rbf_total_cost * 3) {
    list.push("Significant ownership preservation advantage.");
  }

  return list;
}

export default function Home() {
  const [isStressTest, setIsStressTest] = useState(false);
  const stressOverrides = useMemo(() => (isStressTest ? { monthlyGrowthRate: -0.015 } : {}), [isStressTest]);

  const { inputs, setInputs, scenario, macroContext, isLoading, error } =
    useRbfSimulator(stressOverrides);
  const [isMounted, setIsMounted] = useState(false);

  const repaymentRows = useMemo(() => toChartRows(scenario), [scenario]);

  const equityRows = useMemo(() => {
    if (!scenario) {
      return [];
    }

    return [
      {
        name: "Cost of RBF",
        value: scenario.equity_comparison.rbf_total_cost,
      },
      {
        name: "Value of Equity Lost",
        value: scenario.equity_comparison.founder_exit_cost,
      },
    ];
  }, [scenario]);

  const rbfIsBetter =
    scenario !== null &&
    scenario.equity_comparison.founder_exit_cost >
      scenario.equity_comparison.rbf_total_cost;

  const insights = useMemo(() => getInsights(scenario, macroContext), [scenario, macroContext]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:h-[calc(100vh-2rem)]">
        <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              <span>Capital Formation / PoC 80</span>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Revenue-Based Financing Simulator
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              High-fidelity intelligence for non-dilutive capital, with real-world 
              benchmarks from FRED and the World Bank.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            <Gauge className="h-4 w-4 text-emerald-300" />
            <span className="text-sm text-slate-300">
              {isLoading ? "Refreshing scenario" : "Backend live"}
            </span>
            <Switch
              aria-label="Backend readiness indicator"
              data-testid="backend-readiness-switch"
              defaultChecked
            />
          </div>
        </header>

        <motion.div
          className="grid flex-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden"
          variants={shellVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.aside variants={cardVariants} className="lg:h-full lg:overflow-hidden">
            <Card className="flex h-full flex-col border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur">
              <CardHeader className="border-b border-white/10 py-4">
                <CardTitle className="flex items-center justify-between text-base text-white">
                  Intelligence Hub
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <LayoutDashboard className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Full-spectrum modeling and market context.
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-8 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {/* 1. Macro Context */}
                <motion.section className="space-y-4" variants={microVariants}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Info className="h-3.5 w-3.5 text-cyan-400" />
                    Macro Context
                  </div>
                  <div className="grid gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between rounded-md border border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5 transition-colors hover:bg-cyan-400/10">
                          <span className="text-sm text-cyan-100">Risk-Free Rate</span>
                          <span className="font-mono text-sm font-bold text-white">
                            {macroContext ? `${macroContext.risk_free_rate.value.toFixed(2)}%` : "..."}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{macroContext?.risk_free_rate.note ?? "FRED benchmark"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2.5 transition-colors hover:bg-emerald-400/10">
                          <span className="text-sm text-emerald-100">GDP Growth</span>
                          <span className="font-mono text-sm font-bold text-white">
                            {macroContext ? `${macroContext.gdp_growth.value.toFixed(2)}%` : "..."}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{macroContext?.gdp_growth.note ?? "World Bank benchmark"}</TooltipContent>
                    </Tooltip>
                  </div>
                </motion.section>

                {/* 2. Controls */}
                <motion.section className="space-y-6" variants={shellVariants}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Percent className="h-3.5 w-3.5 text-cyan-400" />
                    Contract Controls
                  </div>
                  {sliderSpecs.map((spec) => (
                    <InputSlider
                      key={String(spec.key)}
                      spec={spec}
                      value={inputs[spec.key]}
                      onChange={(next) =>
                        setInputs((current) => ({
                          ...current,
                          [spec.key]: next,
                        }))
                      }
                    />
                  ))}
                  
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 transition-colors hover:bg-rose-500/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-rose-200">
                        <TrendingDown className="h-4 w-4" />
                        Downside Stress Case
                      </div>
                      <p className="text-xs text-slate-500 italic">Overrides growth to -1.5%</p>
                    </div>
                    <Switch 
                      checked={isStressTest} 
                      onCheckedChange={setIsStressTest}
                      className="data-[state=checked]:bg-rose-500"
                    />
                  </div>
                </motion.section>

                {/* 3. Insights */}
                <motion.section className="space-y-4 border-t border-white/10 pt-6" variants={microVariants}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
                    Insights
                  </div>
                  <div className="space-y-2">
                    {insights.map((insight, i) => (
                      <div key={i} className="flex gap-2 rounded-md bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-300">
                        <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        {insight}
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <p className="text-xs italic text-slate-500">Waiting for scenario analysis...</p>
                    )}
                  </div>
                </motion.section>

                {/* 4. Narrative Panels */}
                <motion.section className="space-y-6 border-t border-white/10 pt-6 pb-2" variants={microVariants}>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Why this matters</h4>
                    <p className="text-xs leading-relaxed text-slate-400">
                      RBF preserves ownership, trading short-term cash flow for long-term equity optionality. 
                      Founders use this model to find the &quot;Break-even Ownership&quot; point.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Who controls this rail</h4>
                    <ul className="grid gap-2 text-xs text-slate-400">
                      <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-600" /> Pipe: Recurring revenue underwriting.</li>
                      <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-600" /> Capchase: Frictionless liquidity.</li>
                      <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-slate-600" /> Lighter Capital: The original RBF rail.</li>
                    </ul>
                  </div>
                </motion.section>

                {/* 5. Actions */}
                <motion.section className="grid gap-3 pt-2" variants={microVariants}>
                  <Button 
                    className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold"
                    onClick={() => exportAmortization(scenario)}
                  >
                    <Download className="h-4 w-4" />
                    Export Full Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5 text-slate-300"
                    onClick={downloadSampleData}
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                    Download Sample Data
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    Synthetic benchmark dataset for demonstration only.
                  </p>
                </motion.section>
              </CardContent>
            </Card>
          </motion.aside>

          <section className="flex h-full flex-col gap-4 lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 pb-8">
            {error ? (
              <Card className="border-rose-400/30 bg-rose-500/10">
                <CardContent className="py-4 text-sm text-rose-100">
                  {error}
                </CardContent>
              </Card>
            ) : null}

            <motion.div
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
              variants={shellVariants}
              initial="hidden"
              animate="visible"
            >
              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    Total RBF Cap
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="text-2xl font-semibold text-white"
                  data-testid="metric-total-rbf-cap"
                >
                  {scenario ? formatCurrency(scenario.total_repayment_cap) : "..."}
                </CardContent>
              </MotionCard>

              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    Months to Repay
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  {scenario?.months_to_repay ?? "Open"}
                </CardContent>
              </MotionCard>

              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    Effective APR
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  {scenario?.effective_apr_percent
                    ? `${scenario.effective_apr_percent.toFixed(1)}%`
                    : "N/A"}
                </CardContent>
              </MotionCard>

              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">
                    Equity Loss
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  {scenario
                    ? formatCurrency(scenario.equity_comparison.founder_exit_cost)
                    : "..."}
                </CardContent>
              </MotionCard>

              <MotionCard
                className={`h-full border backdrop-blur ${
                  rbfIsBetter
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-amber-400/30 bg-amber-400/10"
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
                    {rbfIsBetter ? (
                      <BadgeCheck className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <TriangleAlert className="h-4 w-4 text-amber-300" />
                    )}
                    Deal Signal
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-100">
                  {scenario ? (
                    rbfIsBetter ? (
                      <>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          RBF wins
                        </span>
                        <div className="mt-3">
                          The model says the founder keeps more exit value than
                          they surrender through this equity raise.
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                          <TriangleAlert className="h-3.5 w-3.5" />
                          Equity leads
                        </span>
                        <div className="mt-3">
                          On this scenario, equity is cheaper on paper than the
                          modeled revenue share.
                        </div>
                      </>
                    )
                  ) : (
                    "Waiting for scenario data."
                  )}
                </CardContent>
              </MotionCard>
            </motion.div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
              <MotionCard>
                <ChartPanel
                  title="Repayment Curve"
                  icon={BarChart3}
                  status={isLoading ? "updating" : "live"}
                >
                  <div className="h-[320px] rounded-md border border-white/10 bg-black/20 p-3">
                    {isMounted && repaymentRows.length ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <AreaChart data={repaymentRows}>
                          <defs>
                            <linearGradient
                              id="revenueFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#cbd5e1", fontSize: 12 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#cbd5e1", fontSize: 12 }}
                            tickFormatter={compactTick}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              background: "rgba(2, 6, 23, 0.96)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 8,
                              color: "#fff",
                            }}
                            formatter={(value, name) => [
                              formatCurrency(Number(value ?? 0)),
                              name === "revenue" ? "Revenue" : "Payment",
                            ]}
                            labelFormatter={(label) => `Month ${label}`}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fill="url(#revenueFill)"
                          />
                          <Line
                            type="monotone"
                            dataKey="payment"
                            name="Payment"
                            stroke="#6ee7b7"
                            strokeWidth={3}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Chart initializing
                      </div>
                    )}
                  </div>
                </ChartPanel>
              </MotionCard>

              <MotionCard>
                <ChartPanel title="Equity Comparison" icon={Building2} status="stark contrast">
                  <div className="h-[320px] rounded-md border border-white/10 bg-black/20 p-3">
                    {isMounted && equityRows.length ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                      >
                        <BarChart data={equityRows}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#cbd5e1", fontSize: 12 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#cbd5e1", fontSize: 12 }}
                            tickFormatter={compactTick}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              background: "rgba(2, 6, 23, 0.96)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 8,
                              color: "#fff",
                            }}
                            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Value"]}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {equityRows.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={index === 0 ? "#22d3ee" : "#fbbf24"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Chart initializing
                      </div>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-3">
                      <div className="text-xs uppercase tracking-wide text-cyan-200">
                        Cost of RBF
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {scenario
                          ? formatCurrency(scenario.equity_comparison.rbf_total_cost)
                          : "..."}
                      </div>
                    </div>
                    <div className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3">
                      <div className="text-xs uppercase tracking-wide text-amber-200">
                        Value of Equity Lost
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {scenario
                          ? formatCurrency(scenario.equity_comparison.founder_exit_cost)
                          : "..."}
                      </div>
                    </div>
                  </div>
                </ChartPanel>
              </MotionCard>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
