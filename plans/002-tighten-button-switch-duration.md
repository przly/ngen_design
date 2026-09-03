# 002 — Tighten the Explore button's materialize duration to 200ms

- **Status**: DONE
- **Commit**: 16ecfe8
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 1 file, 1-line change

## Problem

`src/components/HeroCards.tsx:21` defines the spring used to materialize the Explore button in and out as the active card advances:

```tsx
// src/components/HeroCards.tsx:18-21 — current
// Apple's default critically-damped UI spring (damping 1.0, response ~0.3s) —
// used to materialize the button/progress fill in and out as the timer
// hands off between cards, rather than a hard cut.
const SWITCH_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;
```

This spring is used for the button's enter/exit transition at `src/components/HeroCards.tsx:88`:

```tsx
// src/components/HeroCards.tsx:81-90 — current, for context (do not change)
<motion.button
  key="explore"
  type="button"
  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 }}
  transition={switchTransition}
  whileTap={{ scale: 0.97, transition: { duration: 0.1, ease: "easeOut" } }}
  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--ngen-green-400)] bg-[var(--ngen-green-600)] px-2.5 py-1.5 text-xs text-[var(--ngen-grayscale-900)]"
>
```

Per `AUDIT.md`'s duration budget table, a 300ms transition sits at the very top of the UI ceiling ("UI animations stay under 300ms"). This green pill is small — closer in scale and role to AUDIT's "Tooltips, small popovers" bucket (125–200ms) than to a modal or drawer. 300ms reads as slightly languid for an element this size.

## Target

```tsx
/* target */
// Apple's default critically-damped UI spring (damping 1.0, response ~0.2s) —
// used to materialize the button/progress fill in and out as the timer
// hands off between cards, rather than a hard cut. Tightened to 200ms to
// match AUDIT.md's "tooltips, small popovers" duration bucket (125-200ms)
// — this pill is closer in scale to that than to a modal/drawer.
const SWITCH_SPRING = { type: "spring", bounce: 0, duration: 0.2 } as const;
```

Only the `duration` value changes (`0.3` → `0.2`); `bounce: 0` stays as-is (this is a timer-driven auto-advance, not a gesture — no momentum to express as overshoot, consistent with this repo's existing spring conventions in `src/components/NavLink.tsx:38-40`).

## Repo conventions to follow

- Spring configs in this repo use the `{ type: "spring", duration, bounce }` shape, not raw `stiffness`/`damping`/`mass` — see `src/components/NavLink.tsx:36-41` (`getHoverSpring`) for the exemplar. This plan's target keeps that exact shape.
- Comments above duration constants in this repo explain *why* the value was chosen (see `src/components/DropdownNav.tsx:16-38` for the pattern of documenting each duration's rationale inline). The target above updates the existing comment to explain the new value rather than leaving a stale comment.

## Steps

1. In `src/components/HeroCards.tsx`, replace the `SWITCH_SPRING` constant declaration (currently at line 21) and its preceding comment (lines 18-20) with the target block shown above — i.e. change `duration: 0.3` to `duration: 0.2` and update the comment to match the "Target" section verbatim.
2. Do not change `switchTransition`, the reduced-motion branch (`{ duration: 0.15, ease: "easeOut" as const }` at line 37), the progress-bar fade duration (`0.15` at line 59), or the `whileTap` duration (`0.1` at line 89) — none of those are in scope for this plan.

## Boundaries

- Do NOT touch `src/index.css`, `src/pages/HeroCardsDemo.tsx`, or any other component.
- Do NOT change `bounce`, the reduced-motion transition, the progress-bar transition, or the `whileTap` transition.
- Do NOT add new dependencies.
- If `SWITCH_SPRING` does not match the current-code excerpt above (drift since commit `16ecfe8`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd "/Users/nejcprezelj/Documents/Work/NGEN/NGEN - Design Engineering" && npx tsc -b --noEmit` — expect no output (clean pass).
- **Feel check**: Start the dev server (`pnpm dev`), open `http://localhost:5173/hero-cards`, and watch a card transition (wait for the 4s auto-advance, or temporarily lower `STEP_DURATION_MS` locally while testing — do not commit that change):
  - The Explore button should still fade/scale in and out smoothly with no snap or pop, just noticeably quicker than before.
  - In DevTools Animations panel, set playback to 10% and confirm the button's opacity/scale animation completes in a visibly shorter window than the progress-bar's 4-second fill, and that it still eases out smoothly (no discontinuity at the end).
  - Toggle `prefers-reduced-motion: reduce` and confirm the reduced-motion path (150ms opacity-only fade) is unaffected — it does not read `SWITCH_SPRING` at all, so this should already be true; use this as a check that no unrelated line was touched.
- **Done when**: `SWITCH_SPRING`'s `duration` field reads `0.2`, `bounce` remains `0`, and the type-check passes clean.
