/**
 * ReturnPeriodSimulator — REx-branded embeddable React component
 *
 * Dependencies: framer-motion, lucide-react, tailwindcss
 * Font: Inter (load via Google Fonts or your font stack)
 */

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Info, CalendarDays, Building2, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

// ─── Constants ────────────────────────────────────────────────────────────────

const RETURN_PERIODS = [2, 5, 10, 20, 50, 100, 200, 500];

const HORIZONS = [
  { years: 1,   label: "1 year",    decision: "This year",         detail: "annual budget, seasonal readiness, insurance renewal" },
  { years: 3,   label: "3 years",   decision: "Election cycle",    detail: "political term, short-term work programme" },
  { years: 10,  label: "10 years",  decision: "Long-term plan",    detail: "council LTP, near-term asset planning" },
  { years: 30,  label: "30 years",  decision: "Home mortgage",     detail: "mortgage period, household decision-making" },
  { years: 50,  label: "50 years",  decision: "Asset life",        detail: "roads, pipes, public facilities, renewal planning" },
  { years: 75,  label: "75 years",  decision: "Human lifetime",    detail: "living with risk across a lifetime" },
  { years: 100, label: "100 years", decision: "Long-term planning", detail: "land-use planning, climate scenarios, strategic retreat" },
];

// ─── Maths ────────────────────────────────────────────────────────────────────

function aepFromAri(ari: number) {
  return 1 - Math.exp(-1 / ari);
}

function probabilityOverYears(aep: number, years: number) {
  return 1 - Math.pow(1 - aep, years);
}

function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function likelihoodLabel(p: number) {
  const x = p * 100;
  if (x >= 99) return "Virtually certain";
  if (x >= 90) return "Very likely";
  if (x >= 66) return "Likely";
  if (x >= 33) return "About as likely as not";
  if (x <= 1)  return "Exceptionally unlikely";
  if (x <= 10) return "Very unlikely";
  return "Unlikely";
}

function toFrequency(p: number): string {
  if (p >= 0.99) return "virtually certain";
  const inv = 1 / p;
  const denoms = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500];
  const best = denoms.reduce((a, b) => (Math.abs(b - inv) < Math.abs(a - inv) ? b : a));
  return `about 1 in ${best}`;
}

function comparatorText(p: number): string | null {
  const x = p * 100;
  if (x >= 90) return "more likely than drawing a non-ace from a deck of cards";
  if (x >= 50) return "at least as likely as a coin flip";
  if (x >= 30) return "about as likely as rolling a 1 or 2 on a six-sided die";
  if (x >= 15) return "about as likely as rolling a 6 on a six-sided die";
  if (x >= 8)  return "about as likely as rolling a 1 on a ten-sided die";
  if (x >= 3)  return "about as likely as rolling a 1 on a thirty-sided die";
  return null;
}

function rand() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const x = new Uint32Array(1);
    crypto.getRandomValues(x);
    return x[0] / 2 ** 32;
  }
  return Math.random();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type YearResult = "hit" | "miss" | undefined;

