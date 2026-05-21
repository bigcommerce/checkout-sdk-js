// TODO: CHECKOUT-9979 remove this file before delivery
//
// Client-side override for capability flags while the API is pending. Mirrors
// the helper in the consumer (checkout-js).
//
// Usage: append `?capabilitiesOverride=<url-encoded-json>` to the checkout
// URL, e.g.
//   ?capabilitiesOverride=%7B%22payment%22%3A%7B%22b2bPaymentMethodFilter%22%3Atrue%7D%7D
// Only the keys present in the JSON are overridden; all other values come
// from the API.

import { Capabilities } from '../config/capabilities';

const OVERRIDE_QUERY_PARAM = 'capabilitiesOverride';

type CapabilitiesOverride = {
    [K in keyof Capabilities]?: Partial<Capabilities[K]>;
};

function parseOverride(): CapabilitiesOverride | undefined {
    if (typeof window === 'undefined' || !window.location) {
        return undefined;
    }

    let raw: string | null;

    try {
        raw = new URLSearchParams(window.location.search).get(OVERRIDE_QUERY_PARAM);
    } catch {
        return undefined;
    }

    if (!raw) {
        return undefined;
    }

    try {
        const parsed: unknown = JSON.parse(raw);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as CapabilitiesOverride;
        }
    } catch {
        // Malformed override — fall back to API-provided capabilities.
    }

    return undefined;
}

/**
 * Returns the API-provided capabilities merged with any client-side override
 * supplied via the `?capabilitiesOverride=<json>` URL param. Only the keys
 * present in the override are merged; all other values pass through from the
 * API. Returns the input unchanged when no override is set.
 */
export function applyCapabilitiesOverride(
    capabilities: Capabilities | undefined,
): Capabilities | undefined {
    const override = parseOverride();

    if (!override) {
        return capabilities;
    }

    return {
        userJourney: { ...capabilities?.userJourney, ...override.userJourney },
        customer: { ...capabilities?.customer, ...override.customer },
        shipping: { ...capabilities?.shipping, ...override.shipping },
        billing: { ...capabilities?.billing, ...override.billing },
        payment: { ...capabilities?.payment, ...override.payment },
        orderConfirmation: {
            ...capabilities?.orderConfirmation,
            ...override.orderConfirmation,
        },
    } as Capabilities;
}
