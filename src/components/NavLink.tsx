import { useEffect, useRef, type MouseEvent, type Ref } from "react";
import { motion, useMotionValue, useReducedMotion, animate, type Transition } from "motion/react";
import { useAnimationSpeed } from "../context/AnimationSpeedContext";

type NavLinkVariant = "default" | "dropdown";
type Side = "left" | "right";

type NavLinkProps = {
  text?: string;
  variant?: NavLinkVariant;
  href?: string;
  onClick?: () => void;
  onFocus?: () => void;
  id?: string;
  // Whether this trigger's dropdown panel is currently open — drives both
  // aria-expanded and the pill/chevron "opened" treatment, so the trigger
  // stays visually open for as long as the panel is, even after the cursor
  // has moved off the button and onto the panel itself.
  isOpen?: boolean;
  ariaControls?: string;
  // Debug aid: runs hover animations at 1/10th speed (1.2s instead of
  // 120ms) so the slide direction and easing can be verified frame-by-frame.
  slowMotion?: boolean;
};

const SLOW_MOTION_FACTOR = 10;
// Matches the Figma prototype interaction: Smart Animate, "Slow" spring, 120ms.
const BASE_HOVER_DURATION = 0.12;

function getHoverSpring(slowMotion: boolean, reducedMotion: boolean, speedMultiplier: number): Transition {
  // Reduced motion keeps the hover feedback (it aids comprehension of which
  // link is active) but drops the slide — the pill just snaps into place.
  if (reducedMotion) return { duration: 0 };
  const baseDuration = slowMotion
    ? BASE_HOVER_DURATION * SLOW_MOTION_FACTOR
    : BASE_HOVER_DURATION;
  return {
    type: "spring",
    duration: baseDuration / speedMultiplier,
    bounce: 0,
  };
}
// px offset used to rest the pill fully off-canvas before first hover.
// Overflow-hidden on the button clips it, so the exact value only needs to
// exceed any realistic button width.
const INITIAL_OFFSCREEN = 1000;

// Only the horizontal entry point decides the side — clientY is intentionally
// ignored, so approaching from directly above/below still resolves left/right
// based on which half of the button's width the cursor first lands on.
// Takes the already-measured rect rather than re-measuring, so callers that
// also need the rect for other purposes only pay for one layout read.
function cursorSide(clientX: number, rect: DOMRect): Side {
  return clientX - rect.left < rect.width / 2 ? "left" : "right";
}

export default function NavLink({
  text = "Button",
  variant = "default",
  href,
  onClick,
  onFocus,
  id,
  isOpen,
  ariaControls,
  slowMotion = false,
}: NavLinkProps) {
  const pillX = useMotionValue(-INITIAL_OFFSCREEN);
  const chevronRotate = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const speed = useAnimationSpeed();
  const isDropdown = variant === "dropdown";
  const sharedClassName = `relative isolate flex items-center justify-center gap-1.5 overflow-hidden rounded-full py-3 ${
    isDropdown ? "pl-5 pr-4" : "px-5"
  }`;

  const elementRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  // Mouse-leave shouldn't revert the pill while the dropdown is still open
  // (the cursor is on its way to the panel below); these track enough state
  // for the isOpen effect to close it correctly once the panel actually does.
  const isHoveringRef = useRef(false);
  const lastSideRef = useRef<Side>("left");
  const isFirstRenderRef = useRef(true);

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const enteredFrom = cursorSide(event.clientX, rect);
    isHoveringRef.current = true;
    lastSideRef.current = enteredFrom;
    const spring = getHoverSpring(slowMotion, prefersReducedMotion, speed);
    // MotionValue.set() applies synchronously, so the spring below always
    // starts from exactly where the cursor entered — no race with a
    // previous animation, no dependency on the pill's prior resting side.
    pillX.set(enteredFrom === "left" ? -rect.width : rect.width);
    animate(pillX, 0, spring);
    if (isDropdown) animate(chevronRotate, 180, spring);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const exitedTo = cursorSide(event.clientX, rect);
    isHoveringRef.current = false;
    lastSideRef.current = exitedTo;
    // The dropdown is still open (cursor is headed for the panel, not away
    // from it) — keep the trigger's opened treatment; the isOpen effect
    // below closes it once the panel itself actually closes.
    if (isDropdown && isOpen) return;
    const spring = getHoverSpring(slowMotion, prefersReducedMotion, speed);
    animate(pillX, exitedTo === "left" ? -rect.width : rect.width, spring);
    if (isDropdown) animate(chevronRotate, 0, spring);
  };

  // Syncs the pill/chevron to isOpen for the cases mouse events alone can't
  // cover: opening via keyboard focus, and closing after the cursor has
  // already left the button (e.g. the panel's own close-on-mouseleave timer
  // elapsing while the cursor sits over the panel or elsewhere).
  useEffect(() => {
    if (!isDropdown) return;
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const spring = getHoverSpring(slowMotion, prefersReducedMotion, speed);
    if (isOpen) {
      animate(pillX, 0, spring);
      animate(chevronRotate, 180, spring);
    } else if (!isHoveringRef.current) {
      const width = elementRef.current?.getBoundingClientRect().width ?? INITIAL_OFFSCREEN;
      animate(pillX, lastSideRef.current === "left" ? -width : width, spring);
      animate(chevronRotate, 0, spring);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // href="#" is a placeholder for dropdown triggers with no real destination
  // yet — without this, clicking one jumps the page to the top.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === "#") event.preventDefault();
    onClick?.();
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
        ref={elementRef as Ref<HTMLAnchorElement>}
        href={href}
        id={id}
        onClick={handleClick}
        onFocus={onFocus}
        className={sharedClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-haspopup={isDropdown ? "true" : undefined}
        aria-expanded={isDropdown ? isOpen : undefined}
        aria-controls={isDropdown ? ariaControls : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={elementRef as Ref<HTMLButtonElement>}
      type="button"
      id={id}
      onClick={onClick}
      onFocus={onFocus}
      className={sharedClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-haspopup={isDropdown ? "true" : undefined}
      aria-expanded={isDropdown ? isOpen : undefined}
      aria-controls={isDropdown ? ariaControls : undefined}
    >
      {content}
    </button>
  );
}
