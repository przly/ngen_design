import { useSyncExternalStore } from 'react';

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Creates a safe proxy that returns noop functions for any method calls when the target is undefined
 */
const createSafeProxy = <T extends object>(target: T | undefined): T =>
	new Proxy({} as T, {
		get: (_, prop) => {
			if (!target) {
				return () => undefined;
			}
			const value = target[prop as keyof T];
			return typeof value === 'function' ? value.bind(target) : value;
		},
	});

/**
 * Safely get the window object with safe method calls
 * Returns a proxy that can be safely called even in non-browser environments
 */
export const getWindow = (): Window => createSafeProxy(isBrowser() ? window : undefined);

/**
 * Safely get the document object with safe method calls
 * Returns a proxy that can be safely called even in non-browser environments
 */
export const getDocument = (): Document => createSafeProxy(isBrowser() ? document : undefined);

/**
 * React hook for safely accessing window/document after hydration
 * Usage: const window = useBrowser(); // undefined during SSR, Window after hydration
 */
export const useBrowser = () => {
	const isHydrated = useSyncExternalStore(
		() => () => undefined,
		() => isBrowser(),
		() => false,
	);

	return {
		window: isHydrated ? getWindow() : undefined,
		document: isHydrated ? getDocument() : undefined,
		isHydrated,
		isBrowser: isBrowser(),
	};
};

export default {
	getDocument,
	getWindow,
	isBrowser,
	useBrowser,
};
