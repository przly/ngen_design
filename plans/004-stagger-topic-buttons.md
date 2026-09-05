# 004 — Stagger the 6 topic buttons on reveal

- **Status**: DONE
- **Commit**: 9c84a62
- **Severity**: LOW
- **Category**: Cohesion & tokens / Missed opportunity
- **Estimated scope**: 2 files (`src/index.css`, `src/components/ContactForm.tsx`), no new dependencies

## Depends on

**Plan 003 must be applied first.** This plan edits the `.t-acc` topic-reveal block that 003 introduces (`SelectorButton` instances inside `<div className="t-acc w-full" data-open={Boolean(type)}>`). If 003 has not been applied, the code this plan targets won't exist yet — apply 003, verify it, then apply this plan.

## Problem

Once 003 is applied, the 6 topic buttons (`src/components/ContactForm.tsx`, inside the `.t-acc-panel-inner` topic grid) all become visible in one flat, simultaneous fade — there's no stagger, so a group of 6 distinct choices arrives as one undifferentiated block instead of reading as 6 individual options appearing in sequence. This is exactly the interaction the reveal is built around, and per this repo's own audit guidance a grouped entrance like this is where a 30–80ms stagger belongs.

Code this plan targets, `src/components/ContactForm.tsx` (post-003), the topic grid:

```tsx
                <div className="grid w-full grid-cols-3 gap-2.5" role="group" aria-label="Topic">
                  {TOPIC_OPTIONS.map((topic) => (
                    <SelectorButton
                      key={topic}
                      label={topic}
                      selected={topics.includes(topic)}
                      onClick={() => toggleTopic(topic)}
                    />
                  ))}
                </div>
```

`SelectorButton` itself (`src/components/ContactForm.tsx`, unchanged by 003):

```tsx
function SelectorButton({ label, selected, onClick, className }: SelectorButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border-[0.5px] py-2.5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] ${
        selected
          ? "border-transparent bg-white text-[var(--ngen-grayscale-900)]"
          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
      } ${className ?? ""}`}
    >
      {label}
    </button>
  );
}
```

Note `transition-transform` here is deliberate, not an oversight: hover and the selected-state color swap are intentionally instant (no `transition-colors`) per an explicit product decision on this component — do not add a color transition to "fix" that as part of this plan. The stagger below only ever touches `opacity`, never `transform` or color, so it cannot interfere with that decision or with the `active:scale-[0.98]` press feedback.

## Target

A new CSS class, `.t-stagger-item`, added to `src/index.css` right after the existing `.t-acc` block. It transitions `opacity` only (not `transform` — see Repo conventions below for why that specifically avoids a cascade conflict with `transition-transform`), with a per-position delay via `:nth-child`, active only while the ancestor `.t-acc` is open (so it fades in staggered but fades out together, uniformly, on close):

```css
/* target — insert into src/index.css after line 142 (the .t-acc-panel /
   .t-acc-panel-inner reduced-motion block), before the "Hero progress bar
   fill" comment */

/* Per-item entrance stagger for content inside a .t-acc panel (e.g. a
   button grid) — opacity only, so it layers on top of a button's own
   transition-transform (press feedback) without a transition-property
   cascade conflict. Delay only applies while the ancestor .t-acc is open,
   so items fade in staggered but fade out together, uniformly, on close.
   Covers up to 6 items; add more :nth-child rules if a caller needs more. */
