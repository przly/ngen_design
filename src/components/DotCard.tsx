import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { useAnimationSpeed } from "../context/AnimationSpeedContext";

type DotCardProps = {
  id: string;
  title: string;
  body: string;
  // 1 when the segmented control moved to a later option, -1 when it moved
  // to an earlier one. Applied in reverse below: the card deliberately
  // slides opposite to the control's own movement (old content exits in
  // the direction the pill just moved from), so it reads as content being
  // pulled in behind the selection rather than following it.
  direction: 1 | -1;
};

// transitions-dev "Page side-by-side" (08-page-side-by-side.md) values —
// content slides opposite to the direction the segmented control moved,
// instead of a plain in-place swap, so the card reads as following the
// selection rather than just refreshing.
//
// AnimatePresence mode="wait" below runs the exit then the enter in
// sequence, not concurrently, so the full swap takes 2x this duration —
// half SegmentedControl's own 250ms pill sweep (SegmentedControl.tsx's
// BASE_DURATION) so the two finish together instead of the card lagging
// a full extra beat behind the pill.
const SWAP_DURATION = 0.125;
const SWAP_DISTANCE = 8;
const SWAP_BLUR = 3;
const SWAP_EASE = [0.22, 1, 0.36, 1] as const;

const variants = {
  initial: (dir: 1 | -1) => ({ opacity: 0, x: dir * -SWAP_DISTANCE, filter: `blur(${SWAP_BLUR}px)` }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * SWAP_DISTANCE, filter: `blur(${SWAP_BLUR}px)` }),
};

// figma.com/design/VWjclS7vZ6lhThOO3c38Ta?node-id=5401-19797 ("Dot Card")
export default function DotCard({ id, title, body, direction }: DotCardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const speed = useAnimationSpeed();

  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: SWAP_DURATION / speed, ease: SWAP_EASE };

  return (
    <div className="flex w-full items-center gap-12 overflow-hidden rounded-xl border-[0.5px] border-solid border-[var(--color-gray-100)] bg-white p-12">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.p
          key={`title-${id}`}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="shrink-0 whitespace-nowrap text-[30px] font-medium leading-none tracking-[-0.9px] text-[var(--color-gray-900)]"
        >
          {title}
        </motion.p>
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.p
          key={`body-${id}`}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="w-[295px] shrink-0 text-base leading-[1.5] text-[var(--color-gray-500)]"
        >
          {body}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
