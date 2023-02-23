export interface AnalyticsTracker {
    track(step: string, data: unknown): void;
}

export default interface AnalyticsTrackerWindow extends Window {
    analytics: AnalyticsTracker;
}
