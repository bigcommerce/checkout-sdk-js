// TODO: CHECKOUT-9979 remove this file before delivery
import {
    B2B_DEV_MODE_APP_CLIENT_ID,
    B2B_DEV_MODE_BASE_URL,
    B2B_DEV_MODE_URL_PARAM,
} from './b2b-dev-mode-constants';

/**
 * Returns true if `enableB2bDevMode` is present in the current URL's query string.
 * SSR-safe: returns false when `window` is undefined.
 */
export function isB2bDevModeEnabled(): boolean {
    if (typeof window === 'undefined' || !window.location) {
        return false;
    }

    try {
        const params = new URLSearchParams(window.location.search);

        if (params.has(B2B_DEV_MODE_URL_PARAM)) {
            console.log('B2B Dev Mode Enabled'); // eslint-disable-line no-console

            return true;
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Returns the dev-mode app client id if dev mode is enabled, otherwise `fallback`.
 */
export function resolveB2bAppClientId(fallback: string): string {
    return isB2bDevModeEnabled() ? B2B_DEV_MODE_APP_CLIENT_ID : fallback;
}

/**
 * Returns the dev-mode B2B base URL if dev mode is enabled, otherwise `fallback`.
 */
export function resolveB2bBaseUrl(fallback: string): string {
    return isB2bDevModeEnabled() ? B2B_DEV_MODE_BASE_URL : fallback;
}
