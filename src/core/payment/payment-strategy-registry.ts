import { some } from 'lodash';
import { PaymentMethodNotRegistrableError, PaymentMethodUnsupportedError } from './errors';
import * as paymentMethodTypes from './payment-method-types';
import PaymentMethod from './payment-method';
import PaymentStrategy from './strategies/payment-strategy';

export default class PaymentStrategyRegistry {
    private _factories: { [key: string]: Factory } = {};
    private _strategies: { [key: string]: PaymentStrategy } = {};
    private _clientSidePaymentProviders?: string[];

    constructor(config: RegistryOptions = {}) {
        this._clientSidePaymentProviders = config.clientSidePaymentProviders;
    }

    register(name: string, factory: Factory) {
        if (this._factories[name]) {
            throw new PaymentMethodNotRegistrableError(name);
        }

        this._factories[name] = factory;
    }

    getStrategy(paymentMethod: PaymentMethod): PaymentStrategy {
        const key = this._getKey(paymentMethod);

        if (!this._strategies[key]) {
            this._strategies[key] = this._createStrategy(paymentMethod);
        }

        return this._strategies[key];
    }

    private _createStrategy(paymentMethod: PaymentMethod): PaymentStrategy {
        const factory = this._getFactory(paymentMethod);

        if (!factory) {
            throw new PaymentMethodUnsupportedError(paymentMethod.id);
        }

        return factory(paymentMethod);
    }

    private _getFactory(paymentMethod: PaymentMethod): Factory {
        const key = this._getKey(paymentMethod);

        if (this._factories[key]) {
            return this._factories[key];
        }

        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return this._factories.offline;
        }

        if (this._isLegacyMethod(paymentMethod)) {
            return this._factories.legacy;
        }

        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return this._factories.offsite;
        }

        return this._factories.creditcard;
    }

    private _getKey(paymentMethod: PaymentMethod): string {
        return paymentMethod.gateway || paymentMethod.id;
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

type Factory = (method: PaymentMethod) => PaymentStrategy;

interface RegistryOptions {
    clientSidePaymentProviders?: string[];
}
