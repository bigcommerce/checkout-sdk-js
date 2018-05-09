import { find } from 'lodash';

import { selector } from '../common/selector';

import PaymentMethod from './payment-method';
import PaymentMethodsMeta from './payment-methods-meta';

/**
 * @todo Convert this file into TypeScript properly
 */
@selector
export default class PaymentMethodSelector {
    /**
     * @constructor
     * @param {PaymentMethodsState} paymentMethods
     * @param {OrderState} order
     */
    constructor(
        private _paymentMethods: any = {},
        private _order: any = {}
    ) {}

    getPaymentMethods(): PaymentMethod[] {
        return this._paymentMethods.data;
    }

    getPaymentMethodsMeta(): PaymentMethodsMeta {
        return this._paymentMethods.meta;
    }

    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined {
        const predicate = gatewayId ?
            { id: methodId, gateway: gatewayId } :
            { id: methodId };

        return find(this._paymentMethods.data, predicate);
    }

    getSelectedPaymentMethod(): PaymentMethod | undefined {
        if (!this._order.data || !this._order.data.payment) {
            return;
        }

        return this.getPaymentMethod(
            this._order.data.payment.id,
            this._order.data.payment.gateway
        );
    }

    getLoadError(): Error | undefined {
        return this._paymentMethods.errors && this._paymentMethods.errors.loadError;
    }

    getLoadMethodError(methodId?: string): Error | undefined {
        if (!this._paymentMethods.errors ||
            (methodId && this._paymentMethods.errors.loadMethodId !== methodId)) {
            return;
        }

        return this._paymentMethods.errors.loadMethodError;
    }

    isLoading(): boolean {
        return !!(this._paymentMethods.statuses && this._paymentMethods.statuses.isLoading);
    }

    isLoadingMethod(methodId?: string): boolean {
        if (!this._paymentMethods.statuses ||
            (methodId && this._paymentMethods.statuses.loadingMethod !== methodId)) {
            return false;
        }

        return !!this._paymentMethods.statuses.isLoadingMethod;
    }
}
