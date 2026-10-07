import { router } from '@inertiajs/react';
import type { MouseEvent } from 'react';
import { getDocument, getWindow } from '@/utils/browser';

type VisitOptions = NonNullable<Parameters<typeof router.visit>[1]>;

const isFragmentVisit = (url: URL, options: VisitOptions): boolean =>
	Boolean(url.hash) &&
	url.origin === getWindow().location.origin &&
	(options.method ?? 'get') === 'get' &&
	!options.async &&
	!options.prefetch &&
	!options.preserveUrl &&
	!options.only?.length &&
	!options.except?.length &&
	!options.reset?.length;

export const getFragmentVisitOptions = (href: string, options: VisitOptions): VisitOptions =>
	isFragmentVisit(new URL(href, getWindow().location.href), options) ? { preserveScroll: true, viewTransition: false } : {};

export const registerFragmentNavigationListeners = (): VoidFunction => {
	const browserWindow = getWindow();
	let pendingVisitId: string | undefined;
	let cancelScroll: VoidFunction | undefined;
	const cancelPending = (): void => {
		pendingVisitId = undefined;
		cancelScroll?.();
		cancelScroll = undefined;
	};
	const removeBefore = router.on('before', ({ detail: { visit } }) => {
		if (visit.async || visit.prefetch) {
			return;
		}
		cancelPending();
		if (isFragmentVisit(visit.url, visit)) {
			pendingVisitId = visit.id;
		}
	});
	const removeSuccess = router.on('success', ({ detail: { page, visitId } }) => {
		if (!pendingVisitId || visitId !== pendingVisitId) {
			return;
		}
		cancelPending();
		cancelScroll = scrollToPageFragment(page.url);
	});
	const removeFinish = router.on('finish', ({ detail: { visit } }) => {
		if (visit.id === pendingVisitId) {
			cancelPending();
		}
	});
	const navigation = browserWindow.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	const initialHash = browserWindow.location.hash;
	const removeInitial = router.once('navigate', ({ detail: { page } }) => {
		if (initialHash && navigation?.type !== 'back_forward') {
			cancelScroll = scrollToPageFragment(page.url);
		}
	});
	const cancelEvents = ['popstate', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
	cancelEvents.forEach((event) => browserWindow.addEventListener(event, cancelPending, { passive: true }));

	return () => {
		cancelPending();
		removeBefore();
		removeSuccess();
		removeFinish();
		removeInitial();
		cancelEvents.forEach((event) => browserWindow.removeEventListener(event, cancelPending));
	};
};

const getFragmentTarget = (url: URL): HTMLElement | null => {
	try {
		return url.hash ? getDocument().getElementById(decodeURIComponent(url.hash.slice(1))) : null;
	} catch {
		return null;
	}
};

const focusAndScroll = (target: HTMLElement): void => {
	const browserWindow = getWindow();
	if (!target.hasAttribute('tabindex') && target.tabIndex < 0) {
		target.setAttribute('tabindex', '-1');
		target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
	}
	target.focus({ preventScroll: true });
	target.scrollIntoView({
		behavior: browserWindow.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
		block: 'start',
	});
};

const scrollToPageFragment = (href: string): VoidFunction => {
	const browserWindow = getWindow();
	const url = new URL(href, browserWindow.location.href);
	let frame = 0;
	// Inertia queues its initial anchor jump in a timeout. Run after that, then paint the top before animating.
	const task = browserWindow.setTimeout(() => {
		frame = browserWindow.requestAnimationFrame(() => {
			if (browserWindow.location.href !== url.href) {
				return;
			}
			browserWindow.scrollTo({ top: 0, left: 0, behavior: 'instant' });
			const target = getFragmentTarget(url);
			if (target) {
				frame = browserWindow.requestAnimationFrame(() => focusAndScroll(target));
			}
		});
	}, 0);
	return () => {
		browserWindow.clearTimeout(task);
		browserWindow.cancelAnimationFrame(frame);
	};
};

export const scrollToFragment = (event: MouseEvent): void => {
	const link = event.currentTarget as HTMLAnchorElement;
	if (
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey ||
		(link.target && link.target !== '_self') ||
		link.hasAttribute('download')
	) {
		return;
	}

	const url = new URL(link.href);
	const browserWindow = getWindow();
	const currentUrl = new URL(browserWindow.location.href);
	if (!url.hash || url.origin !== currentUrl.origin || url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
		return;
	}

	if (!getFragmentTarget(url)) {
		return;
	}

	event.preventDefault();

	const scroll = (): void => {
		const target = getFragmentTarget(url);
		if (!target || browserWindow.location.href !== url.href) {
			return;
		}

		focusAndScroll(target);
	};

	if (url.hash === currentUrl.hash) {
		scroll();
		return;
	}

	// Inertia replaces hash-only visits, so create the history entry before syncing its page URL.
	browserWindow.history.pushState(browserWindow.history.state, '', browserWindow.location.href);
	router.replace({
		url: `${url.pathname}${url.search}${url.hash}`,
		preserveState: true,
		preserveScroll: true,
		viewTransition: false,
		onFinish: scroll,
	});
};
