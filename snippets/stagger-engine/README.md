# Stagger engine

A dependency-free, framework-agnostic port of the topic-reveal stagger built for
`src/components/ContactForm.tsx` (`/contact-form`) — for handoff to teams working
outside this React codebase. No build step: link both files and use the `Stagger`
class directly.

```js
const stagger = new Stagger(container, { groupSize: 3 });

// First reveal AND every later change go through the same call:
container.innerHTML = renderItems(newList);
stagger.reveal(container.querySelectorAll(".stagger-item"));

// Closing / hiding — fades everything out together, no stagger:
stagger.close();
```

Apply the `stagger-group` class to the container and `stagger-item` (optionally
also `stagger-item--pop`) to each element that should animate in — see
`stagger-engine.css` for what those classes do and why.

## Docs

- [Topic Reveal Stagger](https://claude.ai/code/artifact/0867820e-7a5d-4f6c-9e5d-5ae9a1b09daf) — the full spec: exact timing, per-element properties, and the implementation gotchas this code fixes.
- [Stagger Engine](https://claude.ai/code/artifact/26c96f69-e679-4fbf-b336-4a13512e9cd5) — a live working demo of this exact code, plus both files inline for copy-paste.

## Verified

- 80 trials (fresh reveals + rapid re-reveals) with zero pops — the double-rAF
  retrigger in `_retrigger()` is a measured fix, not a defensive guess.
- A DOM node reused across two reveals (not recreated) still resets and replays
  correctly — traced live, this engine doesn't have the "persisting item won't
  replay" limitation a React port of the same idea needs a changed `key` to avoid.
