"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { scoreColor, scoreLabel } from "@/lib/score";

export function ScoreGauge({ score, size = 164 }: { score: number; size?: number }) {
  const color = scoreColor(score);
  const r = (size / 2) * 0.8;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.067;
  const circumference = 2 * Math.PI * r;

  const reduceMotion = useReducedMotion();
  const numberRef = useRef<HTMLDivElement>(null);

  // The count-up is a one-off imperative animation synchronized to an
  // external clock (rAF), not derived render state — so it's driven
  // directly against the DOM via a ref rather than React state, which
  // sidesteps the "setState during effect" anti-pattern entirely.
  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    if (reduceMotion) {
      el.textContent = String(score);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      if (el) el.textContent = String(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, reduceMotion]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: reduceMotion ? 0 : 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div ref={numberRef} className="text-[2.5rem] font-black leading-none tracking-tight" style={{ color }}>
          0
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground/70">/ 100</div>
        <div className="mt-1 text-[0.7rem] font-bold" style={{ color }}>
          {scoreLabel(score)}
        </div>
      </div>
    </div>
  );
}
