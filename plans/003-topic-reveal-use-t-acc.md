# 003 — Replace the Framer Motion height reveal with the repo's own `.t-acc` accordion

- **Status**: DONE
- **Commit**: 9c84a62
- **Severity**: MEDIUM
- **Category**: Performance & Cohesion
- **Estimated scope**: 1 file (`src/components/ContactForm.tsx`), no new dependencies, no CSS changes (reuses existing tokens)

## Problem

`src/components/ContactForm.tsx` reveals the "Select a topic" sub-selection with Framer Motion animating `height: "auto"` — a layout property that forces Motion to measure the element's natural height via JS on mount/update and interpolate it frame-by-frame, instead of a GPU-cheap `transform`/`opacity`/`grid-template-rows` change. It also hardcodes its own easing curve (`REVEAL_EASE`) that duplicates a token this repo already has (`--acc-ease` / `--modal-ease`, both `cubic-bezier(0.22, 1, 0.36, 1)` in `src/index.css:16` and `src/index.css:110`), and reimplements reduced-motion branching in JS — when this exact codebase already has a working, CSS-only accordion for precisely this case (`.t-acc` / `.t-acc-panel` / `.t-acc-panel-inner` in `src/index.css:104-142`), used twice already: `src/pages/NewsletterSignup.tsx`'s error banner and this very file's own post-submit confirmation (`ContactForm.tsx:277-285`, using the code as it stands before this plan is applied).

Current code, `src/components/ContactForm.tsx:1-25`:

```tsx
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type ContactType = "home" | "business" | "asset-owners";

const TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "home", label: "For Home" },
  { value: "business", label: "For Business" },
  { value: "asset-owners", label: "For Asset Owners" },
];

// Figma's second "Topic" frame (node 4479:20758) — revealed once a type
// above is picked. Unlike the type selector this one is multi-select, per
// its "You can select multiple options" hint.
const TOPIC_OPTIONS = [
  "Home solutions",
  "Business solutions",
  "Utility & Grid",
  "Partnerships",
  "Technical support",
  "Other",
] as const;

// transitions.dev's default open easing (mirrors --modal-ease in index.css).
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
```

Current code, `src/components/ContactForm.tsx:99-100` (inside `ContactForm`):

```tsx
  const [submitted, setSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
```

Current code, `src/components/ContactForm.tsx:182-229` (the type selector and the reveal):

```tsx
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-start gap-1 text-xs leading-[1.5] text-white/50">
            <span>Select the type:</span>
            <span className="text-[#fb2c36]">*</span>
          </div>
          <div className="flex w-full items-center gap-2.5" role="group" aria-label="Contact type">
            {TYPE_OPTIONS.map((option) => (
              <SelectorButton
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onClick={() => handleTypeSelect(option.value)}
                className="flex-1"
              />
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {type && (
            <motion.div
              key="topic-select"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: REVEAL_EASE }}
              className="flex w-full flex-col items-start gap-2 overflow-hidden"
            >
              <div className="flex w-full items-start justify-between gap-2 text-xs leading-[1.5] text-white/50">
                <div className="flex items-start gap-1">
                  <span>Select a topic:</span>
                  <span className="text-[#fb2c36]">*</span>
                </div>
                <span>You can select multiple options</span>
              </div>
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
            </motion.div>
          )}
        </AnimatePresence>
```

## Target

Drop the Framer Motion reveal and its supporting imports/constants entirely. Replace it with the repo's own `.t-acc` classes, nested as a third child of the existing "Select the type" wrapper (not as a top-level sibling — see Repo conventions below for why), bound directly to `Boolean(type)`.

```tsx
/* target — src/components/ContactForm.tsx:182-217 */
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-start gap-1 text-xs leading-[1.5] text-white/50">
            <span>Select the type:</span>
            <span className="text-[#fb2c36]">*</span>
          </div>
          <div className="flex w-full items-center gap-2.5" role="group" aria-label="Contact type">
            {TYPE_OPTIONS.map((option) => (
              <SelectorButton
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onClick={() => handleTypeSelect(option.value)}
                className="flex-1"
              />
            ))}
          </div>

          {/* transitions-dev accordion panel (21-accordion.md) — same .t-acc
              technique as the post-submit confirmation below and
              NewsletterSignup's error banner, reused here instead of a
              second, JS-driven height animation. */}
          <div className="t-acc w-full" data-open={Boolean(type)}>
            <div className="t-acc-panel">
              <div className="t-acc-panel-inner flex w-full flex-col items-start gap-2 pt-6">
                <div className="flex w-full items-start justify-between gap-2 text-xs leading-[1.5] text-white/50">
                  <div className="flex items-start gap-1">
                    <span>Select a topic:</span>
                    <span className="text-[#fb2c36]">*</span>
                  </div>
                  <span>You can select multiple options</span>
                </div>
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
              </div>
            </div>
          </div>
        </div>
```

No CSS changes are needed — `.t-acc` / `.t-acc-panel` / `.t-acc-panel-inner` and the `--acc-expand` / `--acc-collapse` / `--acc-ease` tokens already exist at `src/index.css:104-142`, reduced-motion guard included.

## Repo conventions to follow

