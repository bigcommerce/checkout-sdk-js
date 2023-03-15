import AnalyticsTrackerWindow from './analytics-tracker-window';
import { isAnalyticsTrackerWindow } from './is-analytics-step-tracker-window';

describe('isAnalyticsTrackerWindow', () => {
    it('window has analytics option', () => {
        expect(isAnalyticsTrackerWindow({ analytics: {} } as AnalyticsTrackerWindow)).toBe(true);
    });

    it('window does not have analytics option', () => {
        expect(isAnalyticsTrackerWindow({} as Window)).toBe(false);
    });
});
