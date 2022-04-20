export interface AnalyticsTracker {
    track(step: string, data: any): void;
}

export default interface AnalyticsTrackerWindow extends Window {
    analytics: AnalyticsTracker;
}
