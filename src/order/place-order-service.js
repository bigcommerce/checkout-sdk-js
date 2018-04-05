import { omit, pick } from 'lodash';
import { MissingDataError } from '../common/error/errors';

export default class PlaceOrderService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {CartActionCreator} cartActionCreator
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentActionCreator} paymentActionCreator
     * @param {PaymentMethodActionCreator} paymentMethodActionCreator
     */
    constructor(store, cartActionCreator, orderActionCreator, paymentActionCreator, paymentMethodActionCreator) {
        this._store = store;
        this._cartActionCreator = cartActionCreator;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
        this._paymentMethodActionCreator = paymentMethodActionCreator;
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
        const cart = checkout.getCart();

        if (!cart) {
            throw new MissingDataError();
        }

        const action = this._orderActionCreator.submitOrder(
            payload,
            shouldVerifyCart ? cart : undefined,
            options
        );

        return this._store.dispatch(action);
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    verifyCart(options) {
        const { checkout } = this._store.getState();
        const action = this._cartActionCreator.verifyCart(checkout.getCart(), options);

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
        const payload = this._getPaymentRequestBody(payment);

        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload, options));
    }

    /**
     * Loads a payment method from the API.
     * @param {string} methodId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadPaymentMethod(methodId, options) {
        const action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    }

    /**
     * @private
     * @param {Payment} payment
     * @return {PaymentRequestBody}
     */
    _getPaymentRequestBody(payment) {
        const { checkout } = this._store.getState();
        const deviceSessionId = payment.paymentData && payment.paymentData.deviceSessionId || checkout.getCheckoutMeta().deviceSessionId;
        const checkoutMeta = checkout.getCheckoutMeta();
        const billingAddress = checkout.getBillingAddress();
        const cart = checkout.getCart();
        const customer = checkout.getCustomer();
        const order = checkout.getOrder();
        const paymentMethod = checkout.getPaymentMethod(payment.name, payment.gateway);
        const shippingAddress = checkout.getShippingAddress();
        const shippingOption = checkout.getSelectedShippingOption();
        const config = checkout.getConfig();

        const authToken = payment.paymentData && payment.paymentData.instrumentId
            ? `${checkoutMeta.paymentAuthToken}, ${checkoutMeta.vaultAccessToken}`
            : checkoutMeta.paymentAuthToken;

        return {
            billingAddress,
            cart,
            customer,
            order,
            paymentMethod: this._getRequestPaymentMethod(paymentMethod),
            shippingAddress,
            shippingOption,
            authToken,
            orderMeta: pick(checkoutMeta, ['deviceFingerprint']),
            payment: omit(payment.paymentData, ['deviceSessionId']),
            quoteMeta: {
                request: {
                    ...pick(checkoutMeta, [
                        'geoCountryCode',
                        'sessionHash',
                    ]),
                    deviceSessionId,
                },
            },
            source: payment.source || 'bcapp-checkout-uco',
            store: pick(config, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    /**
     * Convenience method to transform a payment method into the format expected by the API.
     * @private
     * @param {PaymentMethod} paymentMethod
     * @return {PaymentMethod}
     */
    _getRequestPaymentMethod(paymentMethod) {
        return (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
