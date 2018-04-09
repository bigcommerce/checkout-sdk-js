import { omit, pick } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { Payment, PaymentActionCreator, PaymentMethod } from '../payment';
import { CreditCard, VaultedInstrument } from '../payment/payment';

import OrderActionCreator from './order-action-creator';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PlaceOrderService {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

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

        if (!paymentMethod) {
            throw new MissingDataError(`Unable to submit payment because "paymentMethod (${payment.name})" data is missing.`);
        }

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

    private _getRequestPaymentMethod(paymentMethod: PaymentMethod): PaymentMethod {
        return (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
