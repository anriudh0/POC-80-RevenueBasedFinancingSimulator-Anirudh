"use client";

import {
  ArrowUpRight,
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
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const controls = [
  {
    label: "Investment Amount",
    value: "$750K",
    icon: BadgeDollarSign,
    slider: [58],
  },
  {
    label: "Monthly Revenue",
    value: "$180K",
    icon: Banknote,
    slider: [46],
  },
  {
    label: "Growth Rate",
    value: "4.8%",
    icon: TrendingUp,
    slider: [64],
  },
  {
    label: "Repayment Cap",
    value: "1.8x",
    icon: Percent,
    slider: [52],
  },
];

const timeline = [18, 28, 35, 44, 52, 59, 66, 72, 76, 80, 82, 84];
const equityBars = [
  { label: "RBF", height: "54%", tone: "bg-cyan-300" },
  { label: "Equity", height: "78%", tone: "bg-amber-300" },
  { label: "Stress", height: "38%", tone: "bg-emerald-300" },
];

export default function Home() {
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
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
            <Gauge className="h-4 w-4 text-emerald-300" />
            <span className="text-sm text-slate-300">Backend ready</span>
            <Switch aria-label="Backend readiness indicator" defaultChecked />
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <motion.aside
            initial={{ x: -8 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
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
                      Scenario inputs stay local in this phase.
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                {controls.map((control) => {
                  const Icon = control.icon;

                  return (
                    <div key={control.label} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icon className="h-4 w-4 text-cyan-300" />
                          <span>{control.label}</span>
                        </div>
                        <span className="font-mono text-sm text-white">
                          {control.value}
                        </span>
                      </div>
                      <Slider value={control.slider} max={100} step={1} />
                    </div>
                  );
                })}

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
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
              <motion.div
                initial={{ y: 8 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
              >
                <Card className="min-h-[360px] border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <BarChart3 className="h-5 w-5 text-emerald-300" />
                      Repayment Curve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-[260px] items-end gap-2 rounded-md border border-white/10 bg-black/20 p-4">
                      {timeline.map((height, index) => (
                        <div
                          key={index}
                          className="flex h-full min-w-0 flex-1 items-end rounded-sm bg-slate-900"
                        >
                          <div
                            className="w-full rounded-sm bg-gradient-to-t from-cyan-500 to-emerald-300"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 8 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
              >
                <Card className="min-h-[360px] border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-white">
                      <Building2 className="h-5 w-5 text-amber-300" />
                      Equity Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-[260px] items-end justify-around rounded-md border border-white/10 bg-black/20 p-5">
                      {equityBars.map((bar) => (
                        <div
                          key={bar.label}
                          className="flex h-full w-20 flex-col justify-end gap-3"
                        >
                          <div
                            className={`${bar.tone} rounded-sm shadow-lg shadow-black/30`}
                            style={{ height: bar.height }}
                          />
                          <span className="text-center text-xs font-medium text-slate-300">
                            {bar.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base text-white">
                    Why this matters
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-300">
                  RBF preserves founder ownership, but every revenue month carries
                  a cash-flow claim until the cap is repaid.
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base text-white">
                    Market Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-300">
                  Platforms, credit funds, and payment rails shape advance size,
                  repayment speed, and underwriting visibility.
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
