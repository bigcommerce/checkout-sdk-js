import { some } from 'lodash';
import { PaymentMethodNotRegistrableError, PaymentMethodUnsupportedError } from './errors';
import * as paymentMethodTypes from './payment-method-types';

export default class PaymentStrategyRegistry {
    /**
     * @constructor
     * @param {Object} [config]
     * @param {string[]} [config.clientSidePaymentProviders]
     */
    constructor(config = {}) {
        this._factories = {};
        this._strategies = {};
        this._clientSidePaymentProviders = config.clientSidePaymentProviders;
    }

    /**
     * @param {string} name
     * @return {function(method: PaymentMethod): PaymentStrategy}
     * @return {void}
     * @throws {PaymentMethodNotRegistrableError}
     */
    register(name, factory) {
        if (this._factories[name]) {
            throw new PaymentMethodNotRegistrableError(name);
        }

        this._factories[name] = factory;
    }

    /**
     * @param {PaymentMethod} paymentMethod
     * @return {PaymentStrategy}
     */
    getStrategy(paymentMethod) {
        const key = this._getKey(paymentMethod);

        if (!this._strategies[key]) {
            this._strategies[key] = this._createStrategy(paymentMethod);
        }

        return this._strategies[key];
    }

    /**
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {PaymentStrategy}
     * @throws {PaymentMethodUnsupportedError}
     */
    _createStrategy(paymentMethod) {
        const factory = this._getFactory(paymentMethod);

        if (!factory) {
            throw new PaymentMethodUnsupportedError(paymentMethod.id);
        }

        return factory(paymentMethod);
    }

    /**
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {function(method: PaymentMethod): PaymentStrategy}
     */
    _getFactory(paymentMethod) {
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

    /**
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {string}
     */
    _getKey(paymentMethod) {
        return paymentMethod.gateway || paymentMethod.id;
    }

    /**
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {boolean}
     */
    _isLegacyMethod(paymentMethod) {
        if (!this._clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return false;
        }

        return !some(this._clientSidePaymentProviders, (id) =>
            paymentMethod.id === id || paymentMethod.gateway === id
        );
    }
}
