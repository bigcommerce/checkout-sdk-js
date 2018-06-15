import { InternalCheckoutSelectors } from '../checkout';
import { selector } from '../common/selector';

import InternalQuote from './internal-quote';
import mapToInternalQuote from './map-to-internal-quote';

/**
 * @deprecated This method will be replaced in the future.
 */
@selector
export default class QuoteSelector {
    constructor(
        private _selectors: InternalCheckoutSelectors
    ) {}

    getQuote(): InternalQuote | undefined {
        const checkout = this._selectors.checkout.getCheckout();

        if (!checkout) {
            return;
        }

        return mapToInternalQuote(checkout);
    }

    getLoadError(): Error | undefined {
        return this._selectors.checkout.getLoadError();
    }

    isLoading(): boolean {
        return !! this._selectors.checkout.isLoading();
    }
}
