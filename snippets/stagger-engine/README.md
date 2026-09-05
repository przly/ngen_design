# Stagger engine

A TypeScript port of the topic-reveal stagger built for
`src/components/ContactForm.tsx` (`/contact-form`) — for handoff to teams working
outside this React codebase. Uses [Motion](https://motion.dev) (`npm install motion`)
to drive the animation directly, rather than CSS transitions.

```ts
import { Stagger } from "./stagger-engine";

const stagger = new Stagger(document.querySelector("#topics")!, { groupSize: 3 });

// First reveal AND every later change go through the same call: render
// your markup, then hand the resulting elements to reveal(). Mark any
// element that should also pop in from a slight scale with data-stagger-pop.
topicsGrid.innerHTML = renderTopics(newList);
stagger.reveal(topicsGrid.querySelectorAll(".topic-btn"));

// Closing / hiding — fades everything out together, no stagger:
stagger.close();
```

No companion CSS file: Motion sets every animated value directly and composes
`y`/`scale` into one `transform` for you, so there's nothing to keep in sync
with a stylesheet.

## Why Motion instead of the earlier CSS-transition version

The first draft of this snippet was plain CSS transitions + a `data-open`
attribute toggle, portable to any static page with zero dependencies. It
needed a "double `requestAnimationFrame`" trick to reliably replay, because a
CSS transition only animates when the browser observes an actual value change
between two painted frames — and a single rAF doesn't reliably guarantee that
paint happens before flipping back.

Motion's `animate()` drives the values itself, frame by frame, rather than
asking the browser to retarget a CSS transition — so that whole class of
timing bug doesn't exist here. Calling `reveal()` again with explicit `[from,
to]` keyframes (not just a target value) forces every item to genuinely reset
and replay, confirmed directly: the identical DOM node, reused across two
different reveal() calls (not recreated), still resets to opacity 0 and fades
back in exactly like a freshly-created one.

The trade-off: this version needs the `motion` package. If the target project
truly can't take a dependency, the CSS+vanilla-JS version is a straightforward
enough pattern to rebuild from the [Topic Reveal Stagger](https://claude.ai/code/artifact/0867820e-7a5d-4f6c-9e5d-5ae9a1b09daf)
spec's per-element property tables.

## Docs

- [Topic Reveal Stagger](https://claude.ai/code/artifact/0867820e-7a5d-4f6c-9e5d-5ae9a1b09daf) — the full spec: exact timing, per-element properties, and the implementation gotchas the original CSS version had to fix.

## Verified

- Fresh reveal, direct switches, and rapid interruption (switching again 20ms
  into a previous reveal) all settle to the correct final state with zero
  console errors.
- A DOM node reused across two reveals (not recreated) still resets and
  replays correctly — traced live via its exact identity and opacity across a
  switch: same node, opacity 0 → 0.77 → 0.97 → 1.