- The `.t-acc` pattern is always mounted unconditionally (never conditionally rendered/unmounted) in both existing uses — `src/pages/NewsletterSignup.tsx`'s `data-open={showError}` error banner, and `ContactForm.tsx:279` (`data-open={submitted}`, this file, unaffected by this plan). Follow the same convention here: no conditional `{type && (...)}` mount, no delayed-unmount `useEffect`. `data-open={Boolean(type)}` on a permanently-rendered wrapper is correct and matches both exemplars.
- Because `.t-acc` is always mounted, it always takes part in whatever flex `gap` its parent applies — collapsed, its rendered height is ~0 but the gap around it still reserves space (this is already true of the existing `submitted` confirmation inside the `gap-[18px]` container at `ContactForm.tsx:248-285`, and is an accepted trade-off in this codebase, not a bug to fix). Nest the new block inside the "Select the type" wrapper (`gap-2`, i.e. 8px) rather than as a sibling in the outer `gap-12` (48px) list specifically to keep that phantom collapsed-state gap small (8px) instead of large (48px). The `pt-6` (24px) on `.t-acc-panel-inner` restores visual breathing room between the type buttons and "Select a topic" when the section is open.
- Motion tokens live in `src/index.css` as `--*-dur`/`--*-ease` pairs — this plan doesn't need a new one, but if a future plan needs a new curve, that's where it goes (see `--modal-ease`, `--acc-ease`).

## Steps

1. In `src/components/ContactForm.tsx`, remove the import `import { AnimatePresence, motion, useReducedMotion } from "motion/react";` (line 2). Confirm no other code in this file uses `motion`, `AnimatePresence`, or `useReducedMotion` before removing — as of this plan's commit, this reveal is the only use.
2. Remove the `REVEAL_EASE` constant (lines 24-25, including its comment).
3. Remove the line `const prefersReducedMotion = useReducedMotion() ?? false;` (line 100).
4. Replace the JSX block spanning from the `<div className="flex w-full flex-col items-start gap-2">` that opens the "Select the type" section (line 182) through the closing `</AnimatePresence>` (line 229) with the Target code above — note the wrapper `<div>`'s closing tag moves to after the new `.t-acc` block, since the reveal is now nested inside it rather than a sibling after it.
5. Leave `handleTypeSelect`, `toggleTopic`, `TYPE_OPTIONS`, `TOPIC_OPTIONS`, and `SelectorButton` untouched — none of their logic changes.

## Boundaries

- Do NOT touch `src/index.css` — the `.t-acc` classes and tokens this plan reuses already exist and need no changes.
- Do NOT touch `src/pages/ContactFormDemo.tsx`, `src/pages/NewsletterSignup.tsx`, or `src/components/HeroCards.tsx`.
- Do NOT change the `SelectorButton` component's implementation or props.
- Do NOT change the post-submit confirmation block at the bottom of the file (`ContactForm.tsx:277-285` in the pre-plan code) — it already uses `.t-acc` correctly and is out of scope.
- The nesting change (moving the topic block inside the type-selector's wrapper `div` instead of keeping it as a top-level sibling) is an intentional, authorized structural change — it is not a boundary violation of "motion properties only."
- If the current code at `ContactForm.tsx:182-229` doesn't match the Problem excerpt above (drift since commit `9c84a62`), STOP and report instead of improvising.

## Execution notes

The plan's Target code put `pt-6` directly on `.t-acc-panel-inner`. In practice this leaked exactly 24px into the collapsed state (measured via a live `getBoundingClientRect` check: gap between the type-selector row and the Message label was 80px, not the expected 56px = 8px inner gap + 48px outer gap). Padding is part of an element's own box and isn't clipped to 0 by `overflow: hidden`/`grid-template-rows: 0fr` the way overflowing *content* is — only content that extends beyond the box gets clipped, not the box's own padding. Fixed by moving `pt-6` (and the `flex flex-col items-start gap-2` layout classes) onto a plain nested `<div>` inside `.t-acc-panel-inner`, leaving `.t-acc-panel-inner` itself with no padding of its own so it can actually collapse to 0. Re-measured after the fix: gap is exactly 56px. Shipped code reflects this fix; the Target section above is left as originally written for the historical record.

## Verification

- **Mechanical**: `pnpm exec tsc -b --noEmit` (expect exit 0, and confirm `motion`/`AnimatePresence`/`useReducedMotion` no longer appear as unused-import errors) and `pnpm exec oxlint` (expect exit 0).
- **Feel check**: run `pnpm dev`, open `/contact-form`, and confirm:
  - Clicking "For Home" (or either other type) opens the "Select a topic" section with a smooth height + fade-and-unblur reveal — no instant snap-open, no layout jump.
  - Clicking the same type again collapses it smoothly back to zero height.
  - Switching directly from one type to another (without deselecting first) leaves the topic section open throughout — it must not flicker closed-then-open.
  - With no type selected, there's a small (~8px) gap between the type-selector row and the "Select the type" section's own bottom edge, but no large (~48px) empty gap — if there is, the nesting in step 4 was done at the wrong level.
  - In DevTools' Rendering panel, set "Emulate CSS media feature prefers-reduced-motion: reduce" and confirm the open/close still works but snaps instantly (no animated height or fade) — matching the existing `.t-acc-panel`/`.t-acc-panel-inner` reduced-motion rule, which already handles this with no code change needed here.
  - In the Performance panel, record opening the section once: there should be no long "Recalculate Style"/"Layout" entries repeating every animation frame the way Framer Motion's `height: "auto"` produced before this change — a `grid-template-rows` transition still triggers layout, but once per transition tick pair (start/end), not measured-and-set on every frame via JS.
- **Done when**: the reveal behaves identically from a user's perspective (opens/closes on type select/deselect, holds correctly when switching types, no phantom 48px gap), `tsc`/`oxlint` pass, and no `motion`/`framer`-related imports remain in `ContactForm.tsx`.
