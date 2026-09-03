import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type HeroStep = {
  index: string;
  label: string;
};

const HERO_STEPS: HeroStep[] = [
  { index: "01", label: "For home" },
  { index: "02", label: "For Business" },
  { index: "03", label: "for Asset owners" },
];

// Keep in sync with --hero-progress-dur in index.css.
const STEP_DURATION_MS = 4000;

// Apple's default critically-damped UI spring (damping 1.0, response ~0.3s) —
// used to materialize the button/progress fill in and out as the timer
// hands off between cards, rather than a hard cut.
const SWITCH_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

export default function HeroCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % HERO_STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  // Reduced motion keeps the opacity crossfade but drops the scale, per
  // apple-design's "gentler equivalent, not no feedback" guidance.
  const switchTransition = prefersReducedMotion
    ? { duration: 0.15, ease: "easeOut" as const }
    : SWITCH_SPRING;

  return (
    <div className="flex w-3/4 items-center gap-[10px]">
      {HERO_STEPS.map((step, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={step.index}
            className={`@container relative flex min-w-0 flex-1 items-center gap-2.5 rounded-lg bg-white/10 py-3 pl-6 pr-5 backdrop-blur-md ${
              isActive
                ? ""
                : "cursor-pointer transition-transform duration-100 ease-out hover:bg-white/15 active:scale-[0.97]"
            }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  key="progress"
                  className="t-hero-progress absolute inset-y-0 left-0 rounded-lg bg-white/20"
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
            <div className="relative flex min-w-0 flex-1 items-center gap-1.5 py-[7px]">
              <div className="eyebrow flex min-w-0 flex-1 flex-col gap-1.5 text-xs leading-none">
                <p
                  className={`truncate transition-colors duration-300 ease-out ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {step.index}
                </p>
                <p
                  className={`truncate transition-colors duration-300 ease-out ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                {isActive ? (
                  <motion.button
                    key="explore"
                    type="button"
                    initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 }}
                    transition={switchTransition}
                    whileTap={{ scale: 0.97, transition: { duration: 0.1, ease: "easeOut" } }}
                    className="flex size-7 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--ngen-green-400)] bg-[var(--ngen-green-600)] p-0 text-xs text-[var(--ngen-grayscale-900)] @[180px]:size-auto @[180px]:px-2.5 @[180px]:py-1.5"
                  >
                    <span className="hidden leading-[1.5] @[180px]:inline">
                      Explore
                    </span>
                    <span className="icon-symbol text-xs leading-none">
                      chevron_right
                    </span>
                  </motion.button>
                ) : (
                  <div key="spacer" className="size-[14px] shrink-0" />
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
