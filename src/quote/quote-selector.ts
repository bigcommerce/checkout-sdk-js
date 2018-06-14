import { InternalAddress } from '../address';
import { BillingAddressSelector } from '../billing';
import { CheckoutState } from '../checkout';
import { selector } from '../common/selector';
import { ShippingAddressSelector, ShippingOptionSelector } from '../shipping';

import InternalQuote from './internal-quote';

@selector
export default class QuoteSelector {
    constructor(
        private _checkout: CheckoutState,
        private _billingAddressSelector: BillingAddressSelector,
        private _shippingAddressSelector: ShippingAddressSelector,
        private _shippingOptionSelector: ShippingOptionSelector
    ) {}

    getQuote(): InternalQuote | undefined {
        if (!this._checkout.data) {
            return;
        }
        const shippingOption = this._shippingOptionSelector.getSelectedShippingOption();

        return {
            shippingOption: shippingOption && shippingOption.id,
            orderComment: this._checkout.data.customerMessage,
            shippingAddress: this._shippingAddressSelector.getShippingAddress() || {} as InternalAddress,
            billingAddress: this._billingAddressSelector.getBillingAddress() || {}  as InternalAddress,
        };
    }

    getLoadError(): Error | undefined {
        return this._checkout.errors.loadError;
    }

    isLoading(): boolean {
        return !! this._checkout.statuses.isLoading;
    }
}
