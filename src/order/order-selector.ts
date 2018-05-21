import { CartState } from '../cart';
import { selector } from '../common/selector';
import { CustomerState } from '../customer';
import { PaymentMethod } from '../payment';
import * as paymentStatusTypes from '../payment/payment-status-types';

import InternalOrder, { InternalOrderMeta, InternalOrderPayment } from './internal-order';
import OrderState from './order-state';

@selector
export default class OrderSelector {
    constructor(
        private _order: OrderState,
        private _customer: CustomerState,
        private _cart: CartState
    ) {}

    getOrder(): InternalOrder | undefined {
        return this._order.data;
    }

    getOrderMeta(): InternalOrderMeta {
        return {
            deviceFingerprint: this._order.meta && this._order.meta.deviceFingerprint,
        };
    }

    getPaymentAuthToken(): string | undefined {
        return this._order.meta && this._order.meta.token;
    }

    getInternalOrderPayment(): InternalOrderPayment | undefined {
        return this._order.meta && this._order.meta.payment;
    }

    isPaymentDataRequired(useStoreCredit: boolean = false): boolean {
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
        return this._order.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._order.statuses.isLoading;
    }
}
