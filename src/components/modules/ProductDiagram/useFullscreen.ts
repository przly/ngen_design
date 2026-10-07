import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffectOnce } from 'react-use';
import { getDocument, getWindow } from '@/utils/browser';

interface Rect {
	left: number;
	top: number;
	width: number;
	height: number;
	radius: number;
}

// Slightly overdamped: soft settling without bouncing past the screen edges.
const FULLSCREEN_SPRING = { type: 'spring', stiffness: 170, damping: 28, mass: 1 } as const;

const screenRect = (): Rect => ({ left: 0, top: 0, width: getWindow().innerWidth, height: getWindow().innerHeight, radius: 0 });

/**
 * Expands the canvas from its place in the page to the whole screen.
 * `host` goes fullscreen; `frame` is the in-flow box the canvas grows from and returns to.
 */
export function useFullscreen(host: RefObject<HTMLElement | null>, frame: RefObject<HTMLDivElement | null>) {
	const [active, setActive] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [busy, setBusy] = useState(false);
	// Mirrors of the state above, readable inside async steps without waiting for a render.
	const activeRef = useRef(false);
	const expandedRef = useRef(false);
	const busyRef = useRef(false);
	// Bumped on every toggle so a superseded transition can tell it is stale.
	const generation = useRef(0);
	const animations = useRef<ReturnType<typeof animate>[]>([]);
	const reducedMotion = useReducedMotion();
	const left = useMotionValue(0);
	const top = useMotionValue(0);
	const width = useMotionValue(0);
	const height = useMotionValue(0);
	const radius = useMotionValue(36);

	const markActive = useCallback((next: boolean) => {
		activeRef.current = next;
		setActive(next);
	}, []);
	const markExpanded = useCallback((next: boolean) => {
		expandedRef.current = next;
		setExpanded(next);
	}, []);
	const markBusy = useCallback((next: boolean) => {
		busyRef.current = next;
		setBusy(next);
	}, []);

	const stop = useCallback(() => {
		animations.current.forEach((animation) => animation.stop());
		animations.current = [];
	}, []);

	// Read through a function: the refs change across awaits, which narrowing cannot see.
	const isActive = useCallback(() => activeRef.current, []);
	const isHostFullscreen = useCallback(() => getDocument().fullscreenElement === host.current, [host]);

	const getOrigin = useCallback((): Rect | null => {
		const anchor = frame.current;
		if (!anchor) {
			return null;
		}
		const rect = anchor.getBoundingClientRect();

		return {
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			radius: Number.parseFloat(getWindow().getComputedStyle(anchor).getPropertyValue('--canvas-radius')),
		};
	}, [frame]);

	const transitionTo = useCallback(
		(target: Rect, isOpening: boolean, id: number) => {
			stop();
			const options = reducedMotion ? { duration: 0 } : FULLSCREEN_SPRING;
			animations.current = [
				animate(left, target.left, options),
				animate(top, target.top, options),
				animate(width, target.width, options),
				animate(height, target.height, options),
				animate(radius, target.radius, options),
			];
			void Promise.all(animations.current).then(() => {
				if (id !== generation.current) {
					return;
				}
				animations.current = [];
				if (!isOpening) {
					markExpanded(false);
				}
			});
		},
		[left, top, width, height, radius, reducedMotion, stop, markExpanded],
	);

	const collapse = useCallback(
		(id: number) => {
			const origin = getOrigin();
			if (id === generation.current && origin) {
				transitionTo(origin, false, id);
			}
		},
		[getOrigin, transitionTo],
	);

	const close = useCallback(async () => {
		if (!expandedRef.current) {
			return;
		}
		generation.current += 1;
		const id = generation.current;
		markActive(false);
		stop();
		markBusy(false);

		if (isHostFullscreen()) {
			markBusy(true);
			try {
				await getDocument().exitFullscreen();
			} catch {
				if (id === generation.current && isHostFullscreen()) {
					markActive(true);
				}
			}
			if (id !== generation.current) {
				return;
			}
			markBusy(false);
			if (activeRef.current) {
				return;
			}
		}

		collapse(id);
	}, [collapse, isHostFullscreen, markActive, markBusy, stop]);

	const toggle = useCallback(async () => {
		if (busyRef.current) {
			return;
		}
		if (activeRef.current) {
			await close();
			return;
		}
		const element = host.current;
		const origin = getOrigin();
		if (!element || !origin) {
			return;
		}
		generation.current += 1;
		const id = generation.current;
		stop();
		if (!expandedRef.current) {
			// Start a fresh transition without inheriting velocity from initialization.
			left.jump(origin.left);
			top.jump(origin.top);
			width.jump(origin.width);
			height.jump(origin.height);
			radius.jump(origin.radius);
		}
		markActive(true);
		markExpanded(true);
		markBusy(true);

		try {
			// Request in the click gesture. Animating inside the host prevents the
			// browser's fullscreen promotion from snapping the canvas to its final size.
			await element.requestFullscreen();
		} catch {
			// Use the identical animation when an embedded preview denies the API.
		}

		if (id !== generation.current) {
			if (!isActive() && isHostFullscreen()) {
				await getDocument()
					.exitFullscreen()
					.catch(() => undefined);
			}
			return;
		}
		markBusy(false);
		transitionTo(screenRect(), true, id);
	}, [
		host,
		left,
		top,
		width,
		height,
		radius,
		getOrigin,
		stop,
		close,
		transitionTo,
		isActive,
		isHostFullscreen,
		markActive,
		markExpanded,
		markBusy,
	]);

	useEffect(() => {
		const browserWindow = getWindow();
		const browserDocument = getDocument();

		const handleFullscreenChange = () => {
			if (!isHostFullscreen() && activeRef.current) {
				void close();
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && activeRef.current) {
				void close();
			}
		};
		const handleResize = () => {
			if (!expandedRef.current || busyRef.current) {
				return;
			}
			generation.current += 1;
			if (activeRef.current) {
				transitionTo(screenRect(), true, generation.current);
			} else {
				collapse(generation.current);
			}
		};

		browserDocument.addEventListener('fullscreenchange', handleFullscreenChange);
		browserDocument.addEventListener('keydown', handleKeyDown);
		browserWindow.addEventListener('resize', handleResize);

		return () => {
			browserDocument.removeEventListener('fullscreenchange', handleFullscreenChange);
			browserDocument.removeEventListener('keydown', handleKeyDown);
			browserWindow.removeEventListener('resize', handleResize);
		};
	}, [close, collapse, isHostFullscreen, transitionTo]);

	// The page behind an expanded canvas must not scroll. This also pauses Lenis, which watches body overflow.
	useEffect(() => {
		if (!expanded) {
			return undefined;
		}
		const { style } = getDocument().body;
		const previous = style.overflow;
		style.overflow = 'hidden';

		return () => {
			style.overflow = previous;
		};
	}, [expanded]);

	useEffectOnce(() => () => {
		generation.current += 1;
		stop();
	});

	return {
		active,
		expanded,
		busy,
		toggle,
		// Explicit defaults also clear Motion's inline geometry when returning to flow.
		style: expanded
			? { left, top, width, height, borderRadius: radius }
			: { left: 0, top: 0, width: '100%', height: '100%', borderRadius: 'var(--canvas-radius)' },
	};
}
