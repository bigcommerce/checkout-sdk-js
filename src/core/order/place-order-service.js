import { omit, pick } from 'lodash';

export default class PlaceOrderService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentActionCreator} paymentActionCreator
     */
    constructor(store, orderActionCreator, paymentActionCreator) {
        this._store = store;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
    }

    /**
     * @todo Remove `shouldVerifyCart` flag in the future. Always verify cart by default
     * @param {OrderRequestBody} payload
     * @param {boolean} [shouldVerifyCart=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    submitOrder(payload, shouldVerifyCart = false, options) {
        const { checkout } = this._store.getState();
        const action = this._orderActionCreator.submitOrder(
            payload,
            shouldVerifyCart ? checkout.getCart() : undefined,
            options
        );

        return this._store.dispatch(action);
    }

    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    finalizeOrder(orderId, options) {
        return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
    }

    /**
     * @param {Payment} payment
     * @param {boolean} [useStoreCredit=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    submitPayment(payment, useStoreCredit = false, options) {
        const { checkout } = this._store.getState();

        if (!checkout.isPaymentRequired(useStoreCredit)) {
            return Promise.resolve(this._store.getState());
        }

        const payload = this._getPaymentRequestBody(payment);

        return this._store.dispatch(this._paymentActionCreator.submitPayment(payload, options))
            .then(({ checkout }) => {
                const { orderId } = checkout.getOrder();

                return this._store.dispatch(this._orderActionCreator.loadOrder(orderId, options));
            });
    }

    /**
     * @param {Payment} payment
     * @param {boolean} [useStoreCredit=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeOffsitePayment(payment, useStoreCredit = false, options) {
        const { checkout } = this._store.getState();

        if (!checkout.isPaymentRequired(useStoreCredit)) {
            return Promise.resolve(this._store.getState());
        }

        const payload = this._getPaymentRequestBody(payment);

        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload, options));
    }

    /**
     * @private
     * @param {Payment} payment
     * @return {PaymentRequestBody}
     */
    _getPaymentRequestBody(payment) {
        const { checkout } = this._store.getState();
        const deviceSessionId = payment.paymentData && payment.paymentData.deviceSessionId || checkout.getCheckoutMeta().deviceSessionId;

        return {
            authToken: checkout.getCheckoutMeta().paymentAuthToken,
            billingAddress: checkout.getBillingAddress(),
            cart: checkout.getCart(),
            customer: checkout.getCustomer(),
            order: checkout.getOrder(),
            orderMeta: pick(checkout.getCheckoutMeta(), [
                'deviceFingerprint',
            ]),
            payment: omit(payment.paymentData, ['deviceSessionId']),
            paymentMethod: checkout.getPaymentMethod(payment.name, payment.gateway),
            quoteMeta: {
                request: {
                    ...pick(checkout.getCheckoutMeta(), [
                        'geoCountryCode',
                        'sessionHash',
                    ]),
                    deviceSessionId,
                },
            },
            shippingAddress: checkout.getShippingAddress(),
            shippingOption: checkout.getSelectedShippingOption(),
            source: payment.source || 'bcapp-checkout-uco',
            store: pick(checkout.getConfig(), [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }
}
