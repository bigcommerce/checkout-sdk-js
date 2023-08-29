import { CheckoutSelectors } from '../checkout';

import BodlEmitterService from './bodl-emitter-service';
import BodlService from './bodl-service';
import { isBodlEnabled } from './is-bodl-enabled';
import NoopBodlService from './noop-bodl-service';

/**
 * Creates an instance of `BodlService`.
 *
 * @remarks
 *
 * ```js
 * const bodlService = BodlService();
 * bodlService.checkoutBegin();
 *
 * ```
 *
 * @param subscribe - The callback function, what get a subscriber as a property, that subscribes to state changes.
 * @returns an instance of `BodlService`.
 */
export default function createBodlService(
    subscribe: (subscriber: (state: CheckoutSelectors) => void) => void,
): BodlService {
    if (isBodlEnabled(window)) {
        return new BodlEmitterService(subscribe, window.bodlEvents.checkout);
    }

    return new NoopBodlService();
}
