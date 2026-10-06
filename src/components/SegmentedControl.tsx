import { useId, useRef } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useAnimationSpeed } from "../context/AnimationSpeedContext";

export type SegmentedControlOption = {
  value: string;
  label: string;
};

type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
};

// Matches DotCard's swap-timing coordination (see DotCard.tsx's
// SWAP_DURATION comment) — 250ms base, divided by the shared
// AnimationSpeedContext like every other motion component here.
const BASE_DURATION = 0.25;

// Structure/behavior ported from ngen/170-1-ngen-spletna-stran's
// src/components/molecules/TabButtons/TabButtons.tsx (keyboard nav,
// scroll-into-view, badge + tab classes), CMS-only props stripped out.
// The sliding pill itself uses motion's layoutId instead of TabButtons'
// own offsetLeft/offsetWidth measuring, matching this project's other
// motion-driven components (DotCard, NavLink) and this component's own
// previous implementation.
export default function SegmentedControl({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const uid = useId();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const speed = useAnimationSpeed();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring", duration: BASE_DURATION / speed, bounce: 0 };

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const handleTabClick = (index: number) => {
    onChange(options[index].value);
    buttonRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = options.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case "ArrowLeft":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "ArrowRight":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    handleTabClick(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="overflow-auto rounded-xl border-[0.5px] border-gray-100 bg-white p-1 lg:overflow-hidden">
      <div className="relative flex w-max min-w-full gap-2" role="tablist" aria-label={ariaLabel} aria-orientation="horizontal">
        {options.map((option, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              className={`relative flex min-h-11 flex-auto shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg p-2 px-4 text-sm font-medium text-gray-900 transition-all duration-100 active:scale-[0.98] lg:min-h-12.5 lg:flex-1 lg:text-base ${
                !isActive ? "hover:bg-gray-50" : ""
              }`}
              type="button"
              key={option.value}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {isActive && (
                <motion.span
                  layoutId={`segmented-control-pill-${uid}`}
                  className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-green-600"
                  transition={transition}
                />
              )}
              <span className="relative z-10 mr-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                {index + 1}
              </span>
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
