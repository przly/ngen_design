import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import NavLink from "./NavLink";
import { useAnimationSpeed } from "../context/AnimationSpeedContext";

type DropdownNavItem = {
  text?: string;
  href?: string;
  content: ReactNode;
};

type DropdownNavProps = {
  items: DropdownNavItem[];
};

// Base durations (seconds) — divided by the animation-speed multiplier at
// render time, so a page can slow every transition below down uniformly
// (see AnimationSpeedContext) without changing the easing/distance tokens.
const BACKDROP_DURATION = 0.15;
const BACKDROP_EASE = "easeOut" as const;
// transitions-dev "menu dropdown" tokens: the panel grows from its trigger
// with an asymmetric open/close (slower, eased-out open; quicker close) and
// a subtle scale instead of a slide, so it reads as anchored to the nav.
const DROPDOWN_OPEN_DURATION = 0.25;
const DROPDOWN_CLOSE_DURATION = 0.15;
const DROPDOWN_EASE = [0.22, 1, 0.36, 1] as const;
const DROPDOWN_PRE_SCALE = 0.97;
const DROPDOWN_CLOSING_SCALE = 0.99;
const DROPDOWN_Y_OFFSET = 10;
// transitions-dev "text states swap" tokens, adapted to the horizontal axis:
// old content exits toward the direction the cursor came from, blurred;
// new content enters from the opposite side, blurred. 80ms ease-in-out
// (--duration-micro / --distance-micro — quicker and shorter than the
// default 150ms/8px so back-to-back trigger switches don't feel sluggish).
const CONTENT_SWAP_TRANSLATE_X = 32;
const CONTENT_SWAP_BLUR = "blur(4px)";
const CONTENT_SWAP_DURATION = 0.14;
const CONTENT_SWAP_EASE = "easeInOut" as const;
// How much the entering content's animation overlaps the exiting content's.
// 0 = enter starts the instant exit starts (full overlap, current behavior).
// A positive value (seconds) delays the enter so less of the two overlaps;
// set it >= the content-swap duration for no overlap at all (sequential).
const CONTENT_SWAP_ENTER_DELAY = 0;

type ContentSwapCustom = { direction: number; reducedMotion: boolean };

