export interface AnalyticsTracker {
    track(step: string, data: any): void;
    hit(hitName: string, data: any): void;
    hasPayloadLimit(data: any): boolean;
}

export default interface AnalyticsTrackerWindow extends Window {
    analytics: AnalyticsTracker;
}