function Timeline({ yearResults, years }: { yearResults: YearResult[]; years: number }) {
  const showEvery = years <= 30 ? 1 : years <= 50 ? 5 : 10;

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${years}, minmax(0, 1fr))` }}>
        {Array.from({ length: years }).map((_, i) => {
          const result = yearResults[i];
          const hit    = result === "hit";
          const played = result === "hit" || result === "miss";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.006, 0.25) }}
              className={`h-8 rounded border flex items-center justify-center text-[10px] font-medium ${
                hit
                  ? "bg-red-600 text-white border-red-700 shadow-sm"
                  : played
                    ? "bg-slate-200 text-slate-500 border-slate-300"
                    : "bg-white text-slate-300 border-slate-200"
              }`}
              title={`Year ${i + 1}${hit ? ": event occurs" : played ? ": no event" : ": not simulated yet"}`}
            >
              {hit ? "!" : years <= 30 ? i + 1 : ""}
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${years}, minmax(0, 1fr))` }}>
        {Array.from({ length: years }).map((_, i) => (
          <div key={i} className="text-[9px] text-slate-400 text-center h-3">
            {(i === 0 || (i + 1) % showEvery === 0 || i + 1 === years) ? i + 1 : ""}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Year 1</span>
        <span>Year {years}</span>
      </div>
    </div>
  );
}

// ─── Shared button styles ─────────────────────────────────────────────────────
// REx buttons use an asymmetric bottom-right radius as a brand signature.

const btnPrimary =
  "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-br-lg " +
  "bg-[#2e76bc] text-white border border-[#2e76bc] " +
  "hover:bg-[#0b2948] hover:border-[#0b2948] transition-colors duration-200 " +
  "disabled:opacity-40 disabled:pointer-events-none";

const btnOutline =
  "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-br-lg " +
  "bg-white text-[#2e76bc] border border-[#2e76bc] " +
  "hover:bg-blue-50 transition-colors duration-200 " +
  "disabled:opacity-40 disabled:pointer-events-none";


// ─── Main component ───────────────────────────────────────────────────────────

export default function ReturnPeriodSimulator() {
  const [ari, setAri] = useState(100);
  const [years, setYears] = useState(30);
  const [yearResults, setYearResults] = useState<YearResult[]>([]);
  const [futures, setFutures] = useState<boolean[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [dieFace, setDieFace] = useState(0);
  const [horizonEverCompleted, setHorizonEverCompleted] = useState(false);

  const horizon         = HORIZONS.find((h) => h.years === years) ?? HORIZONS[3];
  const aep             = useMemo(() => aepFromAri(ari), [ari]);
  const cumulative      = useMemo(() => probabilityOverYears(aep, years), [aep, years]);
  const label           = likelihoodLabel(cumulative);
  const currentYear     = yearResults.length + 1;
  const eventYears      = yearResults.map((x, i) => (x === "hit" ? i + 1 : null)).filter(Boolean) as number[];
  const horizonComplete = yearResults.length >= years;

  function spinOneYear() {
    if (horizonComplete) return;
    setSpinning(true);
    // cycle die faces for 400ms then settle
    let ticks = 0;
    const interval = window.setInterval(() => {
      setDieFace(Math.floor(Math.random() * 6));
      if (++ticks >= 6) window.clearInterval(interval);
    }, 65);
    const hit     = rand() < aep;
    const updated = [...yearResults, hit ? "hit" : "miss"] as YearResult[];
    setYearResults(updated);
    if (updated.length === years) {
      setHorizonEverCompleted(true);
      setFutures((prev) => [updated.includes("hit"), ...prev].slice(0, 40));
    }
    window.setTimeout(() => setSpinning(false), 450);
  }

  function runRemainingYears() {
    setSpinning(true);
    const updated = [...yearResults] as YearResult[];
    while (updated.length < years) {
      updated.push(rand() < aep ? "hit" : "miss");
    }
    setYearResults(updated);
    setHorizonEverCompleted(true);
    setFutures((prev) => [updated.includes("hit"), ...prev].slice(0, 40));
    window.setTimeout(() => setSpinning(false), 450);
  }

  function startNewFuture() {
    setYearResults([]);
  }

  function simulateMany(n = 1000) {
    let count = 0;
    for (let r = 0; r < n; r++) {
      let hit = false;
      for (let y = 1; y <= years; y++) {
        if (rand() < aep) { hit = true; break; }
      }
      if (hit) count += 1;
    }
    const shown     = 40;
    const synthetic = Array.from({ length: shown }, (_, i) => i < Math.round((count / n) * shown));
    setFutures(synthetic.sort(() => rand() - 0.5));
  }

  function reset() {
    setYearResults([]);
    setFutures([]);
    setHorizonEverCompleted(false);
    setAri(100);
    setYears(30);
  }

  const futureRate = futures.length ? futures.filter(Boolean).length / futures.length : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white text-[#0b2948] font-sans flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#2e76bc] font-semibold mb-1">
                A Resilience Explorer<sup>®</sup> Game
              </p>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0b2948]">
                A "100-year" event is not on a 100-year timer.
              </h2>
              <p className="text-slate-600 mt-3 max-w-2xl leading-relaxed">
                Each year is an independent chance for the event to occur, whether it's a flood,
                earthquake, storm, or tsunami. A 100-year event means about a 1% chance each year.
                The right question isn't "when was the last one?" It's: how many chances accumulate
                over the life of this home, asset, or plan?
              </p>
            </div>
            <button
              onClick={reset}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-br-lg text-sm font-medium text-[#2e76bc] hover:bg-[#f3f8fe] transition-colors shrink-0"
              title="Reset everything"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* ── Compact pickers ── */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Return period */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Event size</p>
              <div className="flex flex-wrap gap-2">
                {RETURN_PERIODS.map((x) => (
                  <button
                    key={x}
                    onClick={() => { setAri(x); setYearResults([]); setFutures([]); setHorizonEverCompleted(false); }}
                    className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors duration-150 ${
                      ari === x
                        ? "bg-[#0b2948] text-white border-[#0b2948]"
                        : "bg-white hover:bg-[#f3f8fe] border-slate-200 text-[#0b2948]"
                    }`}
                  >
                    {x}-year
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                <span className="font-semibold text-[#0b2948]">1 in {ari}</span>
                {" "}({pct(aep, ari >= 100 ? 2 : 1)}) chance each year
              </p>
            </div>

            {/* Horizon */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Decision timeframe</p>
              <div className="flex flex-wrap gap-2">
                {HORIZONS.map((h) => (
                  <button
                    key={h.years}
                    onClick={() => { setYears(h.years); setYearResults([]); setFutures([]); setHorizonEverCompleted(false); }}
                    className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors duration-150 ${
                      years === h.years
                        ? "bg-[#0b2948] text-white border-[#0b2948]"
                        : "bg-white hover:bg-[#f3f8fe] border-slate-200 text-[#0b2948]"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                <span className="font-semibold text-[#0b2948]">{horizon.decision}</span>
                {" — "}{horizon.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 3 + Futures: side-by-side once first future completes, else full width ── */}
      <div className={`grid gap-5 ${horizonEverCompleted ? "lg:grid-cols-2" : ""}`}>

        {/* Step 3 — timeline */}
        <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <p className="font-semibold text-[#0b2948]">Explore one possible future</p>
              <p className="text-sm text-slate-500 mt-1">
                Each box is one year. Red means the selected event (or larger) occurred. Grey means
                that year passed without the event occurring.
              </p>
            </div>
            <p className="text-sm text-slate-500 whitespace-nowrap shrink-0">
              {Math.min(yearResults.length, years)} / {years} years
            </p>
          </div>

          <Timeline yearResults={yearResults} years={years} />

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {horizonComplete ? (
              <button onClick={startNewFuture} className={btnPrimary}>
                Try another future
              </button>
            ) : (
              <>
                {/* Animated die */}
                {(() => {
                  const DieIcon = DICE_ICONS[dieFace];
                  return (
                    <motion.div
                      animate={spinning ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.4 }}
                      className="h-9 w-9 rounded-lg bg-[#f3f8fe] border border-[#2e76bc]/20 flex items-center justify-center shrink-0"
                    >
                      <DieIcon className="h-5 w-5 text-[#2e76bc]" />
                    </motion.div>
                  );
                })()}
                <button onClick={spinOneYear} className={btnPrimary}>
                  Roll year {currentYear}
                </button>
                <button onClick={runRemainingYears} className={btnOutline}>
                  Roll remaining years
                </button>
              </>
            )}
          </div>

          <AnimatePresence>
            {eventYears.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-700 mt-4"
              >
                This simulated future has an event in year
                {eventYears.length > 1 ? "s" : ""} {eventYears.join(", ")}. Multiple events can
                occur inside the same decision timeframe.
              </motion.p>
            )}
            {horizonComplete && eventYears.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-700 mt-4"
              >
                This simulated future had no event. That can happen even when the long-term
                probability is substantial.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Futures grid — appears once first horizon is complete */}
        {horizonEverCompleted && (
          <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#f3f8fe] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-[#2e76bc]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0b2948]">How different futures compare</h3>
                <p className="text-sm text-slate-500">
                  Each square represents one complete {years}-year future.
                </p>
              </div>
            </div>

            {futures.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
                Complete the timeline or simulate 1,000 futures at once to see how outcomes vary across
                repeated {years}-year periods.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    The timeline shows one possible {years}-year future. The same return period can produce
                    many different outcomes: some experience at least one event, others do not.
                  </p>
                </div>

                <div className="grid grid-cols-10 gap-1 mb-4">
                  {futures.map((hit, i) => (
                    <div
                      key={i}
                      title={`Future ${i + 1}: ${hit ? "at least one event occurred" : "no event occurred"}`}
                      className={`h-7 rounded border ${
                        hit ? "bg-red-600 border-red-700" : "bg-slate-200 border-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-red-600" />
                    <span>At least one event occurred</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-slate-300" />
                    <span>No event occurred</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {`${pct(futureRate!, 0)} of the displayed futures experienced at least one event during the selected timeframe. The theoretical probability is ${pct(cumulative, 1)}.`}
                </p>
              </>
            )}

            <button onClick={() => simulateMany(1000)} className={btnOutline}>
              Compare many futures
            </button>
          </div>
        )}
      </div>

      {/* ── Stats panel — below simulation ── */}
      <div className="rounded-xl bg-[#0b2948] text-white p-5 overflow-hidden relative">
        <motion.div
          animate={spinning ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-[#62cadd]/20"
        />
        <div className="relative grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">One yearly chance</p>
            <p className="text-3xl font-semibold">1 in {ari}</p>
            <p className="text-white/50 text-sm mt-0.5">{pct(aep, ari >= 100 ? 2 : 1)} per year</p>
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Over {years} years</p>
            <p className="text-3xl font-semibold">{toFrequency(cumulative)}</p>
            <p className="text-white/50 text-sm mt-0.5">{pct(cumulative, 1)} chance of at least one event</p>
            {comparatorText(cumulative) && (
              <p className="text-[#62cadd] text-xs mt-2">{comparatorText(cumulative)}</p>
            )}
          </div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Plain-language label</p>
            <p className="text-3xl font-semibold">{label}</p>
            <p className="text-white/50 text-sm mt-0.5">for {horizon.decision.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* ── Full-width info panel at the bottom ── */}
      <div className="rounded-2xl border border-[#2e76bc]/20 bg-[#f3f8fe]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#2e76bc] mt-0.5 shrink-0" />
            <div className="w-full">
              <h3 className="font-semibold text-[#0b2948]">What this is teaching</h3>

              <div className="mt-4 rounded-xl bg-white border border-[#2e76bc]/15 p-4">
                <p className="text-sm font-semibold text-[#0b2948] mb-1">Why is it called a "1-in-100-year" event?</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The name comes from the <strong>Average Recurrence Interval (ARI)</strong>: the average time between
                  events of that size over a very long record. A 100-year ARI means that, on average, an event of this
                  magnitude occurs once every 100 years. But "average" is doing a lot of work here. The term is widely
                  used, but it's essentially a misnomer: it implies the event is scheduled to arrive once per century,
                  when in reality each year is an independent draw with a fixed probability. Scientists and engineers
                  increasingly prefer <strong>Annual Exceedance Probability (AEP)</strong>, the chance that the event
                  is equalled or exceeded in any given year, precisely because it doesn't invite that misreading.
                  A 100-year ARI event has a 1% AEP.
                </p>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-[#0b2948] mb-1">The annual frame is the wrong lens</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A return period describes average frequency, not a schedule. A "1-in-100-year" event
                    has a 1% chance every year, independently. It can happen twice in a decade, or not at
                    all for 200 years. The annual probability systematically understates the risk people
                    actually face, because most decisions span decades, not a single year.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0b2948] mb-1">The decision-timeframe is the right question</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A 1% annual chance becomes a 26% chance over a 30-year mortgage (roughly 1 in 4).
                    Over a 50-year infrastructure asset life, it's nearly 40%. Framing risk in terms
                    of the decision at hand, e.g. a home, an election cycle, an asset's design life, makes the number
                    meaningful.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0b2948] mb-1">Why numbers, and why frequencies</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Research by Peters et al. (2025) finds that while experts tend to communicate risk
                    using verbal labels ("unlikely", "rare"), people prefer to <em>receive</em> numbers
                    and they understand them better when expressed as frequencies ("1 in 4") rather than
                    percentages ("26%"). Numbers build trust, improve comprehension, and are more likely
                    to prompt appropriate action than vague language alone.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0b2948] mb-1">Qualitative labels and hazard types</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The likelihood labels (Virtually certain, Very likely, Likely, etc.) follow the IPCC
                    framework. They describe the cumulative probability over the selected timeframe, not the annual probability.
                    This tool applies to any hazard expressed as a return period or AEP: floods,
                    earthquakes, storms, tsunamis, wind events, and others.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-semibold text-[#0b2948] mb-1">Return periods are based on the past, but the future is changing</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Return periods are derived from historical records: stream gauge data, rainfall observations,
                    tide gauges, or earthquake catalogues. They assume the past is a reliable guide to the future.
                    Climate change is eroding that assumption. For many hazards, particularly flooding, extreme
                    rainfall, and coastal inundation, events that were once genuinely rare are becoming more
                    frequent. A flood labelled "1-in-100-year" today may effectively behave as a 1-in-50-year
                    event by mid-century. Return period estimates should be treated as a baseline, not a fixed
                    truth, and reviewed as climate projections are updated.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#2e76bc]/10 flex items-center gap-2 text-sm text-[#2e76bc]">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>
                  Formula: 1 − (1 − AEP)<sup>years</sup>, where AEP = 1 − e<sup>−1/ARI</sup>
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2e76bc]/10">
                <p className="text-xs font-semibold text-[#0b2948] uppercase tracking-wide mb-3">Read more</p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://www.tandfonline.com/doi/full/10.1080/13669877.2025.2512082"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2e76bc] hover:text-[#0b2948] hover:underline transition-colors"
                    >
                      Peters et al. (2025). The power of numbers in natural hazard communication. <i>Journal of Risk Research</i>.
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <a
                      href="https://api.resilience-explorer.com/auth/login?return_path=%2Fapp%2Fguide%2Ffundamentals%2Fhazards-and-stressors%2Funderstanding-return-periods-and-ae-ps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2e76bc] hover:text-[#0b2948] hover:underline transition-colors"
                    >
                      Understanding return periods and AEPs
                    </a>
                    <span className="text-xs text-slate-400 mt-0.5 shrink-0">Resilience Explorer® subscribers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <a
                      href="https://api.resilience-explorer.com/auth/login?return_path=%2Fapp%2Fguide%2Finsights%2Fresearch-and-methods%2Fwhy-numbers-matter-in-hazard-communication"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2e76bc] hover:text-[#0b2948] hover:underline transition-colors"
                    >
                      Why numbers matter in hazard communication
                    </a>
                    <span className="text-xs text-slate-400 mt-0.5 shrink-0">Resilience Explorer® subscribers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
