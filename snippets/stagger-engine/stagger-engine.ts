import { animate, type AnimationPlaybackControlsWithThen, type Easing } from "motion";

/**
 * Stagger engine — Motion (motion.dev) version, TypeScript.
 *
 * Requires the `motion` package (https://motion.dev) — `npm install motion`.
 * No CSS file needed: Motion sets every animated value directly via JS, so
 * there's nothing to keep in sync with a stylesheet. It also composes `y`
 * and `scale` into one `transform` for you — no manual string building.
 *
 * -----------------------------------------------------------------------
 * Usage
 * -----------------------------------------------------------------------
 *   const stagger = new Stagger(document.querySelector("#topics")!, { groupSize: 3 });
 *
 *   // First reveal AND every later change go through the same call: render
 *   // your markup, then hand the resulting elements to reveal(). Mark any
 *   // element that should also pop in from a slight scale (not just fade +
 *   // rise) with data-stagger-pop.
 *   topicsGrid.innerHTML = renderTopics(newList);
 *   stagger.reveal(topicsGrid.querySelectorAll(".topic-btn"));
 *
 *   // Closing / hiding — fades everything out together, no stagger:
 *   stagger.close();
 * -----------------------------------------------------------------------
 */

export interface StaggerOptions {
  /**
   * Consecutive items (in the order passed to reveal()) that share one
   * delay tier — 3 replicates "rows of 3" for a 3-column grid; 1 gives
   * every item its own delay; a very large number makes the whole set
   * move together with no stagger at all.
   * @default 1
   */
  groupSize?: number;
  /** Delay between one group and the next, in seconds. @default 0.03 (30ms) */
  step?: number;
  /** Duration of each item's own fade/rise/pop, in seconds. @default 0.12 (120ms) */
  duration?: number;
  /**
   * Easing curve, shared by the group's own scale-in and every item.
   * Defaults to a strong ease-out with no bounce — appropriate for a
   * click-triggered reveal with no preceding gesture or momentum to
   * carry. Reserve bounce/spring easing for gesture-driven motion.
   */
  ease?: Easing;
}

const DEFAULTS: Required<StaggerOptions> = {
  groupSize: 1,
  step: 0.03,
  duration: 0.12,
  ease: [0.22, 1, 0.36, 1],
};

export class Stagger {
  private readonly container: HTMLElement;
  private readonly options: Required<StaggerOptions>;
  private readonly reducedMotion: boolean;
  private items: HTMLElement[] = [];

  constructor(container: HTMLElement, options: StaggerOptions = {}) {
    this.container = container;
    this.options = { ...DEFAULTS, ...options };
    // Anchored to the container's own top edge, not centered — this reveals
    // below whatever triggered it, not floating in from a specific point.
    this.container.style.transformOrigin = "top";
    this.reducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * (Re)plays the entrance for the given items, in the order given. Safe to
   * call again while a previous reveal is still animating — Motion
   * interrupts and retargets in-flight animations on the same element
   * automatically, and because both keyframes ([0, 1], not just the target
   * 1) are given explicitly, each item genuinely resets to its start value
   * before animating again rather than continuing from wherever it was.
   *
   * Reused DOM nodes (e.g. an option that exists in both the old and new
   * list) replay exactly like freshly-created ones — verified directly.
   * Motion drives the animation itself rather than depending on a CSS
   * transition being retargeted by the browser, which is what made the
   * CSS-based version of this engine need extra work to guarantee a replay.
   */
  reveal(items: Element[] | NodeListOf<Element>): AnimationPlaybackControlsWithThen[] {
    this.items = Array.from(items) as HTMLElement[];
    const { duration, ease, step, groupSize } = this.options;
    const controls: AnimationPlaybackControlsWithThen[] = [];

    if (this.reducedMotion) {
      // Gentler, not zero: keep a short opacity crossfade (it carries real
      // information — something just appeared), drop the movement (y,
      // scale) and the stagger delay entirely.
      controls.push(animate(this.container, { scale: 1 }, { duration: 0 }));
      for (const item of this.items) {
        controls.push(animate(item, { opacity: [0, 1] }, { duration, ease: "easeOut" }));
      }
      return controls;
    }

    controls.push(animate(this.container, { scale: [0.98, 1] }, { duration, ease }));

    this.items.forEach((item, i) => {
      const delay = Math.floor(i / groupSize) * step;
      const pop = item.hasAttribute("data-stagger-pop");
      controls.push(
        animate(
          item,
          pop ? { opacity: [0, 1], y: [6, 0], scale: [0.97, 1] } : { opacity: [0, 1], y: [6, 0] },
          { duration, ease, delay }
        )
      );
    });

    return controls;
  }

  /** Fades everything out together — no stagger, no delay, just `duration`. */
  close(): AnimationPlaybackControlsWithThen[] {
    const { duration, ease } = this.options;
    if (this.reducedMotion) {
      const controls = [animate(this.container, { scale: 1 }, { duration: 0 })];
      for (const item of this.items) controls.push(animate(item, { opacity: 0 }, { duration, ease: "easeOut" }));
      return controls;
    }
    const controls = [animate(this.container, { scale: 0.98 }, { duration, ease })];
    for (const item of this.items) controls.push(animate(item, { opacity: 0, y: 6 }, { duration, ease }));
    return controls;
  }
}
