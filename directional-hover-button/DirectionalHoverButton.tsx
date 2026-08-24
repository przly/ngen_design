import { type MouseEvent } from "react";
import { motion, useMotionValue, animate, type Transition } from "motion/react";

type DirectionalHoverButtonVariant = "default" | "dropdown";
type Side = "left" | "right";

type DirectionalHoverButtonProps = {
  text?: string;
  variant?: DirectionalHoverButtonVariant;
  href?: string;
  onClick?: () => void;
};

// Matches the Figma prototype interaction: Smart Animate, "Slow" spring, 120ms.
const HOVER_SPRING: Transition = { type: "spring", duration: 0.12, bounce: 0 };

// px offset used to rest the pill fully off-canvas before first hover.
// Overflow-hidden on the button clips it, so the exact value only needs to
// exceed any realistic button width.
const INITIAL_OFFSCREEN = 1000;

// Only the horizontal entry point decides the side — clientY is intentionally
// ignored, so approaching from directly above/below still resolves left/right
// based on which half of the button's width the cursor first lands on.
function cursorSide(event: MouseEvent<HTMLElement>): Side {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX - rect.left < rect.width / 2 ? "left" : "right";
}

export default function DirectionalHoverButton({
  text = "Button",
  variant = "default",
  href,
  onClick,
}: DirectionalHoverButtonProps) {
  const pillX = useMotionValue(-INITIAL_OFFSCREEN);
  const chevronRotate = useMotionValue(0);
  const isDropdown = variant === "dropdown";
  const sharedClassName = `relative isolate flex items-center justify-center gap-1.5 overflow-hidden rounded-full py-3 ${
    isDropdown ? "pl-5 pr-4" : "px-5"
  }`;

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const enteredFrom = cursorSide(event);
    // MotionValue.set() applies synchronously, so the spring below always
    // starts from exactly where the cursor entered — no race with a
    // previous animation, no dependency on the pill's prior resting side.
    pillX.set(enteredFrom === "left" ? -rect.width : rect.width);
    animate(pillX, 0, HOVER_SPRING);
    if (isDropdown) animate(chevronRotate, 180, HOVER_SPRING);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const exitedTo = cursorSide(event);
    animate(pillX, exitedTo === "left" ? -rect.width : rect.width, HOVER_SPRING);
    if (isDropdown) animate(chevronRotate, 0, HOVER_SPRING);
  };

  const content = (
    <>
      <motion.span
        className="absolute inset-0 -z-10 rounded-full bg-[var(--ngen-grayscale-50)]"
        style={{ x: pillX }}
      />
      <span className="whitespace-nowrap text-sm leading-[1.5] text-[var(--ngen-grayscale-500)]">
        {text}
      </span>
      {isDropdown && (
        <motion.span
          className="icon-symbol text-sm text-[var(--ngen-grayscale-500)]"
          style={{ rotate: chevronRotate }}
        >
          keyboard_arrow_down
        </motion.span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={sharedClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={sharedClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </button>
  );
}
