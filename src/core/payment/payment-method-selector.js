import { find } from 'lodash';

export default class PaymentMethodSelector {
    /**
     * @constructor
     * @param {PaymentMethodsState} paymentMethods
     * @param {OrderState} order
     */
    constructor(paymentMethods = {}, order = {}) {
        this._paymentMethods = paymentMethods;
        this._order = order;
    }

    /**
     * @return {PaymentMethod[]}
     */
    getPaymentMethods() {
        return this._paymentMethods.data;
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {?PaymentMethod}
     */
    getPaymentMethod(methodId, gatewayId) {
        const predicate = gatewayId ?
            { id: methodId, gateway: gatewayId } :
            { id: methodId };

        return find(this._paymentMethods.data, predicate);
    }

    /**
     * @return {?PaymentMethod}
     */
    getSelectedPaymentMethod() {
        if (!this._order.data || !this._order.data.payment) {
            return;
        }

        return this.getPaymentMethod(
            this._order.data.payment.id,
            this._order.data.payment.gateway
        );
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._paymentMethods.errors && this._paymentMethods.errors.loadError;
    }

    /**
     * @param {string} [methodId]
     * @return {?ErrorResponse}
     */
    getLoadMethodError(methodId) {
        if (!this._paymentMethods.errors ||
            (methodId && this._paymentMethods.errors.loadMethod !== methodId)) {
            return;
        }

        return this._paymentMethods.errors.loadMethodError;
    }

    /**
     * @param {string} [methodId]
     * @return {?ErrorResponse}
     */
    getInitializeError(methodId) {
        if (!this._paymentMethods.errors ||
            (methodId && this._paymentMethods.errors.initializeMethod !== methodId)) {
            return;
        }

        return this._paymentMethods.errors.initializeError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._paymentMethods.statuses && this._paymentMethods.statuses.isLoading);
    }

    /**
     * @param {string} [methodId]
     * @return {boolean}
     */
    isLoadingMethod(methodId) {
        if (!this._paymentMethods.statuses ||
            (methodId && this._paymentMethods.statuses.loadingMethod !== methodId)) {
            return false;
        }

        return !!this._paymentMethods.statuses.isLoadingMethod;
    }

    /**
     * @param {string} [methodId]
     * @return {boolean}
     */
    isInitializingMethod(methodId) {
        if (!this._paymentMethods.statuses ||
            (methodId && this._paymentMethods.statuses.initializingMethod !== methodId)) {
            return false;
        }

        return !!this._paymentMethods.statuses.isInitializing;
    }
}
