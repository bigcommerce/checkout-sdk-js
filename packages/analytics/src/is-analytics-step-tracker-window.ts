import AnalyticsTrackerWindow from './analytics-tracker-window';

export function isAnalyticsTrackerWindow(window: Window): window is AnalyticsTrackerWindow {
    return Boolean(window.hasOwnProperty('analytics'));
}
