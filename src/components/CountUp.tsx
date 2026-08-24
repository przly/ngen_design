import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

type CountUpProps = {
  target: number;
  durationSeconds?: number;
  className?: string;
};

export default function CountUp({
  target,
  durationSeconds = 1,
  className,
}: CountUpProps) {
  const digits = String(target).length;
  const [display, setDisplay] = useState("0".repeat(digits));
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(String(target).padStart(digits, "0"));
      return;
    }
    const controls = animate(0, target, {
      duration: durationSeconds,
      // Cubic ease-out (Robert Penner's easeOutCubic / cubic-bezier(0.33, 1, 0.68, 1)).
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (value) => {
        setDisplay(String(Math.round(value)).padStart(digits, "0"));
      },
    });
    return () => controls.stop();
  }, [target, durationSeconds, digits, prefersReducedMotion]);

  return (
    <span className={`tabular-nums ${className ?? ""}`}>{display}</span>
  );
}
