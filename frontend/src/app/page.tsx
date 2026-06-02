"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Building2,
  Gauge,
  LineChart,
  LockKeyhole,
  Percent,
  ShieldCheck,
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

const whyThisMatters = [
  "RBF preserves ownership, so founders keep the exit optionality that equity dilutes away. The tradeoff is mechanical: a slice of monthly revenue leaves the business until the cap is cleared.",
  "That tradeoff is why operators compare RBF against equity in cash-flow terms, not just headline cost. A smaller check can still be expensive if it starves the growth engine.",
  "In the market, Pipe, Capchase, and Lighter Capital made revenue telemetry underwriting mainstream. They turned payment rails, banking data, and subscription velocity into a lending model that can move fast when the signal is strong.",
];

const marketControls = [
  "Pipe helped normalize recurring-revenue underwriting for software and usage-based businesses.",
  "Capchase pushed the market toward faster underwriting, with more emphasis on bank and revenue data than traditional collateral.",
  "Lighter Capital anchored the earlier RBF playbook, proving that repayment tied to revenue can work without a board seat or dilution.",
  "The real control layer is the data stack around payments and accounts. Whoever sees the cash first can price the risk first.",
];

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

export default function Home() {
  const { inputs, setInputs, scenario, macroContext, isLoading, error } =
    useRbfSimulator();

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

  return (
    <main className="min-h-screen px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:min-h-[calc(100vh-2rem)]">
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
              Live scenario modeling for non-dilutive capital, with benchmark
              context pulled from FRED and the World Bank.
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
          className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"
          variants={shellVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.aside variants={cardVariants}>
            <Card className="h-full border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center justify-between text-base text-white">
                  Simulator Controls
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                      >
                        <LockKeyhole className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Inputs debounce before calling the backend scenario API.
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <motion.div
                  className="grid gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3"
                  variants={microVariants}
                >
                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500">
                    <span>Macro Context</span>
                    <span>{macroContext ? macroContext.risk_free_rate.date : "Live"}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between rounded-md border border-cyan-400/20 bg-cyan-400/10 px-3 py-2">
                          <span className="text-sm text-cyan-100">
                            Risk-Free Rate
                          </span>
                          <span className="font-mono text-sm text-white">
                            {macroContext
                              ? `${macroContext.risk_free_rate.value.toFixed(2)}%`
                              : "..."}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {macroContext?.risk_free_rate.note ??
                          "FRED benchmark for the 10-year Treasury series."}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
                          <span className="text-sm text-emerald-100">
                            Benchmarked Growth
                          </span>
                          <span className="font-mono text-sm text-white">
                            {macroContext
                              ? `${macroContext.gdp_growth.value.toFixed(2)}%`
                              : "..."}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {macroContext?.gdp_growth.note ??
                          "World Bank GDP growth benchmark used to contextualize the growth slider."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>

                <motion.div className="space-y-6" variants={shellVariants}>
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
                      macroHint={
                        spec.key === "monthlyGrowthRate" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-xs text-cyan-200">
                                benchmarked
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Tracks macro growth context from the World Bank.
                            </TooltipContent>
                          </Tooltip>
                        ) : null
                      }
                    />
                  ))}
                </motion.div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                    <LineChart className="h-4 w-4" />
                    Model
                  </Button>
                  <Button variant="outline" className="border-white/10">
                    Export
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.aside>

          <section className="grid gap-4">
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
                    {repaymentRows.length ? (
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
                    {equityRows.length ? (
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

            <motion.div
              className="grid gap-4 md:grid-cols-2"
              variants={shellVariants}
              initial="hidden"
              animate="visible"
            >
              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base text-white">
                    Why this matters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
                  {whyThisMatters.map((point) => (
                    <p key={point}>{point}</p>
                  ))}
                </CardContent>
              </MotionCard>

              <MotionCard className="h-full border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base text-white">
                    Market Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
                  {marketControls.map((point) => (
                    <p key={point}>{point}</p>
                  ))}
                </CardContent>
              </MotionCard>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}
