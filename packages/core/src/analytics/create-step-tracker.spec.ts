import { createCheckoutService, CheckoutService } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { StoreConfig } from '../config';

import AnalyticsStepTracker from './analytics-step-tracker';
import AnalyticsTrackerWindow, { AnalyticsTracker } from './analytics-tracker-window';
import createStepTracker from './create-step-tracker';
import NoopStepTracker from './noop-step-tracker';

declare let window: AnalyticsTrackerWindow;

describe('createStepTracker', () => {
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
    });

    describe('#createStepTracker()', () => {
        describe('when checkoutService has not been initialized', () => {
            it('returns instance of noop logger', () => {
                expect(() => createStepTracker(checkoutService)).toThrowError(MissingDataError);
            });
        });

        describe('when window.analytics is undefined', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: true,
                    },
                } as StoreConfig);
            });

            it('returns instance of noop logger', () => {
                expect(createStepTracker(checkoutService)).toBeInstanceOf(NoopStepTracker);
            });
        });

        describe('when analytics settings is disabled', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: false,
                    },
                } as StoreConfig);

                window.analytics = {} as AnalyticsTracker;
            });

            it('returns instance of noop logger', () => {
                expect(createStepTracker(checkoutService)).toBeInstanceOf(NoopStepTracker);
            });
        });

        describe('when window.analytics is defined and analytics setting enabled', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: true,
                    },
                } as StoreConfig);

                window.analytics = {} as AnalyticsTracker;
            });

            it('returns instance of AnalyticsStepTracker', () => {
                expect(createStepTracker(checkoutService)).toBeInstanceOf(AnalyticsStepTracker);
            });
        });
    });
});
