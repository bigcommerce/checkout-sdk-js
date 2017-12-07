import { some } from 'lodash';
import * as paymentMethodTypes from './payment-method-types';

export default class PaymentStrategyRegistry {
    /**
     * @constructor
     * @param {Object} [config]
     * @param {string[]} [config.clientSidePaymentProviders]
     */
    constructor(config = {}) {
        this._strategies = {};
        this._clientSidePaymentProviders = config.clientSidePaymentProviders;
    }

    /**
     * @param {string} name
     * @param {PaymentStrategy} strategy
     * @return {void}
     * @throws {Error}
     */
    addStrategy(name, strategy) {
        if (this._strategies[name]) {
            throw new Error(`"${name}" payment strategy is already registered`);
        }

        this._strategies[name] = strategy;
    }

    /**
     * @param {string} name
     * @return {PaymentStrategy}
     * @throws {Error}
     */
    getStrategy(name) {
        if (!this._strategies[name]) {
            throw new Error(`"${name}" payment strategy could not be found`);
        }

        return this._strategies[name];
    }

    /**
     * @param {PaymentMethod} paymentMethod
     * @return {PaymentStrategy}
     */
    getStrategyByMethod(paymentMethod) {
        try {
            return this.getStrategy(paymentMethod.id);
        } catch (error) {
            if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
                return this.getStrategy('offline');
            }

            if (!this._isClientSidePaymentSupported(paymentMethod)) {
                return this.getStrategy('legacy');
            }

            if (paymentMethod.type === paymentMethodTypes.HOSTED) {
                return this.getStrategy('offsite');
            }

            return this.getStrategy('creditcard');
        }
    }

    /**
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {boolean}
     */
    _isClientSidePaymentSupported(paymentMethod) {
        if (!this._clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return true;
        }

        return some(this._clientSidePaymentProviders, (id) =>
            paymentMethod.id === id || paymentMethod.gateway === id
        );
    }
}
