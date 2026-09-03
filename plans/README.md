# Animation plans

Scope: the Explore button appear/disappear swap in `src/components/HeroCards.tsx` (the "Hero Progress Bar" auto-advancing cards at `/hero-cards`).

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-popLayout-button-swap.md) | Add `mode="popLayout"` to the Explore button/spacer AnimatePresence | HIGH | DONE |
| [002](002-tighten-button-switch-duration.md) | Tighten the Explore button's materialize duration to 200ms | LOW | DONE |

## Recommended execution order

1. **001 first.** It fixes a real layout-thrash bug (measured: eyebrow text column squeezes from 175px → 155px → 243px instead of a clean 175px → 243px) and touches the same `AnimatePresence` line that 002's surrounding code references for context.
2. **002 second.** Purely a duration tweak, independent of 001 — no shared lines, no ordering dependency, but doing it after 001 means the feel-check for 002 is judged against the already-fixed layout behavior.

No other dependencies between the two plans — they touch different lines in the same file and can also be applied in either order or by different executors without conflict.
