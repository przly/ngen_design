import { motion, useReducedMotion } from "motion/react";
import CountUp from "./CountUp";

type Stat = {
  label: string;
  prefix?: string;
  value: number;
  suffix: string;
};

const stats: Stat[] = [
  {
    label: "Average project ROI*",
    prefix: "More than ",
    value: 10,
    suffix: "%",
  },
  {
    label: "Storage pipeline",
    value: 2,
    suffix: " GWh+",
  },
  {
    label: "Operated capacity",
    value: 200,
    suffix: "+ MWh",
  },
  {
    label: "Response for grid services",
    prefix: "Under ",
    value: 20,
    suffix: " ms",
  },
];

// Rare, first-view moment (a stat block seen once per page load), so it
// gets some of the delight budget: a 60ms stagger and a 500ms rise, both
// matching the transitions-dev "text reveal" tokens (--duration-very-slow,
// --distance-medium, and the strong ease-out curve from AUDIT.md).
const STATS_CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

function statRowVariants(reducedMotion: boolean) {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.2 : 0.5,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };
}

export default function StatsModule() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rowVariants = statRowVariants(prefersReducedMotion);

  return (
    <div className="flex w-full items-end bg-white px-6">
      <motion.div
        className="flex w-[727px] flex-col items-start gap-[200px]"
        variants={STATS_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={rowVariants}
            className="flex w-full flex-col items-start gap-8"
          >
            <div className="h-px w-full bg-[var(--ngen-grayscale-100)]" />
            <div className="flex w-full flex-col items-start gap-4">
              <p className="eyebrow w-full text-xs leading-none text-[var(--ngen-grayscale-500)]">
                {stat.label}
              </p>
              <p className="text-[60px] font-medium leading-none tracking-[-2.4px]">
                {stat.prefix && (
                  <span className="text-[var(--ngen-grayscale-500)]">
                    {stat.prefix}
                  </span>
                )}
                <span className="text-[var(--ngen-grayscale-900)]">
                  <CountUp target={stat.value} />
                  {stat.suffix}
                </span>
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
