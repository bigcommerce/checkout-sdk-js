import localStorageFallback from 'local-storage-fallback';

import { CheckoutService } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import AnalyticsStepTracker, { StepTrackerConfig } from './analytics-step-tracker';
import { isAnalyticsTrackerWindow } from './is-analytics-step-tracker-window';
import NoopStepTracker from './noop-step-tracker';
import StepTracker from './step-tracker';

/**
 * Creates an instance of `StepTracker`.
 *
 * @remarks
 * ```js
 * const checkoutService = createCheckoutService();
 * await checkoutService.loadCheckout();
 * const stepTracker = createStepTracker(checkoutService);
 *
 * stepTracker.trackCheckoutStarted();
 * ```
 *
 * @alpha
 * Please note that `StepTracker` is currently in an early stage
 * of development. Therefore the API is unstable and not ready for public
 * consumption.
 *
 * @param CheckoutService - An instance of CheckoutService
 * @param StepTrackerConfig - A step tracker config object
 * @returns an instance of `StepTracker`.
 */
export default function createStepTracker(
    checkoutService: CheckoutService,
    stepTrackerConfig?: StepTrackerConfig
): StepTracker {
    const { data } = checkoutService.getState();
    const config = data.getConfig();

    if (!config) {
        throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
    }

    const { isAnalyticsEnabled } = config.checkoutSettings;

    if (isAnalyticsEnabled && isAnalyticsTrackerWindow(window)) {
        return new AnalyticsStepTracker(
            checkoutService,
            localStorageFallback,
            window.analytics,
            stepTrackerConfig
        );
    }

    return new NoopStepTracker();
}
