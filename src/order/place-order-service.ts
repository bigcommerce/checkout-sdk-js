import { omit, pick } from 'lodash';

import { CartActionCreator } from '../cart';
import { CheckoutSelectors, CheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { Payment, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../payment';
import { CreditCard, VaultedInstrument } from '../payment/payment';

import OrderActionCreator from './order-action-creator';
import OrderRequestBody from './order-request-body';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PlaceOrderService {
    constructor(
        private _store: CheckoutStore,
        private _cartActionCreator: CartActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {}

    /**
     * @todo Remove `shouldVerifyCart` flag in the future. Always verify cart by default
     */
    submitOrder(payload: OrderRequestBody, shouldVerifyCart: boolean = false, options?: RequestOptions): Promise<CheckoutSelectors> {
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

    verifyCart(options?: RequestOptions): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const action = this._cartActionCreator.verifyCart(checkout.getCart(), options);

        return this._store.dispatch(action);
    }

    finalizeOrder(orderId: number, options: RequestOptions): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
    }

    submitPayment(payment: Payment, useStoreCredit: boolean = false, options?: RequestOptions): Promise<CheckoutSelectors> {
        const payload = this._getPaymentRequestBody(payment);

        return this._store.dispatch(this._paymentActionCreator.submitPayment(payload))
            .then(({ checkout }: any) => {
                const { orderId } = checkout.getOrder();

                return this._store.dispatch(this._orderActionCreator.loadOrder(orderId, options));
            });
    }

    initializeOffsitePayment(payment: Payment, useStoreCredit: boolean = false): Promise<CheckoutSelectors> {
        const payload = this._getPaymentRequestBody(payment);

        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload));
    }

    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<CheckoutSelectors> {
        const action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    }

    private _getPaymentRequestBody(payment: Payment): any {
        const { checkout } = this._store.getState();
        const deviceSessionId = payment.paymentData && (payment.paymentData as CreditCard).deviceSessionId || checkout.getCheckoutMeta().deviceSessionId;
        const checkoutMeta = checkout.getCheckoutMeta();
        const billingAddress = checkout.getBillingAddress();
        const cart = checkout.getCart();
        const customer = checkout.getCustomer();
        const order = checkout.getOrder();
        const paymentMethod = checkout.getPaymentMethod(payment.name, payment.gateway);
        const shippingAddress = checkout.getShippingAddress();
        const shippingOption = checkout.getSelectedShippingOption();
        const config = checkout.getConfig();

        const authToken = payment.paymentData && (payment.paymentData as VaultedInstrument).instrumentId
            ? `${checkoutMeta.paymentAuthToken}, ${checkoutMeta.vaultAccessToken}`
            : checkoutMeta.paymentAuthToken;

        return {
            billingAddress,
            cart,
            customer,
            order,
            paymentMethod: this._getRequestPaymentMethod(paymentMethod!),
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

    private _getRequestPaymentMethod(paymentMethod: PaymentMethod): PaymentMethod {
        return (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
