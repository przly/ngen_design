import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffectOnce } from 'react-use';
import { getDocument, getWindow, useBrowser } from '@/utils/browser';
import { diagramBounds } from './diagram';

interface Point {
	x: number;
	y: number;
}
type View = Point & { scale: number };
type Rect = Point & { width: number; height: number };
type TrackpadGestureEvent = Event & { scale: number; clientX: number; clientY: number };

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 2;
const WHEEL_ZOOM_SPEED = 0.012;
const WHEEL_PAN_SPEED = 1.15;
const WHEEL_SMOOTHING_MS = 28;
const PINCH_HINT_MS = 2000;
const CAMERA_TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] } as const;

const clamp = (scale: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
const distanceBetween = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const centerOf = (points: Point[]): Point =>
	points.length === 1 ? points[0] : { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };

export function useCanvas(fullscreen: boolean) {
	const viewport = useRef<HTMLDivElement>(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const scale = useMotionValue(0.16);
	const [dragging, setDragging] = useState(false);
	// Resolved after hydration so the server and first client render agree.
	const { isHydrated } = useBrowser();
	const isMac = isHydrated && /Mac|iPhone|iPad/.test(getWindow().navigator.platform);
	const [pinchHint, setPinchHint] = useState(false);
	const [previousFullscreen, setPreviousFullscreen] = useState(fullscreen);
	const reducedMotion = useReducedMotion();

	const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const embeddedTouches = useRef(new Map<number, Point>());
	const embeddedPinchDistance = useRef<number | null>(null);
	const modifier = useRef(false);
	const fullscreenMode = useRef(fullscreen);
	const nativeGesture = useRef<{ start: View; anchor: Point } | null>(null);
	const animations = useRef<ReturnType<typeof animate>[]>([]);
	const pointers = useRef(new Map<number, Point>());
	const gesture = useRef<{ view: View; center: Point; distance: number } | null>(null);
	const wheelFrame = useRef<number | null>(null);
	const wheelTarget = useRef<View | null>(null);
	const wheelTime = useRef<number | null>(null);

	const clearHintTimer = useCallback(() => {
		if (hintTimer.current !== null) {
			clearTimeout(hintTimer.current);
		}
		hintTimer.current = null;
	}, []);

	const dismissPinchHint = useCallback(() => {
		clearHintTimer();
		setPinchHint(false);
	}, [clearHintTimer]);

	const showPinchHint = useCallback(() => {
		if (fullscreenMode.current) {
			return;
		}
		clearHintTimer();
		setPinchHint(true);
		hintTimer.current = setTimeout(() => {
			hintTimer.current = null;
			setPinchHint(false);
		}, PINCH_HINT_MS);
	}, [clearHintTimer]);

	const stop = useCallback(() => {
		animations.current.forEach((animation) => animation.stop());
		animations.current = [];
		if (wheelFrame.current !== null) {
			cancelAnimationFrame(wheelFrame.current);
		}
		wheelFrame.current = null;
		wheelTarget.current = null;
		wheelTime.current = null;
	}, []);

	// Touches refs only, so effects can call it.
	const releaseInteraction = useCallback(() => {
		stop();
		nativeGesture.current = null;
		gesture.current = null;
		const captured = [...pointers.current.keys()];
		pointers.current.clear();
		const element = viewport.current;
		captured.forEach((id) => {
			if (element?.hasPointerCapture(id)) {
				element.releasePointerCapture(id);
			}
		});
	}, [stop]);

	const cancelInteraction = useCallback(() => {
		releaseInteraction();
		setDragging(false);
	}, [releaseInteraction]);

	const resetTouches = useCallback(() => {
		embeddedTouches.current.clear();
		embeddedPinchDistance.current = null;
	}, []);

	// Entering or leaving fullscreen changes which gestures the canvas owns, so drop any in flight.
	if (previousFullscreen !== fullscreen) {
		setPreviousFullscreen(fullscreen);
		setDragging(false);
		setPinchHint(false);
	}

	useEffect(() => {
		fullscreenMode.current = fullscreen;
		releaseInteraction();
		resetTouches();
		clearHintTimer();
	}, [fullscreen, releaseInteraction, resetTouches, clearHintTimer]);

	const currentView = useCallback((): View => ({ x: x.get(), y: y.get(), scale: scale.get() }), [x, y, scale]);

	const write = useCallback(
		(next: View) => {
			x.set(next.x);
			y.set(next.y);
			scale.set(next.scale);
		},
		[x, y, scale],
	);

	// One coherent camera update per frame. The OS already supplies scroll inertia;
	// this short, non-overshooting filter only smooths event timing and small steps.
	const followWheel = useCallback(
		(next: View) => {
			if (!wheelTarget.current) {
				animations.current.forEach((animation) => animation.stop());
				animations.current = [];
			}
			wheelTarget.current = next;
			if (wheelFrame.current !== null) {
				return;
			}

			const tick = (time: number) => {
				wheelFrame.current = null;
				const target = wheelTarget.current;
				if (!target) {
					return;
				}
				const current = currentView();
				const elapsed = wheelTime.current === null ? 1000 / 60 : Math.min(64, time - wheelTime.current);
				wheelTime.current = time;
				const amount = reducedMotion ? 1 : 1 - Math.exp(-elapsed / WHEEL_SMOOTHING_MS);
				const nextView = {
					x: current.x + (target.x - current.x) * amount,
					y: current.y + (target.y - current.y) * amount,
					scale: current.scale + (target.scale - current.scale) * amount,
				};
				const settled =
					Math.abs(target.x - nextView.x) < 0.01 &&
					Math.abs(target.y - nextView.y) < 0.01 &&
					Math.abs(target.scale - nextView.scale) < 0.000001;

				if (settled) {
					write(target);
					wheelTarget.current = null;
					wheelTime.current = null;
				} else {
					write(nextView);
					wheelFrame.current = requestAnimationFrame(tick);
				}
			};

			wheelFrame.current = requestAnimationFrame(tick);
		},
		[currentView, reducedMotion, write],
	);

	const apply = useCallback(
		(next: View, smooth = false) => {
			stop();
			if (smooth && !reducedMotion) {
				animations.current = [
					animate(x, next.x, CAMERA_TRANSITION),
					animate(y, next.y, CAMERA_TRANSITION),
					animate(scale, next.scale, CAMERA_TRANSITION),
				];
			} else {
				write(next);
			}
		},
		[x, y, scale, reducedMotion, stop, write],
	);

	const fit = useCallback(
		(smooth = true) => {
			const element = viewport.current;
			if (!element) {
				return;
			}
			const { width, height } = element.getBoundingClientRect();
			const padding = width < 600 ? 26 : 72;
			const nextScale = clamp(Math.min((width - padding * 2) / diagramBounds.width, (height - padding * 2) / diagramBounds.height));
			apply(
				{
					scale: nextScale,
					x: (width - diagramBounds.width * nextScale) / 2 - diagramBounds.x * nextScale,
					y: (height - diagramBounds.height * nextScale) / 2 - diagramBounds.y * nextScale,
				},
				smooth,
			);
		},
		[apply],
	);

	const zoomAt = useCallback(
		(nextScale: number, point?: Point, smooth = false) => {
			const element = viewport.current;
			if (!element) {
				return;
			}
			const anchor = point ?? { x: element.clientWidth / 2, y: element.clientHeight / 2 };
			const view = currentView();
			const clamped = clamp(nextScale);
			const ratio = clamped / view.scale;
			apply({ scale: clamped, x: anchor.x - (anchor.x - view.x) * ratio, y: anchor.y - (anchor.y - view.y) * ratio }, smooth);
		},
		[apply, currentView],
	);

	const jumpTo = useCallback(
		(rect: Rect) => {
			const element = viewport.current;
			if (!element) {
				return;
			}
			const nextScale = clamp(
				Math.min((element.clientWidth - 64) / (rect.width + 100), (element.clientHeight - 150) / (rect.height + 180), 0.9),
			);
			apply(
				{
					scale: nextScale,
					x: element.clientWidth / 2 - (rect.x + rect.width / 2) * nextScale,
					y: element.clientHeight / 2 - (rect.y + rect.height / 2) * nextScale,
				},
				true,
			);
		},
		[apply],
	);

	// The modifier key decides whether a wheel event zooms the canvas or scrolls the page.
	useEffect(() => {
		const browserWindow = getWindow();
		const browserDocument = getDocument();

		const handleKey = (event: KeyboardEvent) => {
			const isDown = isMac ? event.metaKey : event.ctrlKey;
			modifier.current = isDown;
			if (isDown) {
				dismissPinchHint();
			}
			if (!isDown && !fullscreenMode.current && wheelTarget.current) {
				stop();
			}
		};
		const reset = () => {
			modifier.current = false;
			resetTouches();
			cancelInteraction();
			dismissPinchHint();
		};
		const handleVisibility = () => {
			if (browserDocument.hidden) {
				reset();
			}
		};

		browserWindow.addEventListener('keydown', handleKey, true);
		browserWindow.addEventListener('keyup', handleKey, true);
		browserWindow.addEventListener('blur', reset);
		browserDocument.addEventListener('visibilitychange', handleVisibility);

		return () => {
			browserWindow.removeEventListener('keydown', handleKey, true);
			browserWindow.removeEventListener('keyup', handleKey, true);
			browserWindow.removeEventListener('blur', reset);
			browserDocument.removeEventListener('visibilitychange', handleVisibility);
			releaseInteraction();
		};
	}, [isMac, cancelInteraction, dismissPinchHint, releaseInteraction, resetTouches, stop]);

	// Wheel and Safari gesture events must be non-passive to be cancellable, so they are bound natively.
	useEffect(() => {
		const element = viewport.current;
		if (!element) {
			return undefined;
		}

		fit(false);

		// Preserve the world point at the centre when the responsive module resizes.
		let previous = { width: element.clientWidth, height: element.clientHeight };
		const observer = new ResizeObserver(() => {
			const next = { width: element.clientWidth, height: element.clientHeight };
			if (next.width === previous.width && next.height === previous.height) {
				return;
			}
			const current = currentView();
			apply({ ...current, x: current.x + (next.width - previous.width) / 2, y: current.y + (next.height - previous.height) / 2 });
			previous = next;
		});
		observer.observe(element);

		const pointIn = (event: { clientX: number; clientY: number }): Point => {
			const rect = element.getBoundingClientRect();

			return {
				x: Number.isFinite(event.clientX) ? event.clientX - rect.left : rect.width / 2,
				y: Number.isFinite(event.clientY) ? event.clientY - rect.top : rect.height / 2,
			};
		};

		const handleWheel = (event: WheelEvent) => {
			// Chromium encodes pinch as Ctrl-wheel, without a physical key press.
			// Mac scroll zoom uses Command; Windows requires a physically held Ctrl.
			if (!fullscreenMode.current) {
				if (event.ctrlKey && (isMac || !modifier.current)) {
					event.preventDefault();
					showPinchHint();
					return;
				}
				if (!modifier.current) {
					return;
				}
				dismissPinchHint();
			}
			event.preventDefault();
			if (nativeGesture.current || pointers.current.size > 0) {
				return;
			}

			const current = wheelTarget.current ?? currentView();
			// deltaMode can be pixels, lines, or pages. Keep fractional trackpad input.
			const unitX = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
			const unitY = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
			const deltaX = event.deltaX * unitX;
			const deltaY = event.deltaY * unitY;

			if (!fullscreenMode.current || event.ctrlKey || event.metaKey) {
				const point = pointIn(event);
				const nextScale = clamp(current.scale * Math.exp(-deltaY * WHEEL_ZOOM_SPEED));
				const ratio = nextScale / current.scale;
				followWheel({ scale: nextScale, x: point.x - (point.x - current.x) * ratio, y: point.y - (point.y - current.y) * ratio });
			} else {
				const isShiftScroll = event.shiftKey && deltaX === 0;
				followWheel({
					...current,
					x: current.x - (isShiftScroll ? deltaY : deltaX) * WHEEL_PAN_SPEED,
					y: current.y - (isShiftScroll ? 0 : deltaY) * WHEEL_PAN_SPEED,
				});
			}
		};

		// Safari sends native gesture events instead of Chromium's Ctrl-wheel pinch.
		const handleGestureStart = (event: Event) => {
			event.preventDefault();
			if (!fullscreenMode.current) {
				showPinchHint();
				return;
			}
			if (pointers.current.size > 0) {
				return;
			}
			stop();
			const point = pointIn(event as TrackpadGestureEvent);
			const start = currentView();
			nativeGesture.current = { start, anchor: { x: (point.x - start.x) / start.scale, y: (point.y - start.y) / start.scale } };
		};
		const handleGestureChange = (event: Event) => {
			if (!fullscreenMode.current) {
				event.preventDefault();
				showPinchHint();
				return;
			}
			const active = nativeGesture.current;
			if (!active) {
				return;
			}
			event.preventDefault();
			const gestureEvent = event as TrackpadGestureEvent;
			if (!Number.isFinite(gestureEvent.scale) || gestureEvent.scale <= 0) {
				return;
			}
			const point = pointIn(gestureEvent);
			const nextScale = clamp(active.start.scale * gestureEvent.scale);
			followWheel({ scale: nextScale, x: point.x - active.anchor.x * nextScale, y: point.y - active.anchor.y * nextScale });
		};
		const handleGestureEnd = (event: Event) => {
			if (nativeGesture.current) {
				event.preventDefault();
			}
			nativeGesture.current = null;
		};

		element.addEventListener('wheel', handleWheel, { passive: false });
		element.addEventListener('gesturestart', handleGestureStart, { passive: false });
		element.addEventListener('gesturechange', handleGestureChange, { passive: false });
		element.addEventListener('gestureend', handleGestureEnd, { passive: false });

		return () => {
			observer.disconnect();
			element.removeEventListener('wheel', handleWheel);
			element.removeEventListener('gesturestart', handleGestureStart);
			element.removeEventListener('gesturechange', handleGestureChange);
			element.removeEventListener('gestureend', handleGestureEnd);
			stop();
		};
	}, [fit, apply, currentView, followWheel, stop, isMac, showPinchHint, dismissPinchHint]);

	useEffectOnce(() => clearHintTimer);

	const rebase = () => {
		const points = [...pointers.current.values()];
		if (points.length === 0) {
			gesture.current = null;
			setDragging(false);
			return;
		}
		gesture.current = {
			view: currentView(),
			center: centerOf(points),
			distance: points.length === 1 ? 0 : distanceBetween(points[0], points[1]),
		};
		setDragging(true);
	};

	// Embedded, touch belongs to the page: one finger scrolls it, and a pinch only shows the fullscreen hint.
	const trackEmbeddedTouch = (event: ReactPointerEvent<HTMLDivElement>, isStart: boolean) => {
		if (!isStart && !embeddedTouches.current.has(event.pointerId)) {
			return;
		}
		embeddedTouches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
		const points = [...embeddedTouches.current.values()];
		if (points.length < 2) {
			return;
		}
		if (isStart) {
			embeddedPinchDistance.current = distanceBetween(points[0], points[1]);
		} else if (
			embeddedPinchDistance.current !== null &&
			Math.abs(distanceBetween(points[0], points[1]) - embeddedPinchDistance.current) > 4
		) {
			showPinchHint();
		}
	};

	const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!fullscreen && event.pointerType === 'touch') {
			trackEmbeddedTouch(event, true);
			return;
		}
		if (event.button !== 0 || (event.target as Element).closest('button,a,select,[data-canvas-controls]')) {
			return;
		}
		dismissPinchHint();
		stop();
		viewport.current?.focus({ preventScroll: true });
		event.currentTarget.setPointerCapture(event.pointerId);
		pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
		rebase();
	};

	const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (!fullscreen && event.pointerType === 'touch') {
			trackEmbeddedTouch(event, false);
			return;
		}
		const active = gesture.current;
		if (!pointers.current.has(event.pointerId) || !active) {
			return;
		}
		pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
		const points = [...pointers.current.values()];
		const center = centerOf(points);
		const isPinch = fullscreen && points.length > 1 && active.distance > 0;
		const nextScale = isPinch ? clamp((active.view.scale * distanceBetween(points[0], points[1])) / active.distance) : active.view.scale;
		const rect = event.currentTarget.getBoundingClientRect();
		const ratio = nextScale / active.view.scale;
		apply({
			scale: nextScale,
			x: center.x - rect.left - (active.center.x - rect.left - active.view.x) * ratio,
			y: center.y - rect.top - (active.center.y - rect.top - active.view.y) * ratio,
		});
	};

	const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
		embeddedTouches.current.delete(event.pointerId);
		if (embeddedTouches.current.size < 2) {
			embeddedPinchDistance.current = null;
		}
		pointers.current.delete(event.pointerId);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		rebase();
	};

	const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) {
			return;
		}
		dismissPinchHint();
		const view = currentView();
		const step = event.shiftKey ? 160 : 60;
		const pan: Record<string, Point> = {
			ArrowLeft: { x: step, y: 0 },
			ArrowRight: { x: -step, y: 0 },
			ArrowUp: { x: 0, y: step },
			ArrowDown: { x: 0, y: -step },
		};

		if (event.key === '+' || event.key === '=') {
			event.preventDefault();
			zoomAt(view.scale * 1.25, undefined, true);
		} else if (event.key === '-') {
			event.preventDefault();
			zoomAt(view.scale / 1.25, undefined, true);
		} else if (event.key === '0') {
			event.preventDefault();
			fit();
		} else if (event.key in pan) {
			event.preventDefault();
			apply({ ...view, x: view.x + pan[event.key].x, y: view.y + pan[event.key].y }, true);
		}
	};

	return {
		viewport,
		x,
		y,
		scale,
		dragging,
		fit,
		jumpTo,
		zoomAt,
		pinchHint,
		dismissPinchHint,
		modifierKey: isMac ? 'Cmd' : 'Ctrl',
		isMac,
		handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onLostPointerCapture: onPointerUp, onKeyDown },
	};
}
