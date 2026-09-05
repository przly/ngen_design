# Animation plans

## HeroCards (`src/components/HeroCards.tsx`, `/hero-cards`)

Scope: the Explore button appear/disappear swap in the "Hero Progress Bar" auto-advancing cards.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-popLayout-button-swap.md) | Add `mode="popLayout"` to the Explore button/spacer AnimatePresence | HIGH | DONE |
| [002](002-tighten-button-switch-duration.md) | Tighten the Explore button's materialize duration to 200ms | LOW | DONE |

### Recommended execution order

1. **001 first.** It fixes a real layout-thrash bug (measured: eyebrow text column squeezes from 175px → 155px → 243px instead of a clean 175px → 243px) and touches the same `AnimatePresence` line that 002's surrounding code references for context.
2. **002 second.** Purely a duration tweak, independent of 001 — no shared lines, no ordering dependency, but doing it after 001 means the feel-check for 002 is judged against the already-fixed layout behavior.

No other dependencies between the two plans — they touch different lines in the same file and can also be applied in either order or by different executors without conflict.

## ContactForm (`src/components/ContactForm.tsx`, `/contact-form`)

Scope: the "Select a topic" reveal that opens under the type selector.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [003](003-topic-reveal-use-t-acc.md) | Replace the Framer Motion `height: "auto"` reveal with the repo's own `.t-acc` accordion | MEDIUM | DONE |
| [004](004-stagger-topic-buttons.md) | Stagger the 6 topic buttons on reveal | LOW | DONE |

### Recommended execution order

1. **003 first, mandatory.** 004 edits the `SelectorButton` calls inside the `.t-acc` block that 003 introduces — that code doesn't exist until 003 is applied.
2. **004 second.** Adds a `.t-stagger-item` CSS class and one `className` addition on top of 003's structure; no changes to 003's own lines beyond that.

003 must be applied before 004 — they are not independent like the HeroCards pair above.
