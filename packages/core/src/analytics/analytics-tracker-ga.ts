import {
    AnalyticsTrackerWindow,
    isAnalyticsTrackerWindow,
} from '@bigcommerce/checkout-sdk/analytics';

interface AnalyticsTrackerWindowGA extends AnalyticsTrackerWindow {
    ga(command: string, eventName: string, payload: AnalyticPayload): void;
}

function isAnalyticsTrackerWindowGA(
    window: Window | AnalyticsTrackerWindowGA,
): window is AnalyticsTrackerWindowGA {
    return window && 'ga' in window && typeof window.ga === 'function';
}

export function isGoogleAnalyticsAvailable(): boolean {
    return isAnalyticsTrackerWindow(window) && isAnalyticsTrackerWindowGA(window);
}

export function sendGoogleAnalytics(type: string, payload: AnalyticPayload): void {
    if (isAnalyticsTrackerWindowGA(window)) {
        window.ga('send', type, {
            ...payload,
            nonInteraction: false,
        });
    }
}

/**
 * Max size of the payload for the Google Analytics module
 * if the limit will be succeeded, the GA throwing a silent error,
 * and only in debug mode you can see it
 */
export function isPayloadSizeLimitReached(obj: AnalyticPayload): boolean {
    const ANALYTICS_MAX_URI_LENGTH = 8096;

    return serializeAnalyticsEventPayload(obj).length >= ANALYTICS_MAX_URI_LENGTH;
}

function serializeAnalyticsEventPayload(obj: AnalyticPayload): string {
    return Object.keys(obj)
        .reduce((acc: string[], key) => {
            const type = typeof obj[key];

            if (type === 'string' || type === 'number') {
                return [...acc, `${key}=${obj[key]}`];
            }

            if (type === 'object' && obj[key] !== null) {
                return [...acc, serializeAnalyticsEventPayload(obj[key] as AnalyticPayload)];
            }

            return acc;
        }, [])
        .join('&');
}

interface AnalyticPayload {
    [key: string]: unknown;
}
