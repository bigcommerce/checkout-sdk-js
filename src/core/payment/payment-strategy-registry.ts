import { some } from 'lodash';
import { Registry } from '../common/registry';
import * as paymentMethodTypes from './payment-method-types';
import PaymentMethod from './payment-method';
import PaymentStrategy from './strategies/payment-strategy';

export default class PaymentStrategyRegistry extends Registry<PaymentStrategy> {
    private _clientSidePaymentProviders?: string[];

    constructor(options: RegistryOptions = {}) {
        super();

        this._clientSidePaymentProviders = options.clientSidePaymentProviders;
    }

    getByMethod(paymentMethod: PaymentMethod): PaymentStrategy {
        const token = this._getToken(paymentMethod);
        const cacheToken = paymentMethod.gateway || paymentMethod.id;

        return this.get(token, cacheToken);
    }

    private _getToken(paymentMethod: PaymentMethod): string {
        const methodId = paymentMethod.gateway || paymentMethod.id;

        if (this.hasFactory(methodId)) {
            return methodId;
        }

        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return 'offline';
        }

        if (this._isLegacyMethod(paymentMethod)) {
            return 'legacy';
        }

        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return 'offsite';
        }

        return 'creditcard';
    }

    private _isLegacyMethod(paymentMethod: PaymentMethod): boolean {
        if (!this._clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return false;
        }

        return !some(this._clientSidePaymentProviders, (id) =>
            paymentMethod.id === id || paymentMethod.gateway === id
        );
    }
}

export interface RegistryOptions {
    clientSidePaymentProviders?: string[];
}
