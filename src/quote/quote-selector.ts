import { selector } from '../common/selector';
import { ShippingAddressSelector } from '../shipping';

import InternalQuote from './internal-quote';
import QuoteState from './quote-state';

@selector
export default class QuoteSelector {
    constructor(
        private _quote: QuoteState,
        private _shippingAddressSelector: ShippingAddressSelector
    ) {}

    getQuote(): InternalQuote | undefined {
        if (!this._quote.data) {
            return;
        }

        return {
            ...this._quote.data,
            shippingAddress: this._shippingAddressSelector.getShippingAddress(),
        };
    }

    getLoadError(): Error | undefined {
        return this._quote.errors.loadError;
    }

    isLoading(): boolean {
        return !! this._quote.statuses.isLoading;
    }
}