.t-stagger-item {
  opacity: 0;
  transition: opacity 200ms var(--acc-ease);
}
.t-acc[data-open="true"] .t-stagger-item {
  opacity: 1;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(1) {
  transition-delay: 0ms;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(2) {
  transition-delay: 35ms;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(3) {
  transition-delay: 70ms;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(4) {
  transition-delay: 105ms;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(5) {
  transition-delay: 140ms;
}
.t-acc[data-open="true"] .t-stagger-item:nth-child(6) {
  transition-delay: 175ms;
}

@media (prefers-reduced-motion: reduce) {
  .t-stagger-item {
    transition: none !important;
  }
}
```

And in `src/components/ContactForm.tsx`, add the class to each topic button via the existing `className` prop:

```tsx
/* target */
                <div className="grid w-full grid-cols-3 gap-2.5" role="group" aria-label="Topic">
                  {TOPIC_OPTIONS.map((topic) => (
                    <SelectorButton
                      key={topic}
                      label={topic}
                      selected={topics.includes(topic)}
                      onClick={() => toggleTopic(topic)}
                      className="t-stagger-item"
                    />
                  ))}
                </div>
```

## Repo conventions to follow

- Motion tokens live in `src/index.css` — this reuses `--acc-ease` (`cubic-bezier(0.22, 1, 0.36, 1)`, defined at `src/index.css:110`) rather than introducing a new curve.
- Custom `.t-*` classes in this repo are written as plain (unlayered) CSS after `@import "tailwindcss"` (`src/index.css:1`). Tailwind v4 emits its utilities inside its own cascade layer, and unlayered CSS always wins over layered utilities regardless of source order — this is exactly why `.t-modal`, `.t-toast`, and `.t-acc-panel` already coexist with Tailwind utility classes on the same elements elsewhere in this codebase (e.g. `src/components/Modal.tsx`) without needing `!important`. `.t-stagger-item` relies on the same mechanism: it sets `transition-property: opacity` (via the `transition` shorthand) and reliably wins over `SelectorButton`'s Tailwind `transition-transform` utility for that longhand — but because `.t-stagger-item` only ever mentions `opacity`, `SelectorButton`'s own `transition-property: transform` from `transition-transform` is a *different* longhand transition path acting on a *different* CSS property, so both apply simultaneously with no conflict. Do not change `.t-stagger-item` to use the `transition` shorthand with `transform` in the list — that would collide with `transition-transform` and break press feedback timing.
- Reduced-motion guards in this file are always a plain `transition: none !important;` block (see `src/index.css:50-54`, `76-80`, `98-102`, `137-142`) — follow the same minimal form, don't add opacity/transform overrides beyond that.

## Steps

1. Confirm plan 003 has been applied — `src/components/ContactForm.tsx` should have a `<div className="t-acc w-full" data-open={Boolean(type)}>` wrapping the topic section. If not, stop and apply 003 first.
2. In `src/index.css`, insert the new `.t-stagger-item` block (Target above) immediately after line 142 (the closing `}` of the `.t-acc-panel, .t-acc-panel-inner` reduced-motion block) and before the `/* Hero progress bar fill ... */` comment.
3. In `src/components/ContactForm.tsx`, add `className="t-stagger-item"` to the `<SelectorButton>` call inside the topic grid's `.map()` (Target above). Do not add this class to the type-selector's 3 `SelectorButton` instances — that row is visible from page load, not revealed, and doesn't need a stagger.

## Boundaries

- Do NOT modify `SelectorButton`'s own implementation, props, or its `transition-transform`/`active:scale-[0.98]` press feedback.
- Do NOT add a stagger to the 3-button type selector — only the 6-button topic grid.
- Do NOT change `--acc-ease`, `--acc-expand`, or `--acc-collapse` — reuse them as-is.
- Do NOT switch `.t-stagger-item` to animate `transform` — opacity-only is required to avoid the cascade conflict described above.
- If the topic grid's JSX doesn't match the Problem excerpt above (drift since commit `9c84a62`, or plan 003 wasn't applied as written), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm exec tsc -b --noEmit` (expect exit 0) and `pnpm exec oxlint` (expect exit 0) — this plan adds no new TypeScript, so both should be unaffected.
- **Feel check**: run `pnpm dev`, open `/contact-form`, click a type to open the topic section, and confirm:
  - The 6 topic buttons fade in left-to-right, top-to-bottom in visible sequence (roughly 35ms apart) rather than all appearing at once.
  - Clicking a topic button still gives instant press feedback (`active:scale-[0.98]`) with no added delay — the stagger must not slow down interaction.
  - Closing the topic section (deselecting the type) fades all 6 buttons out together, with no reverse-stagger — an uneven close would look worse than no stagger at all.
  - In DevTools, set the Animations panel playback to 10% (or slow down time via the Rendering panel) and confirm the delay increases button-by-button in grid order (row 1 left-to-right, then row 2).
  - Toggle `prefers-reduced-motion: reduce` (Rendering panel) and confirm the buttons appear instantly with no stagger and no fade — matching this repo's existing reduced-motion convention of dropping the animation entirely rather than keeping a gentler version.
- **Done when**: the 6 buttons visibly stagger in on open, close together uniformly, press feedback is unaffected, `tsc`/`oxlint` pass, and reduced-motion drops the stagger entirely per the existing repo convention.
