import { isFunction } from 'lodash';

export interface AnalyticsTracker {
    track(step: string, data: any): void;
}

export default interface AnalyticsTrackerWindow extends Window {
    analytics: AnalyticsTracker;
    ga(command: string, eventName: string, payload: any): void;
}

export const analyticsHit = (type: string, payload: any) => {
    const _window = window as unknown as AnalyticsTrackerWindow;

    if (!isFunction(_window?.ga)) {
        return ;
    }

    _window?.ga('send', type, {
        ...payload,
        nonInteraction: false,
    });
};

/**
 * Max size of the payload for the Google analytics module
 * if the limit will be succeeded, the GA throwing a silent error,
 * and only in debug mode you can see it
 */
export const ANALYTICS_MAX_URI_LENGTH = 8096;

export const hasPayloadLimit = (obj: any) => (
    serializeAnalyticsEventPayload(obj).length >= ANALYTICS_MAX_URI_LENGTH
);

const serializeAnalyticsEventPayload = (obj: Record<string, any>): string => {
    return Object.keys(obj).reduce((acc: string[], key) => {
        const type: string = typeof obj[key];

        if (type === 'string' || type === 'number') {
            return [
                ...acc,
                `${key}=${obj[key]}`,
            ];
        }

        if (type === 'object') {
            return [
                ...acc,
                serializeAnalyticsEventPayload(obj[key]),
            ];
        }

        return acc;
    }, []).join('&');
};
