import { find } from 'lodash';

import { selector } from '../common/selector';

import PaymentMethod from './payment-method';
import PaymentMethodMeta from './payment-method-meta';
import PaymentMethodState from './payment-method-state';

@selector
export default class PaymentMethodSelector {
    constructor(
        private _paymentMethods: PaymentMethodState
    ) {}

    getPaymentMethods(): PaymentMethod[] | undefined {
        return this._paymentMethods.data;
    }

    getPaymentMethodsMeta(): PaymentMethodMeta | undefined {
        return this._paymentMethods.meta;
    }

    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined {
        return gatewayId ?
            find(this._paymentMethods.data, { id: methodId, gateway: gatewayId }) :
            find(this._paymentMethods.data, { id: methodId });
    }

    getLoadError(): Error | undefined {
        return this._paymentMethods.errors && this._paymentMethods.errors.loadError;
    }

    getLoadMethodError(methodId?: string): Error | undefined {
        if (methodId && this._paymentMethods.errors.loadMethodId !== methodId) {
            return;
        }

        return this._paymentMethods.errors.loadMethodError;
    }

    isLoading(): boolean {
        return !!this._paymentMethods.statuses.isLoading;
    }

    isLoadingMethod(methodId?: string): boolean {
        if (methodId && this._paymentMethods.statuses.loadMethodId !== methodId) {
            return false;
        }

        return !!this._paymentMethods.statuses.isLoadingMethod;
    }
}
