import { find } from 'lodash';

import { HOSTED } from '../payment/payment-method-types';

import Checkout, { CheckoutPayment } from './checkout';
import CheckoutState from './checkout-state';

export default class CheckoutSelector {
    constructor(
        private _checkout: CheckoutState
    ) {}

    getCheckout(): Checkout | undefined {
        return this._checkout.data;
    }

    getHostedPayment(): CheckoutPayment | undefined {
        const payments = this._checkout.data && this._checkout.data.payments;

        return find(payments, { providerType: HOSTED });
    }

    getLoadError(): Error | undefined {
        return this._checkout.errors.loadError;
    }

    isLoading(): boolean {
        return this._checkout.statuses.isLoading === true;
    }
}
