import { find } from 'lodash';

export default class PaymentMethodSelector {
    /**
     * @constructor
     * @param {PaymentMethodsState} paymentMethods
     * @param {OrderState} order
     */
    constructor(paymentMethods = {}, order = {}) {
        this._paymentMethods = paymentMethods.data;
        this._order = order.data;
        this._errors = paymentMethods.errors;
        this._statuses = paymentMethods.statuses;
    }

    /**
     * @return {PaymentMethod[]}
     */
    getPaymentMethods() {
        return this._paymentMethods;
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {?PaymentMethod}
     */
    getPaymentMethod(methodId, gatewayId) {
        const predicate = gatewayId ? { id: methodId, gateway: gatewayId } : { id: methodId };

        return find(this._paymentMethods, predicate);
    }

    /**
     * @return {?PaymentMethod}
     */
    getSelectedPaymentMethod() {
        if (!this._order.payment) {
            return;
        }

        return this.getPaymentMethod(this._order.payment.id, this._order.payment.gateway);
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @param {string} [methodId]
     * @return {?ErrorResponse}
     */
    getLoadMethodError(methodId) {
        if (!this._errors || (methodId && this._errors.failedMethod !== methodId)) {
            return;
        }

        return this._errors.loadMethodError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }

    /**
     * @param {string} [methodId]
     * @return {boolean}
     */
    isLoadingMethod(methodId) {
        if (!this._statuses || (methodId && this._statuses.loadingMethod !== methodId)) {
            return false;
        }

        return !!this._statuses.isLoadingMethod;
    }
}