// direction: 1 when the cursor moved to a trigger further right, -1 for further left.
// reducedMotion drops the slide + blur but keeps the opacity crossfade, so
// the content swap still reads as a change without the position movement.
function getContentSwapVariants(transition: Transition) {
  return {
    enter: ({ direction, reducedMotion }: ContentSwapCustom) => ({
      opacity: 0,
      x: reducedMotion ? 0 : direction * CONTENT_SWAP_TRANSLATE_X,
      filter: reducedMotion ? "blur(0px)" : CONTENT_SWAP_BLUR,
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { ...transition, delay: CONTENT_SWAP_ENTER_DELAY },
    },
    exit: ({ direction, reducedMotion }: ContentSwapCustom) => ({
      opacity: 0,
      x: reducedMotion ? 0 : -direction * CONTENT_SWAP_TRANSLATE_X,
      filter: reducedMotion ? "blur(0px)" : CONTENT_SWAP_BLUR,
    }),
  };
}
// Grace period before closing on mouseleave, so a quick pass over the gap
// between trigger and panel doesn't flicker it shut.
const CLOSE_DELAY_MS = 100;

// Stable id linking every trigger's aria-controls to the single swapping
// panel, so screen readers announce the open/closed relationship correctly.
const PANEL_ID = "dropdown-nav-panel";

export default function DropdownNav({ items }: DropdownNavProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion() ?? false;
  // A page can slow every animation below down uniformly via
  // AnimationSpeedContext (defaults to 1, i.e. unaffected) — dividing each
  // base duration by it is what makes 0.5x/0.1x take 2x/10x as long.
  const speed = useAnimationSpeed();
  const backdropTransition: Transition = { duration: BACKDROP_DURATION / speed, ease: BACKDROP_EASE };
  const dropdownOpenTransition: Transition = { duration: DROPDOWN_OPEN_DURATION / speed, ease: DROPDOWN_EASE };
  const dropdownCloseTransition: Transition = { duration: DROPDOWN_CLOSE_DURATION / speed, ease: DROPDOWN_EASE };
  const contentSwapTransition: Transition = { duration: CONTENT_SWAP_DURATION / speed, ease: CONTENT_SWAP_EASE };
  const contentSwapVariants = getContentSwapVariants(contentSwapTransition);

  const cancelClose = () => clearTimeout(closeTimeout.current);

  // Switching between triggers while the group is still hovered goes through
  // here directly, never through scheduleClose — so the panel just swaps
  // content in place instead of closing and reopening. Direction is derived
  // from trigger order, which matches which way the cursor travelled.
  const activate = (index: number) => {
    cancelClose();
    if (activeIndex !== null && index !== activeIndex) {
      setDirection(index > activeIndex ? -1 : 1);
    }
    setActiveIndex(index);
  };

  const scheduleClose = () => {
    closeTimeout.current = setTimeout(() => setActiveIndex(null), CLOSE_DELAY_MS);
  };

  // Don't leak a pending close timer past unmount (e.g. navigating away
  // mid-hover).
  useEffect(() => cancelClose, []);

  // Fires when focus leaves the whole group (triggers + panel content) via
  // Tab — relatedTarget is the element about to receive focus, so this only
  // schedules a close when that target is outside the container. Tabbing
  // between a trigger and its panel's links keeps it open.
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      scheduleClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && activeIndex !== null) {
      cancelClose();
      setActiveIndex(null);
    }
  };

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <div
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onFocus={cancelClose}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative z-50"
            onMouseEnter={() => activate(index)}
          >
            <NavLink
              text={item.text}
              variant="dropdown"
              href={item.href}
              onFocus={() => activate(index)}
              isOpen={activeIndex === index}
              ariaControls={PANEL_ID}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          // pointer-events-none so the full-viewport backdrop never counts toward
          // this container's mouseenter/leave bounds — only the triggers + panel do.
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div
            id={PANEL_ID}
            role="region"
            aria-label={active.text}
            className="absolute left-1/2 top-full z-50 mt-2 h-[480px] w-[calc(100vw-20px)] overflow-hidden rounded-3xl bg-white p-3"
            style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
            // x holds the constant -50% horizontal centering (replaces the
            // Tailwind -translate-x-1/2 utility): Motion writes the whole
            // inline `transform` from its own x/y/scale values, so a
            // class-based transform on this element would just get
            // overwritten rather than composed with it. Keeping the offset
            // in x makes Motion the single owner of one `transform` string.
            initial={{
              opacity: 0,
              x: "-50%",
              scale: prefersReducedMotion ? 1 : DROPDOWN_PRE_SCALE,
              y: prefersReducedMotion ? 0 : -DROPDOWN_Y_OFFSET,
            }}
            animate={{
              opacity: 1,
              x: "-50%",
              scale: 1,
              y: 0,
              transition: dropdownOpenTransition,
            }}
            exit={{
              opacity: 0,
              x: "-50%",
              scale: prefersReducedMotion ? 1 : DROPDOWN_CLOSING_SCALE,
              y: prefersReducedMotion ? 0 : -DROPDOWN_Y_OFFSET,
              transition: dropdownCloseTransition,
            }}
          >
            {/* default (sync) mode lets the exiting and entering content overlap:
                old content slides/fades out while new content slides/fades in
                at the same time, instead of waiting for the exit to finish. */}
            <AnimatePresence
              initial={false}
              custom={{ direction, reducedMotion: prefersReducedMotion }}
            >
              <motion.div
                key={activeIndex}
                className="absolute inset-3"
                style={{ willChange: "transform, opacity, filter" }}
                custom={{ direction, reducedMotion: prefersReducedMotion }}
                variants={contentSwapVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={contentSwapTransition}
              >
                {active.content}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
