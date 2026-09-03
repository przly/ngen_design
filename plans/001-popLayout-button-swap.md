# 001 — Add `mode="popLayout"` to the Explore button/spacer AnimatePresence

- **Status**: DONE
- **Commit**: 16ecfe8
- **Severity**: HIGH
- **Category**: Performance / Interruptibility
- **Estimated scope**: 1 file, 1-line change

## Problem

`src/components/HeroCards.tsx` has a `HERO_STEPS.map` that renders each card. Inside each card, when a step is active it renders a `<motion.button>` (the green "Explore" pill); when inactive it renders a plain `<div key="spacer" className="size-[14px] shrink-0" />`. These two are swapped via `AnimatePresence` in default mode:

```tsx
// src/components/HeroCards.tsx:80-100 — current
<AnimatePresence initial={false}>
  {isActive ? (
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
      <span className="leading-[1.5]">Explore</span>
      <span className="icon-symbol text-xs leading-none">
        chevron_right
      </span>
    </motion.button>
  ) : (
    <div key="spacer" className="size-[14px] shrink-0" />
  )}
</AnimatePresence>
```

This `AnimatePresence` sits inside the "Text Container" flex row:

```tsx
// src/components/HeroCards.tsx:63-65 — current, for context (do not change)
<div className="relative flex flex-1 items-center gap-1.5 py-[7px]">
  <div className="eyebrow flex flex-1 flex-col gap-1.5 text-xs leading-none">
    {/* step index + label */}
  </div>
  {/* AnimatePresence block above lives here, as the second flex child */}
</div>
```

In Framer Motion's default `AnimatePresence` mode, the exiting child (e.g. the button, fading out over ~300ms) stays in normal document flow *at the same time* the new child (the spacer) mounts. For that ~300ms window the flex row has **3** children instead of 2 (eyebrow text + exiting button + entering spacer), and the `flex-1` eyebrow text column is squeezed by the extra sibling.

Measured live in a real browser (card 01, active → inactive transition): the eyebrow column's width goes **175px → 155px** (squeezed mid-transition, 3 flex children present) **→ 243px** (snaps to its true final width once the exiting button is removed from the DOM). This is a layout thrash riding along on what should be a pure opacity/scale transition — the text container visibly narrows then snaps wider instead of smoothly reaching its final width. The same happens in reverse (inactive → active).

## Target

```tsx
/* target — only the AnimatePresence opening tag changes */
<AnimatePresence initial={false} mode="popLayout">
  {isActive ? (
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
      <span className="leading-[1.5]">Explore</span>
      <span className="icon-symbol text-xs leading-none">
        chevron_right
      </span>
    </motion.button>
  ) : (
    <div key="spacer" className="size-[14px] shrink-0" />
  )}
</AnimatePresence>
```

`mode="popLayout"` makes Framer Motion take the exiting element out of normal flow (`position: absolute`, positioned relative to the nearest positioned ancestor) as soon as it starts exiting, so the incoming element can immediately occupy its final flex position while the exiting one fades out visually on top. No double-counted flex child, no squeeze-then-snap.

This requires a `position: relative` (or similar) ancestor for the absolute positioning to resolve against sensibly. That ancestor already exists and needs no change — `src/components/HeroCards.tsx:63`:

```tsx
<div className="relative flex flex-1 items-center gap-1.5 py-[7px]">
```

## Repo conventions to follow

- This file already uses `AnimatePresence` twice: once here (button/spacer swap) and once for the progress-bar fill (`src/components/HeroCards.tsx:53-62`, `<AnimatePresence>{isActive && (<motion.div key="progress" ... exit={{ opacity: 0 }} ... />)}`). Do not touch the progress-bar `AnimatePresence` — it only ever has a single child (no sibling-swap), so `popLayout` is not relevant there and must not be added to it.
- `src/components/DropdownNav.tsx` is the other place in this repo that swaps `AnimatePresence` children (`mode="popLayout"` is not currently used anywhere in the repo — this plan introduces the first use of it). Match its existing indentation/prop-ordering style: `initial`, `mode` (new), then children as-is.

## Steps

1. In `src/components/HeroCards.tsx`, find the line:
   ```tsx
   <AnimatePresence initial={false}>
   ```
   (this is the *second* `AnimatePresence` in the file — the one wrapping the `isActive ? <motion.button>... : <div key="spacer">` block, not the first one wrapping the progress bar). Change it to:
   ```tsx
   <AnimatePresence initial={false} mode="popLayout">
   ```
2. Do not change anything else in the file — no other props, no structural changes, no changes to the progress-bar `AnimatePresence`.

## Boundaries

- Do NOT touch `src/index.css`, `src/pages/HeroCardsDemo.tsx`, or any other component.
- Do NOT change the progress-bar `AnimatePresence` block (`HeroCards.tsx:53-62`).
- Do NOT change markup/structure, spring values, durations, or class names — this is a single prop addition.
- Do NOT add new dependencies (`mode="popLayout"` is built into the `motion` package already installed).
- If the `AnimatePresence` wrapping the button/spacer block does not match the current-code excerpt above (drift since commit `16ecfe8`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd "/Users/nejcprezelj/Documents/Work/NGEN/NGEN - Design Engineering" && npx tsc -b --noEmit` — expect no output (clean pass, same as before the change).
- **Feel check**: Start the dev server (`pnpm dev`), open `http://localhost:5173/hero-cards`, and either wait for the automatic 4s timer to advance or (for a faster check) temporarily note the active card transition:
  - Watch the eyebrow text column (e.g. "02 / FOR BUSINESS") as its card goes from active → inactive. The text column should widen smoothly to its final size with no visible squeeze/flicker beforehand.
  - In DevTools, open the Elements panel, select the "Text Container" div (`class="relative flex flex-1 items-center gap-1.5 py-[7px]"`) for the card that is mid-transition, and confirm it never shows 3 children at once — only the eyebrow-text div plus exactly one of {button, spacer} in the DOM tree at a time (the exiting one should show `position: absolute` in the Styles pane while animating out).
  - In DevTools Rendering panel, enable "Paint flashing" and confirm no unexpected repaint of the eyebrow text column during the button fade.
  - Toggle `prefers-reduced-motion: reduce` (DevTools Rendering panel) and re-run the transition: the crossfade should still happen (opacity only, no scale) and still show no layout squeeze.
- **Done when**: the eyebrow text column's `getBoundingClientRect().width` changes monotonically from its active-state width directly to its inactive-state width (or vice versa) with no intermediate narrower value, verifiable via the same rAF-polling technique used to find this bug:
  ```js
  // paste in DevTools console on /hero-cards, then trigger a transition
  const row = document.querySelector(".flex.w-3\\/4");
  const card = row.children[0];
  const eyebrow = card.querySelector(".eyebrow");
  let last = null;
  function tick() {
    const w = Math.round(eyebrow.getBoundingClientRect().width);
    if (w !== last) { console.log(performance.now(), w); last = w; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  ```
  The logged width sequence should have at most one intermediate step directly between the two steady-state widths (from the flex-basis recalculation itself), never a value narrower than both endpoints.
