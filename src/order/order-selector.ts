import * as paymentStatusTypes from '../payment/payment-status-types';

import { PaymentMethod } from '../payment';

import InternalOrder from './internal-order';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class OrderSelector {
    /**
     * @constructor
     * @param {OrderState} order
     * @param {CustomerState} customer
     * @param {CartState} cart
     */
    constructor(
        private _order: any = {},
        private _customer: any = {},
        private _cart: any = {}
    ) {}

    getOrder(): InternalOrder {
        return this._order.data;
    }

    /**
     * @return {Object}
     */
    getOrderMeta(): any {
        return {
            deviceFingerprint: this._order.meta && this._order.meta.deviceFingerprint,
        };
    }

    getPaymentAuthToken(): string | undefined {
        return this._order.meta && this._order.meta.token;
    }

    isPaymentDataRequired(useStoreCredit: boolean): boolean {
        const grandTotal = this._cart.data && this._cart.data.grandTotal && this._cart.data.grandTotal.amount || 0;
        const storeCredit = this._customer.data && this._customer.data.storeCredit || 0;

        return (useStoreCredit ? grandTotal - storeCredit : grandTotal) > 0;
    }

    isPaymentDataSubmitted(paymentMethod?: PaymentMethod): boolean {
        const { payment = {} } = this.getOrder() || {};

        return !!(paymentMethod && paymentMethod.nonce) ||
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE;
    }

    getLoadError(): Error | undefined {
        return this._order.errors && this._order.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._order.statuses && this._order.statuses.isLoading);
    }
}
