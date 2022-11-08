import BodlService from "./bodl-service";
import NoopBodlService from "./noop-bodl-service";
import BodlEmitterService from "./bodl-emitter-service";
import { isBodlEnabled } from "./is-bodl-enabled";
import { CheckoutSelectors } from "../checkout";

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
 * @param {CheckoutService} checkoutService - An instance of CheckoutService
 * @returns an instance of `BodlService`.
 */
export default function createBodlService(
    subscribe: (subscriber: (state: CheckoutSelectors) => void) => void,
): BodlService {
    if (isBodlEnabled(window)) {
        return new BodlEmitterService(
            subscribe,
            window.bodlEvents.checkout
        );
    }

    return new NoopBodlService();
}
